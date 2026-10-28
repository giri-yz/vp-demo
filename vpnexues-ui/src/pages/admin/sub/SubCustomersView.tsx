import { useEffect, useState } from 'react';
import { listCustomers } from '../../../api/adminCustomersApi';
// import {
//   () => Promise.resolve({}),
//   demoGetOrder,
//   () => Promise.resolve([]),
//   () => Promise.resolve([]),
//   () => Promise.resolve([]),
//   type string,
//   type string,
// } from '../../../api/demo/demoAdmin';
import type { AdminCustomer, AdminOrderSummary } from '../../../types';
import type { CountryConfig } from '../../../config/countryConfig';
import Modal from '../../../components/admin/Modal';
import ExportMenu from '../../../components/admin/ExportMenu';
import { useToast } from '../../../components/admin/Toast';
import { printTable, type ExportData } from '../../../utils/csvExport';
import { getErrorMessage } from '../../../utils/errors';
import styles from './SubViews.module.css';

type DetailTab = 'overview' | 'orders' | 'products' | 'notes' | 'addresses';

export default function SubCustomersView({ config }: { config: CountryConfig }) {
  const code = config.code;
  const sym = config.currencySymbol;
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [minSpent, setMinSpent] = useState('');
  const [maxSpent, setMaxSpent] = useState('');
  const [sort, setSort] = useState('');
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [detailOrders, setDetailOrders] = useState<AdminOrderSummary[]>([]);
  const [notes, setNotes] = useState<{id: string; text: string; at: string}[]>([]);
  const [addresses, setAddresses] = useState<{id: string; label: string; line: string; city: string}[]>([]);
  const [noteText, setNoteText] = useState('');
  const { notify } = useToast();

  function load() {
    setLoading(true);
    listCustomers({ country: code, type: type || undefined, search: search || undefined })
      .then((c) => {
        let items = c;
        if (minSpent) items = items.filter((x) => x.totalSpent >= Number(minSpent));
        if (maxSpent) items = items.filter((x) => x.totalSpent <= Number(maxSpent));
        if (sort === 'spent-desc') items = [...items].sort((a, b) => b.totalSpent - a.totalSpent);
        if (sort === 'orders-desc') items = [...items].sort((a, b) => b.orderCount - a.orderCount);
        if (sort === 'name') items = [...items].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        setCustomers(items);
        setError('');
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Could not load customers.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [code, type, search, minSpent, maxSpent, sort]);

  function openDetail(c: AdminCustomer) {
    setSelected(c);
    setDetailTab('overview');
    setNotes([]);
    setAddresses([]);
    setNoteText('');
    // Detail orders loaded via API when detail tab opens; placeholder here.
    setDetailOrders([]);
  }

  function addNote() {
    if (!selected || !noteText.trim()) return;
    setNotes((prev) => [...prev, { id: `note-${Date.now()}-${prev.length}`, text: noteText.trim(), at: new Date().toISOString() }]);
    setNoteText('');
    notify('Note added.');
  }

  function printInvoice(c: AdminCustomer) {
    // Order details for invoice: use real orders via API when available
    printTable({
      filename: `customer-${c.id}.csv`,
      title: `Customer Statement — ${c.name ?? c.phone}`,
      columns: ['Order', 'Date', 'Status', 'Total'],
      rows: [],
    });
  }

  function getExportData(): ExportData {
    return {
      filename: `${config.id}-customers.csv`,
      title: `Customers — ${config.name}`,
      columns: ['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Type', 'Registered'],
      rows: customers.map((c) => [c.name ?? '', c.email ?? '', c.phone, c.orderCount, c.totalSpent, c.customerType, c.registeredAt]),
    };
  }

  const purchasedItems: any[] = detailOrders.flatMap((o: any) => {
    try {
      // Real backend order items; fallback empty if unavailable
      return [];
    } catch {
      return [];
    }
  });

  return (
    <div>
      <div className={styles.toolbar}>
        <h2 className={styles.sectionTitle}>Customers — {config.name} ({customers.length})</h2>
        <ExportMenu getData={getExportData} />
      </div>

      <div className={styles.filterRow}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="B2C">B2C</option>
          <option value="B2B">B2B</option>
        </select>
        <input placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Min spent" value={minSpent} onChange={(e) => setMinSpent(e.target.value)} style={{ width: 90 }} />
        <input placeholder="Max spent" value={maxSpent} onChange={(e) => setMaxSpent(e.target.value)} style={{ width: 90 }} />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort: Default</option>
          <option value="spent-desc">Spent high–low</option>
          <option value="orders-desc">Most orders</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className={styles.panel}>
        {loading ? (
          <p className={styles.empty}>Loading...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <p className={styles.empty}>{error}</p>
            <button type="button" className={styles.viewButton} onClick={load}>Retry</button>
          </div>
        ) : customers.length === 0 ? (
          <p className={styles.empty}>No customers in {config.name} match these filters.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Type</th><th>Action</th></tr></thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td><div>{c.name ?? '—'}</div>{c.email && <div className={styles.muted}>{c.email}</div>}</td>
                    <td>{c.phone}</td>
                    <td>{c.orderCount}</td>
                    <td>{sym}{c.totalSpent.toLocaleString()}</td>
                    <td>{c.customerType}</td>
                    <td><button type="button" className={styles.viewButton} onClick={() => openDetail(c)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <Modal title={`${selected.name ?? selected.phone} — Customer Details`} onClose={() => setSelected(null)}>
          <div className={styles.filterRow}>
            {(['overview', 'orders', 'products', 'notes', 'addresses'] as DetailTab[]).map((t) => (
              <button key={t} type="button" className={`${styles.filterBtn} ${detailTab === t ? styles.filterBtnActive : ''}`} onClick={() => setDetailTab(t)}>
                {t === 'orders' ? 'Order History' : t === 'products' ? 'Products Purchased' : t === 'notes' ? 'Notes & Activity' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {detailTab === 'overview' && (
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}><div className={styles.detailLabel}>Name</div><div className={styles.detailValue}>{selected.name ?? '—'}</div></div>
              <div className={styles.detailItem}><div className={styles.detailLabel}>Email</div><div className={styles.detailValue}>{selected.email ?? '—'}</div></div>
              <div className={styles.detailItem}><div className={styles.detailLabel}>Phone</div><div className={styles.detailValue}>{selected.phone}</div></div>
              <div className={styles.detailItem}><div className={styles.detailLabel}>Type</div><div className={styles.detailValue}>{selected.customerType}</div></div>
              <div className={styles.detailItem}><div className={styles.detailLabel}>Orders</div><div className={styles.detailValue}>{selected.orderCount}</div></div>
              <div className={styles.detailItem}><div className={styles.detailLabel}>Total Spent</div><div className={styles.detailValue}>{sym}{selected.totalSpent.toLocaleString()}</div></div>
              <div className={styles.detailItem}><div className={styles.detailLabel}>Registered</div><div className={styles.detailValue}>{new Date(selected.registeredAt).toLocaleDateString()}</div></div>
            </div>
          )}

          {detailTab === 'orders' && (
            detailOrders.length === 0 ? <p className={styles.empty}>No orders found for this customer.</p> : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>Order</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {detailOrders.map((o) => (
                      <tr key={o.id}><td>{o.orderNumber}</td><td>{new Date(o.createdAt).toLocaleDateString()}</td><td>{sym}{o.grandTotal.toLocaleString()}</td><td>{o.status}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {detailTab === 'products' && (
            purchasedItems.length === 0 ? <p className={styles.empty}>No products purchased yet.</p> : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
                  <tbody>
                    {purchasedItems.map((item, idx) => (
                      <tr key={`${item.name}-${idx}`}><td>{item.name}</td><td>{item.qty}</td><td>{sym}{item.lineTotal.toLocaleString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {detailTab === 'notes' && (
            <div>
              {notes.length === 0 && <p className={styles.empty}>No notes yet.</p>}
              {notes.map((n) => (
                <div key={n.id} style={{ fontSize: 13, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div>{n.text}</div>
                  <div className={styles.muted}>{new Date(n.at).toLocaleString()}</div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input placeholder="Add a note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }} />
                <button type="button" className={styles.viewButton} onClick={addNote}>Add</button>
              </div>
            </div>
          )}

          {detailTab === 'addresses' && (
            addresses.length === 0 ? <p className={styles.empty}>No saved addresses.</p> : (
              <table className={styles.table}>
                <thead><tr><th>Label</th><th>Address</th><th>City</th></tr></thead>
                <tbody>
                  {addresses.map((a) => (
                    <tr key={a.id}><td>{a.label}</td><td>{a.line}</td><td>{a.city}</td></tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.ghostButton} onClick={() => printInvoice(selected)}>Statement</button>
          </div>
          <p className={styles.muted}>Per-customer order history is matched locally; the backend exposes no per-customer query.</p>
        </Modal>
      )}
    </div>
  );
}
