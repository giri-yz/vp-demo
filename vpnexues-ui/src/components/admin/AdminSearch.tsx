import { useEffect, useRef, useState } from 'react';
import { listProducts } from '../../api/adminProductsApi';
import { listCustomers } from '../../api/adminCustomersApi';
import { getOrder, listOrders } from '../../api/adminOrdersApi';
import { list as listMessages } from '../../api/adminContactMessagesApi';
import { listAdminUsers } from '../../api/adminUsersApi';
import type { AdminCustomer, AdminOrderDetail, AdminProduct, AdminUserSummary, ContactMessage } from '../../types';
import Modal from './Modal';

type Result =
  | { kind: 'product'; product: AdminProduct }
  | { kind: 'customer'; customer: AdminCustomer }
  | { kind: 'order'; order: AdminOrderDetail }
  | { kind: 'message'; message: ContactMessage }
  | { kind: 'admin'; admin: AdminUserSummary };

/**
 * Global admin search over live data (products, customers, orders, support
 * messages, admins). Uses React state only — no DOM queries.
 */
export default function AdminSearch({ countryCode, placeholder = 'Search products, customers...' }: { countryCode?: string; placeholder?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Result | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const id = setTimeout(() => {
      void (async () => {
        try {
          const [products, customers, orders, messages, admins] = await Promise.all([
            listProducts({ search: q, size: 3 }).catch(() => null),
            listCustomers({ search: q, country: countryCode }).catch(() => null),
            listOrders({ country: countryCode, size: 50 }).catch(() => null),
            listMessages().catch(() => []),
            listAdminUsers().catch(() => []),
          ]);
          const out: Result[] = [];
          for (const p of products?.content ?? []) out.push({ kind: 'product', product: p });
          for (const c of (customers ?? []).slice(0, 3)) out.push({ kind: 'customer', customer: c });
          const ql = q.toLowerCase();
          const orderMatches = (orders?.content ?? [])
            .filter((o) => `${o.orderNumber} ${o.buyerName ?? ''} ${o.buyerPhone ?? ''}`.toLowerCase().includes(ql))
            .slice(0, 3);
          for (const o of orderMatches) {
            try {
              out.push({ kind: 'order', order: await getOrder(o.id) });
            } catch {
              // skip unloadable details
            }
          }
          for (const m of messages ?? []) {
            if (`${m.subject} ${m.name} ${m.email}`.toLowerCase().includes(ql)) out.push({ kind: 'message', message: m });
            if (out.length >= 15) break;
          }
          for (const a of admins ?? []) {
            if (`${a.name} ${a.email}`.toLowerCase().includes(ql)) out.push({ kind: 'admin', admin: a });
            if (out.length >= 18) break;
          }
          setResults(out);
          setOpen(true);
        } finally {
          setLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(id);
  }, [query, countryCode]);

  function openResult(r: Result) {
    setSelected(r);
    setOpen(false);
  }

  function rowLabel(r: Result): [string, string] {
    switch (r.kind) {
      case 'product':
        return [`📦 ${r.product.name}`, `${r.product.category} · $${r.product.basePrice.toLocaleString()}`];
      case 'customer':
        return [`👤 ${r.customer.name ?? r.customer.phone}`, `${r.customer.email ?? ''} · ${r.customer.orderCount} orders`];
      case 'order':
        return [`🧾 Order ${r.order.orderNumber}`, `${r.order.buyer.name ?? r.order.buyer.phone} · ${r.order.status}`];
      case 'message':
        return [`✉️ ${r.message.subject}`, `${r.message.name} · ${r.message.status}`];
      case 'admin':
        return [`🛡️ ${r.admin.name}`, `${r.admin.email} · ${r.admin.role}`];
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 160, flex: '0 1 260px' }}>
      <input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' }}
      />
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff',
            borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.12)', border: '1px solid #E5E7EB',
            overflow: 'hidden', zIndex: 500, maxHeight: 380, overflowY: 'auto',
          }}
        >
          {loading ? (
            <div style={{ padding: '14px 16px', fontSize: 13, color: '#94A3B8' }}>Searching...</div>
          ) : results.length === 0 ? (
            <div style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>No matches for “{query.trim()}”.</div>
          ) : (
            results.map((r) => {
              const [title, sub] = rowLabel(r);
              const key = r.kind === 'product' ? `p-${r.product.id}` : r.kind === 'customer' ? `c-${r.customer.id}` : r.kind === 'message' ? `m-${r.message.id}` : r.kind === 'admin' ? `a-${r.admin.id}` : `o-${r.order.id}`;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => void openResult(r)}
                  style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', borderBottom: '1px solid #F1F5F9', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{title}</span>
                  <span style={{ display: 'block', fontSize: 11, color: '#64748B' }}>{sub}</span>
                </button>
              );
            })
          )}
        </div>
      )}

      {selected && selected.kind === 'product' && (
        <Modal title={selected.product.name} onClose={() => setSelected(null)}>
          <p style={{ fontSize: 13, color: '#64748B' }}>{selected.product.category} · SKU {selected.product.sku}</p>
          <p style={{ fontSize: 16, fontWeight: 700 }}>${selected.product.basePrice.toLocaleString()} / {selected.product.unit}</p>
          <p style={{ fontSize: 13 }}>{selected.product.description ?? 'No description.'}</p>
        </Modal>
      )}
      {selected && selected.kind === 'customer' && (
        <Modal title={selected.customer.name ?? selected.customer.phone} onClose={() => setSelected(null)}>
          <p style={{ fontSize: 13 }}>Email: {selected.customer.email ?? '—'}</p>
          <p style={{ fontSize: 13 }}>Phone: {selected.customer.phone}</p>
          <p style={{ fontSize: 13 }}>{selected.customer.orderCount} orders · ${selected.customer.totalSpent.toLocaleString()} spent</p>
        </Modal>
      )}
      {selected && selected.kind === 'order' && (
        <Modal title={`Order ${selected.order.orderNumber}`} onClose={() => setSelected(null)}>
          <p style={{ fontSize: 13 }}>Buyer: {selected.order.buyer.name ?? selected.order.buyer.phone}</p>
          <p style={{ fontSize: 13 }}>Status: {selected.order.status} · {selected.order.channel}</p>
          <p style={{ fontSize: 16, fontWeight: 700 }}>Total: ${selected.order.grandTotal.toLocaleString()}</p>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {selected.order.items.map((item, idx) => (
              <div key={idx} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                {item.name} × {item.qty} — ${item.lineTotal.toLocaleString()}
              </div>
            ))}
          </div>
        </Modal>
      )}
      {selected && selected.kind === 'message' && (
        <Modal title={selected.message.subject} onClose={() => setSelected(null)}>
          <p style={{ fontSize: 13, color: '#64748B' }}>From {selected.message.name} ({selected.message.email})</p>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{selected.message.message}</p>
        </Modal>
      )}
      {selected && selected.kind === 'admin' && (
        <Modal title={selected.admin.name} onClose={() => setSelected(null)}>
          <p style={{ fontSize: 13 }}>Email: {selected.admin.email}</p>
          <p style={{ fontSize: 13 }}>Role: {selected.admin.role}</p>
          <p style={{ fontSize: 13 }}>Status: {selected.admin.active ? 'Active' : 'Inactive'}</p>
        </Modal>
      )}
    </div>
  );
}
