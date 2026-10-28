import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Cart, CartItem } from '../types';
import * as cartApi from '../api/cartApi';
import { invalidateAuthToken } from '../api/httpClient';
import { useCountry } from './CountryContext';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  addItem: (productId: string, qty: number, snap?: CartItemSnapshot) => Promise<void>;
  updateItem: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  setBoxItem: (
    productId: string,
    boxType: 'SMALL_BOX' | 'BIG_BOX',
    qty: number,
    weightKg: number | null,
    snap?: CartItemSnapshot
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Product data the UI already has when the user taps Add. Used to build the
 * optimistic cart line so prices/names/images are correct instantly — even if
 * the server sync lags or fails, the order summary never shows ₹0 placeholders.
 */
export interface CartItemSnapshot {
  name: string;
  unitPrice: number;
  unit: string;
  imageUrl: string | null;
  oldPrice: number | null;
}

function makeTempItem(
  productId: string,
  qty: number,
  snap: CartItemSnapshot | undefined,
  boxType: 'SMALL_BOX' | 'BIG_BOX' | null,
  weightKg: number | null
): CartItem {
  const unitPrice = (snap && typeof snap.unitPrice === 'number') ? snap.unitPrice : 0;
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productId,
    name: snap?.name ?? '',
    unitPrice,
    unit: snap?.unit ?? '',
    qty,
    imageUrl: snap?.imageUrl ?? null,
    oldPrice: snap?.oldPrice ?? null,
    weightKg,
    boxType,
    lineTotal: unitPrice * qty,
  };
}

/** Ignore out-of-order cart mutations so an older reply can't revert a newer click. */
const mutationSeq = { current: 0 };
/** In-flight PUT/POST/DELETE count — a background GET must not clobber them. */
let pendingMutations = 0;

function beginMutation(): number {
  pendingMutations += 1;
  return ++mutationSeq.current;
}

function endMutation(): void {
  pendingMutations = Math.max(0, pendingMutations - 1);
}

/**
 * Every cart server call runs through this chain — the next request only goes
 * out after the previous response (and its Set-Cookie header) has been
 * processed. Without it, rapid clicks while the Render instance is cold fire
 * requests before the guest cookie arrives, so each POST mints a brand-new
 * guest cart (the DB showed 22 one-item carts behind one 10-item order) while
 * the UI keeps optimistic items the server never stored → checkout then fails
 * with "Cannot checkout an empty cart".
 */
let cartQueue: Promise<unknown> = Promise.resolve();
function enqueueCartCall<T>(task: () => Promise<T>): Promise<T> {
  const run = cartQueue.then(task, task);
  cartQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/**
 * A server payload may only enter state if it is a real Cart. Anything else
 * (HTML error page served by a reverse proxy, success envelope, null) would
 * make every `cart.items.reduce(...)` in the UI white-screen the whole app.
 */
function isCart(d: unknown): d is Cart {
  return !!d && typeof d === 'object' && Array.isArray((d as Cart).items);
}

/** Server response wins when it already contains the real line; otherwise keep optimistic temps. */
function mergeServerCart(current: Cart | null, data: Cart, productId: string): Cart {
  if (!isCart(data)) return current ?? recalcCart([]);
  if (!current) return data;
  const serverHasReal = data.items.some((i) => i.productId === productId && i.id !== '' && !i.id.startsWith('temp-'));
  return serverHasReal ? data : current;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function recalcCart(items: CartItem[]): Cart {
  const itemTotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  return { id: '', items, itemTotal, boxSummaries: [] };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { country } = useCountry();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const seq = ++mutationSeq.current;
    try {
      const data = await enqueueCartCall(() => cartApi.getCart(country));
      /* Don't let a slow GET overwrite a newer optimistic +/- click. */
      if (isCart(data) && pendingMutations === 0 && seq === mutationSeq.current) setCart(data);
    } catch {
      // Backend unreachable — keep current cart state (empty on first load)
    }
  }, [country]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const onLogout = () => {
      setCart(null);
      invalidateAuthToken();
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  /* After OTP login the session is now the USER's — re-pull the server cart so
   * the UI never shows guest-phase ghosts while the server holds none. */
  useEffect(() => {
    const onLogin = () => {
      void refresh();
    };
    window.addEventListener('auth:login', onLogin);
    return () => window.removeEventListener('auth:login', onLogin);
  }, [refresh]);

  /* ── Optimistic addItem ── */
  const addItem = useCallback(
    async (productId: string, qty: number, snap?: CartItemSnapshot) => {
      const seq = beginMutation();
      // Optimistically: find product in existing items or add temp placeholder
      setCart((current) => {
        const existing = current?.items.find((i) => i.productId === productId && !i.boxType);
        if (existing) {
          // Already in cart — optimistically bump qty
          const optimistic = current!.items.map((i) =>
            i.productId === productId && !i.boxType ? { ...i, qty: i.qty + qty, lineTotal: i.unitPrice * (i.qty + qty) } : i
          );
          return { ...current!, items: optimistic, itemTotal: optimistic.reduce((s, i) => s + i.unitPrice * i.qty, 0) };
        } else {
          // New product — add temp placeholder so UI updates instantly
          const tempItem = makeTempItem(productId, qty, snap, null, null);
          const optimistic = current ? [...current.items, tempItem] : [tempItem];
          return current
            ? { ...current, items: optimistic, itemTotal: optimistic.reduce((s, i) => s + i.unitPrice * i.qty, 0) }
            : recalcCart(optimistic);
        }
      });
      // Sync with server in background — don't block UI, don't revert on failure
      try {
        const data = await enqueueCartCall(() => cartApi.addCartItem(productId, qty, country));
        // Merge server response: keep temp items that server might not return yet
        setCart((current) => (seq === mutationSeq.current ? mergeServerCart(current, data, productId) : current));
      } catch (err) {
        // Keep optimistic state — don't flash back. Log so failures are diagnosable.
        console.error('[cart] addItem sync failed', err);
      } finally {
        endMutation();
      }
    },
    [country]
  );

  /* ── Optimistic updateItem ── */
  const updateItem = useCallback(async (itemId: string, qty: number) => {
    const seq = beginMutation();
    setCart((current) => {
      if (!current) return current;
      /* Update qty AND lineTotal so the order summary price moves with the stepper. */
      const optimistic = current.items.map((i) =>
        i.id === itemId ? { ...i, qty, lineTotal: i.unitPrice * qty } : i
      );
      return { ...current, items: optimistic, itemTotal: optimistic.reduce((s, i) => s + i.unitPrice * i.qty, 0) };
    });
    /* temp- ids never existed on the server — PUT would 400 on UUID parse.
     * Handled OUTSIDE the try/finally so endMutation runs exactly once: the old
     * in-try endMutation + finally endMutation double-decremented pendingMutations,
     * letting a background GET clobber other in-flight optimistic clicks. */
    if (itemId.startsWith('temp-')) {
      endMutation();
      await refresh();
      return;
    }
    try {
      const data = await enqueueCartCall(() => cartApi.updateCartItem(itemId, qty));
      /* Stale response (user already clicked again) must not revert qty. */
      if (seq === mutationSeq.current && isCart(data)) setCart(data);
    } catch (err) {
      // Keep optimistic state
      console.error('[cart] updateItem sync failed', err);
    } finally {
      endMutation();
    }
  }, [refresh]);

  /* ── Optimistic removeItem ── */
  const removeItem = useCallback(async (itemId: string) => {
    const seq = beginMutation();
    setCart((current) => {
      if (!current) return current;
      const optimistic = current.items.filter(i => i.id !== itemId);
      return { ...current, items: optimistic, itemTotal: optimistic.reduce((s, i) => s + i.unitPrice * i.qty, 0) };
    });
    try {
      if (itemId.startsWith('temp-')) {
        return; /* never persisted — optimistic remove is enough */
      }
      const data = await enqueueCartCall(() => cartApi.removeCartItem(itemId));
      if (seq === mutationSeq.current && isCart(data)) setCart(data);
    } catch (err) {
      // Keep optimistic state
      console.error('[cart] removeItem sync failed', err);
    } finally {
      endMutation();
    }
  }, []);

  /* ── Optimistic setBoxItem ── */
  const setBoxItem = useCallback(
    async (
      productId: string,
      boxType: 'SMALL_BOX' | 'BIG_BOX',
      qty: number,
      weightKg: number | null,
      snap?: CartItemSnapshot
    ) => {
      const seq = beginMutation();
      // Optimistic: update existing item or add temp placeholder (works even before first cart load)
      setCart((current) => {
        const existing = current?.items.find((i) => i.productId === productId && i.boxType === boxType);
        if (existing) {
          const optimistic = (current as Cart).items.map((i) =>
            i.productId === productId && i.boxType === boxType
              ? { ...i, qty, weightKg: weightKg ?? i.weightKg, lineTotal: i.unitPrice * qty }
              : i
          );
          return { ...(current as Cart), items: optimistic, itemTotal: optimistic.reduce((s, i) => s + i.unitPrice * i.qty, 0) };
        } else {
          const tempItem = makeTempItem(productId, qty, snap, boxType, weightKg);
          const optimistic = current ? [...current.items, tempItem] : [tempItem];
          return current
            ? { ...current, items: optimistic, itemTotal: optimistic.reduce((s, i) => s + i.unitPrice * i.qty, 0) }
            : recalcCart(optimistic);
        }
      });
      // Sync with server in background
      try {
        const data = await enqueueCartCall(() => cartApi.setBoxItem(productId, boxType, qty, weightKg, country));
        setCart((current) => (seq === mutationSeq.current ? mergeServerCart(current, data, productId) : current));
      } catch (err) {
        // Keep optimistic state. Log so failures are diagnosable.
        console.error('[cart] setBoxItem sync failed', err);
      } finally {
        endMutation();
      }
    },
    [country]
  );

  const clearCart = useCallback(async () => {
    setCart({ id: '', items: [], itemTotal: 0, boxSummaries: [] });
    try {
      const data = await enqueueCartCall(() => cartApi.clearCart());
      if (isCart(data)) setCart(data);
    } catch (err) {
      // Keep empty state
      console.error('[cart] clearCart sync failed', err);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, setBoxItem, clearCart, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
