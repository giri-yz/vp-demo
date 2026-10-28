import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Address, CreateAddressInput } from '../types';
import { useAuth } from './AuthContext';
import * as addressesApi from '../api/addressesApi';

const GUEST_STORAGE_KEY = 'vpnexues-guest-addresses';

function readGuestAddresses(): Address[] {
  try { return JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function writeGuestAddresses(list: Address[]) {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(list));
}

interface AddressContextValue {
  addresses: Address[];
  loading: boolean;
  selectedAddress: Address | null;
  selectAddress: (addr: Address | null) => void;
  addAddress: (input: CreateAddressInput) => Promise<Address>;
  removeAddress: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AddressContext = createContext<AddressContextValue | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const loadAddresses = useCallback(async () => {
    if (!user) {
      const guest = readGuestAddresses();
      setAddresses(guest);
      if (guest.length > 0 && !selectedAddress) {
        setSelectedAddress(guest.find((a) => a.isDefault) ?? guest[0]);
      }
      return;
    }
    setLoading(true);
    try {
      const list = await addressesApi.listAddresses();
      setAddresses(list);
      if (!selectedAddress && list.length > 0) {
        const def = list.find((a) => a.isDefault) ?? list[0];
        setSelectedAddress(def);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  const addAddress = useCallback(async (input: CreateAddressInput) => {
    if (user) {
      try {
        const created = await addressesApi.createAddress(input);
        setAddresses((prev) => [...prev, created]);
        setSelectedAddress(created);
        return created;
      } catch (err) {
        // Logged-in users must NOT fall through to the guest localStorage path
        // (no-PII rule: server addresses never mirror to the browser) — surface
        // the failure so the caller can show an error instead.
        throw err;
      }
    }
    // Guest or API fallback: save to localStorage
    const guestAddr: Address = {
      id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...input,
    };
    setAddresses((prev) => {
      const list = [...prev, guestAddr];
      writeGuestAddresses(list);
      return list;
    });
    setSelectedAddress(guestAddr);
    return guestAddr;
  }, [user]);

  const removeAddress = useCallback(async (id: string) => {
    /* Optimistic: remove from UI first, then call API */
    let nextList: Address[] | null = null;
    setAddresses((prev) => {
      nextList = prev.filter((a) => a.id !== id);
      // server addresses must never be mirrored into localStorage (no-PII rule)
      if (!user) writeGuestAddresses(nextList);
      return nextList;
    });
    if (selectedAddress?.id === id) setSelectedAddress(nextList?.[0] ?? null);
    if (user) {
      try { await addressesApi.deleteAddress(id); } catch { /* already removed from UI */ }
    }
  }, [user, selectedAddress]);

  return (
    <AddressContext.Provider value={{ addresses, loading, selectedAddress, selectAddress: setSelectedAddress, addAddress, removeAddress, refresh: loadAddresses }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress(): AddressContextValue {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error('useAddress must be used within AddressProvider');
  return ctx;
}
