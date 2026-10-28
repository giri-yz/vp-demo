import { useEffect, useMemo, useState } from 'react';
import { listPayments, type AdminPaymentTxn } from '../../../api/adminPaymentsApi';
import { getOrder } from '../../../api/adminOrdersApi';
import type { AdminOrderDetail } from '../../../types';
import { getErrorMessage } from '../../../utils/errors';
import type { CountryConfig } from '../../../config/countryConfig';
import styles from './SubViews.module.css';

const DATE_RANGES = ['Today', '7 Days', '30 Days', '6 Months', '1 Year', 'All Time'] as const;
type DateRange = typeof DATE_RANGES[number];

interface PaymentMethodData {
  id: string;
  label: string;
  icon: string;
  color: string;
  providers: { id: string; label: string; icon: string }[];
}

const COUNTRY_PAYMENT_DATA: Record<string, PaymentMethodData[]> = {
  IN: [
    {
      id: 'upi', label: 'UPI', icon: '💳', color: '#16A34A',
      providers: [
        { id: 'google-pay', label: 'Google Pay', icon: '🔵' },
        { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
        { id: 'paytm', label: 'Paytm', icon: '🔵' },
        { id: 'bhim-upi', label: 'BHIM UPI', icon: '🟠' },
        { id: 'amazon-pay', label: 'Amazon Pay', icon: '🟡' },
      ],
    },
    {
      id: 'card', label: 'Card', icon: '💳', color: '#22C55E',
      providers: [
        { id: 'visa', label: 'Visa', icon: '💳' },
        { id: 'mastercard', label: 'Mastercard', icon: '💳' },
        { id: 'rupay', label: 'RuPay', icon: '💳' },
        { id: 'american-express', label: 'American Express', icon: '💳' },
      ],
    },
    {
      id: 'net-banking', label: 'Net Banking', icon: '🏦', color: '#4ADE80',
      providers: [
        { id: 'sbi', label: 'SBI', icon: '🏦' },
        { id: 'hdfc-bank', label: 'HDFC Bank', icon: '🏦' },
        { id: 'icici-bank', label: 'ICICI Bank', icon: '🏦' },
        { id: 'axis-bank', label: 'Axis Bank', icon: '🏦' },
        { id: 'kotak-mahindra-bank', label: 'Kotak Mahindra Bank', icon: '🏦' },
        { id: 'federal-bank', label: 'Federal Bank', icon: '🏦' },
        { id: 'bank-of-baroda', label: 'Bank of Baroda', icon: '🏦' },
        { id: 'canara-bank', label: 'Canara Bank', icon: '🏦' },
        { id: 'punjab-national-bank', label: 'Punjab National Bank', icon: '🏦' },
        { id: 'indian-bank', label: 'Indian Bank', icon: '🏦' },
        { id: 'union-bank-of-india', label: 'Union Bank of India', icon: '🏦' },
        { id: 'idfc-first-bank', label: 'IDFC FIRST Bank', icon: '🏦' },
      ],
    },
    {
      id: 'cod', label: 'Cash on Delivery', icon: '💵', color: '#86EFAC',
      providers: [{ id: 'cod', label: 'Cash on Delivery', icon: '💵' }],
    },
  ],
  SG: [
    {
      id: 'paynow', label: 'PayNow', icon: '📱', color: '#16A34A',
      providers: [
        { id: 'paynow', label: 'PayNow', icon: '📱' },
        { id: 'dbs-paylah', label: 'DBS PayLah!', icon: '🔵' },
        { id: 'ocbc-pay-anyone', label: 'OCBC Pay Anyone', icon: '🔴' },
        { id: 'grabpay', label: 'GrabPay', icon: '🟢' },
      ],
    },
    {
      id: 'card', label: 'Card', icon: '💳', color: '#22C55E',
      providers: [
        { id: 'visa', label: 'Visa', icon: '💳' },
        { id: 'mastercard', label: 'Mastercard', icon: '💳' },
        { id: 'american-express', label: 'American Express', icon: '💳' },
      ],
    },
    {
      id: 'grabpay', label: 'GrabPay', icon: '🟢', color: '#4ADE80',
      providers: [{ id: 'grabpay', label: 'GrabPay', icon: '🟢' }],
    },
    {
      id: 'cod', label: 'Cash on Delivery', icon: '💵', color: '#86EFAC',
      providers: [{ id: 'cod', label: 'Cash on Delivery', icon: '💵' }],
    },
  ],
  AE: [
    {
      id: 'apple-pay', label: 'Apple Pay', icon: '🍎', color: '#15803D',
      providers: [
        { id: 'apple-pay', label: 'Apple Pay', icon: '🍎' },
        { id: 'google-pay', label: 'Google Pay', icon: '🔵' },
        { id: 'samsung-pay', label: 'Samsung Pay', icon: '🔵' },
      ],
    },
    {
      id: 'card', label: 'Card', icon: '💳', color: '#22C55E',
      providers: [
        { id: 'visa', label: 'Visa', icon: '💳' },
        { id: 'mastercard', label: 'Mastercard', icon: '💳' },
        { id: 'american-express', label: 'American Express', icon: '💳' },
      ],
    },
    {
      id: 'cod', label: 'Cash on Delivery', icon: '💵', color: '#86EFAC',
      providers: [{ id: 'cod', label: 'Cash on Delivery', icon: '💵' }],
    },
  ],
  US: [
    {
      id: 'apple-pay', label: 'Apple Pay', icon: '🍎', color: '#15803D',
      providers: [
        { id: 'apple-pay', label: 'Apple Pay', icon: '🍎' },
        { id: 'google-pay', label: 'Google Pay', icon: '🔵' },
        { id: 'paypal', label: 'PayPal', icon: '🔵' },
      ],
    },
    {
      id: 'card', label: 'Card', icon: '💳', color: '#22C55E',
      providers: [
        { id: 'visa', label: 'Visa', icon: '💳' },
        { id: 'mastercard', label: 'Mastercard', icon: '💳' },
        { id: 'american-express', label: 'American Express', icon: '💳' },
        { id: 'discover', label: 'Discover', icon: '💳' },
      ],
    },
    {
      id: 'cod', label: 'Cash on Delivery', icon: '💵', color: '#86EFAC',
      providers: [{ id: 'cod', label: 'Cash on Delivery', icon: '💵' }],
    },
  ],
  LK: [
    {
      id: 'card', label: 'Card', icon: '💳', color: '#22C55E',
      providers: [
        { id: 'visa', label: 'Visa', icon: '💳' },
        { id: 'mastercard', label: 'Mastercard', icon: '💳' },
        { id: 'american-express', label: 'American Express', icon: '💳' },
      ],
    },
    {
      id: 'bank-transfer', label: 'Bank Transfer', icon: '🏦', color: '#4ADE80',
      providers: [
        { id: 'bank-transfer', label: 'Bank Transfer', icon: '🏦' },
        { id: 'friMi', label: 'FriMi', icon: '📱' },
        { id: 'ez-cash', label: 'eZ Cash', icon: '📱' },
      ],
    },
    {
      id: 'cod', label: 'Cash on Delivery', icon: '💵', color: '#86EFAC',
      providers: [{ id: 'cod', label: 'Cash on Delivery', icon: '💵' }],
    },
  ],
};

type PayTxn = AdminPaymentTxn & { customerId: string; paymentProvider: string };

function adaptPayment(t: AdminPaymentTxn): PayTxn {
  return {
    ...t,
    customerId: t.email ?? t.phone ?? t.customer,
    paymentProvider: t.method === 'COD' ? 'Cash on Delivery' : '—',
  };
}

function filterByDate(txns: PayTxn[], range: DateRange): PayTxn[] {
  if (range === 'All Time') return txns;
  const now = new Date();
  let cutoff: Date;
  switch (range) {
    case 'Today': cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
    case '7 Days': cutoff = new Date(now.getTime() - 7 * 86400000); break;
    case '30 Days': cutoff = new Date(now.getTime() - 30 * 86400000); break;
    case '6 Months': cutoff = new Date(now.getTime() - 180 * 86400000); break;
    case '1 Year': cutoff = new Date(now.getTime() - 365 * 86400000); break;
    default: return txns;
  }
  return txns.filter((t) => new Date(t.date) >= cutoff);
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(d: string): string {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

function getStatusBadge(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case 'successful': return { bg: '#DCFCE7', color: '#16A34A', label: 'Successful' };
    case 'pending': return { bg: '#FEF9C3', color: '#CA8A04', label: 'Pending' };
    case 'failed': return { bg: '#FEE2E2', color: '#DC2626', label: 'Failed' };
    case 'refunded': return { bg: '#FEF3C7', color: '#CA8A04', label: 'Refunded' };
    default: return { bg: '#F1F5F9', color: '#64748B', label: status };
  }
}

/* ---------- Sub-components ---------- */

function PaymentMethodCard({
  method, customers, total, isSelected, onClick,
}: {
  method: PaymentMethodData;
  customers: number;
  total: number;
  isSelected: boolean;
  onClick: () => void;
  config: CountryConfig;
}) {
  const pct = total > 0 ? Math.round((customers / total) * 100) : 0;
  return (
    <div
      className={`${styles.paMethodCard} ${isSelected ? styles.paMethodCardActive : ''}`}
      onClick={onClick}
    >
      <div className={styles.paMethodHeader}>
        <span className={styles.paMethodIcon}>{method.icon}</span>
        <div className={styles.paMethodInfo}>
          <div className={styles.paMethodName}>{method.label}</div>
          <div className={styles.paMethodCount}>{customers} {customers === 1 ? 'customer' : 'customers'}</div>
        </div>
        <div className={styles.paMethodPct}>{pct}%</div>
      </div>
      <div className={styles.paMethodBarWrap}>
        <div
          className={styles.paMethodBar}
          style={{ width: `${pct}%`, background: method.color }}
        />
      </div>
    </div>
  );
}

function DonutChart({ data, total }: { data: { label: string; count: number; color: string }[]; total: number }) {
  const size = 130;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const activeData = data.filter((d) => d.count > 0);
  let cumulative = 0;

  return (
    <div className={styles.paDonutWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {activeData.map((d, i) => {
          const pct = total > 0 ? d.count / total : 0;
          const dashLength = pct * circumference;
          const dashOffset = -cumulative * circumference;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              className={styles.paDonutSegment}
            />
          );
        })}
        <text x={center} y={center - 6} textAnchor="middle" className={styles.paDonutCenterLabel}>
          Total Customers
        </text>
        <text x={center} y={center + 14} textAnchor="middle" className={styles.paDonutCenterValue}>
          {total}
        </text>
      </svg>
      <div className={styles.paDonutLegend}>
        {activeData.map((d, i) => (
          <div key={i} className={styles.paLegendItem}>
            <span className={styles.paLegendDot} style={{ background: d.color }} />
            <span className={styles.paLegendLabel}>{d.label}</span>
            <span className={styles.paLegendValue}>{d.count}</span>
            <span className={styles.paLegendPct}>{total > 0 ? Math.round((d.count / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KPICard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className={styles.paKpiCard}>
      <div className={styles.paKpiIcon}>{icon}</div>
      <div className={styles.paKpiLabel}>{label}</div>
      <div className={styles.paKpiValue}>{value}</div>
    </div>
  );
}

function TransactionTable({ txns, sym, onView }: { txns: PayTxn[]; sym: string; onView: (t: PayTxn) => void }) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;
  const totalPages = Math.ceil(txns.length / PAGE_SIZE);
  // filters shrink txns — clamp so a stale page never renders an empty slice
  // while the pager (which needs totalPages > 1) is hidden
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paged = txns.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  if (txns.length === 0) {
    return <div className={styles.paEmpty}>No transactions found for this selection.</div>;
  }

  return (
    <div>
      <div className={styles.paTableWrap}>
        <table className={styles.paTable}>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Order ID</th>
              <th>Amount</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((t) => {
              const badge = getStatusBadge(t.status);
              return (
                <tr key={t.id}>
                  <td>
                    <div className={styles.paTxnName}>{t.customer}</div>
                    <div className={styles.paTxnEmail}>{t.email ?? t.phone ?? '—'}</div>
                  </td>
                  <td className={styles.paTxnOrderId}>{t.orderNumber}</td>
                  <td className={styles.paTxnAmount}>{sym}{t.amount.toLocaleString()}</td>
                  <td className={styles.paTxnDate}>{fmtDateTime(t.date)}</td>
                  <td>
                    <span className={styles.paStatusBadge} style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className={styles.paViewBtn} onClick={() => onView(t)}>
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className={styles.paPagination}>
          <button type="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className={styles.paPageBtn}>Prev</button>
          <span className={styles.paPageInfo}>Page {safePage + 1} of {totalPages}</span>
          <button type="button" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)} className={styles.paPageBtn}>Next</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Main Component ---------- */

export default function PaymentAnalytics({ config }: { config: CountryConfig }) {
  const code = config.code;
  const sym = config.currencySymbol;
  const [dateRange, setDateRange] = useState<DateRange>('All Time');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [viewTxn, setViewTxn] = useState<PayTxn | null>(null);
  const [viewOrder, setViewOrder] = useState<AdminOrderDetail | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [allTxns, setAllTxns] = useState<PayTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listPayments()
      .then((txns) => {
        if (cancelled) return;
        setAllTxns(txns.filter((t) => t.country === code).map(adaptPayment));
        setLoadError('');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(getErrorMessage(err, 'Could not load payments.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  function openTxn(t: PayTxn) {
    setViewTxn(t);
    setViewOrder(null);
    setOrderLoading(true);
    getOrder(t.orderId)
      .then((d) => setViewOrder(d))
      .catch(() => setViewOrder(null))
      .finally(() => setOrderLoading(false));
  }

  const filteredTxns = useMemo(() => filterByDate(allTxns, dateRange), [allTxns, dateRange]);

  const paymentData = COUNTRY_PAYMENT_DATA[code] ?? COUNTRY_PAYMENT_DATA.IN;

  const methodAnalytics = useMemo(() => {
    return paymentData.map((m) => {
      const methodTxns = filteredTxns.filter((t) => {
        if (t.method === m.label) return true;
        if (m.id === 'cod' && t.method === 'COD') return true;
        if (m.id === 'net-banking' && t.method === 'Net Banking') return true;
        return false;
      });
      const customers = new Set(methodTxns.map((t) => t.customerId)).size;
      const totalAmount = methodTxns.reduce((s, t) => s + t.amount, 0);
      const successful = methodTxns.filter((t) => t.status === 'successful').length;
      const refunded = methodTxns.filter((t) => t.status === 'refunded').length;
      const providerCounts = m.providers.map((p) => {
        const providerTxns = methodTxns.filter((t) => t.paymentProvider === p.label);
        return { ...p, count: new Set(providerTxns.map((t) => t.customerId)).size };
      });
      return { ...m, customers, totalAmount, successful, refunded, totalTxns: methodTxns.length, providerCounts, txns: methodTxns };
    });
  }, [filteredTxns, paymentData]);

  const activeMethods = selectedMethods.length > 0
    ? methodAnalytics.filter((m) => selectedMethods.includes(m.id))
    : [];
  const activeMethod = activeMethods.length === 1 ? activeMethods[0] : null;
  const hasSelection = selectedMethods.length > 0;
  const allSelected = selectedMethods.length === methodAnalytics.length;

  function toggleMethod(id: string) {
    setSelectedMethods((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next;
    });
    setSelectedProvider(null);
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedMethods([]);
    } else {
      setSelectedMethods(methodAnalytics.map((m) => m.id));
    }
    setSelectedProvider(null);
  }

  // When methods are selected, scope all stats to those methods' transactions
  const scopeTxns = hasSelection
    ? methodAnalytics.filter((m) => selectedMethods.includes(m.id)).flatMap((m) => m.txns)
    : filteredTxns;
  const totalCustomers = useMemo(() => new Set(scopeTxns.map((t) => t.customerId)).size, [scopeTxns]);
  const totalTransactions = scopeTxns.length;
  const totalAmount = scopeTxns.reduce((s, t) => s + t.amount, 0);
  const successfulTxns = scopeTxns.filter((t) => t.status === 'successful');
  const refundedTxns = scopeTxns.filter((t) => t.status === 'refunded');
  const successRate = totalTransactions > 0 ? (successfulTxns.length / totalTransactions) * 100 : 0;
  const refundRate = totalTransactions > 0 ? (refundedTxns.length / totalTransactions) * 100 : 0;

  const providerTxns = useMemo(() => {
    if (!activeMethod || !selectedProvider) return [];
    const provider = activeMethod.providerCounts.find((p) => p.id === selectedProvider);
    if (!provider) return [];
    return activeMethod.txns.filter((t) => t.paymentProvider === provider.label);
  }, [activeMethod, selectedProvider]);

  const displayTxns = useMemo(() => {
    if (selectedProvider && activeMethod) return providerTxns;
    if (hasSelection) return scopeTxns;
    return filteredTxns;
  }, [selectedProvider, activeMethod, providerTxns, hasSelection, scopeTxns, filteredTxns]);

  const donutData = useMemo(() => {
    if (activeMethod) {
      return activeMethod.providerCounts
        .filter((p) => p.count > 0)
        .map((p) => ({ label: p.label, count: p.count, color: activeMethod.color }));
    }
    if (hasSelection) {
      return methodAnalytics
        .filter((m) => selectedMethods.includes(m.id) && m.customers > 0)
        .map((m) => ({ label: m.label, count: m.customers, color: m.color }));
    }
    return methodAnalytics
      .filter((m) => m.customers > 0)
      .map((m) => ({ label: m.label, count: m.customers, color: m.color }));
  }, [methodAnalytics, activeMethod, hasSelection, selectedMethods]);

  function handleBack() {
    if (selectedProvider) {
      setSelectedProvider(null);
    } else {
      setSelectedMethods([]);
    }
  }

  return (
    <div className={styles.paContainer}>
      {/* ── Date Filters (banner lives in the SubAdminDashboard shell) ── */}
      <div className={styles.paDateFilters}>
        {DATE_RANGES.map((r) => (
          <button
            key={r}
            type="button"
            className={`${styles.paDateBtn} ${dateRange === r ? styles.paDateBtnActive : ''}`}
            onClick={() => { setDateRange(r); setSelectedMethods([]); setSelectedProvider(null); }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* ── Load status ── */}
      {loading && <div className={styles.paEmpty}>Loading payments…</div>}
      {!loading && loadError && <div className={styles.paEmpty}>{loadError}</div>}

      {/* ── KPI Cards (right after banner) ── */}
      <div className={styles.paKpiRow}>
        <KPICard label="Total Customers" value={String(totalCustomers)} icon="👥" />
        <KPICard label="Total Transactions" value={String(totalTransactions)} icon="📊" />
        <KPICard label="Total Amount" value={`${sym}${totalAmount.toLocaleString()}`} icon="💰" />
      </div>

      {/* Main Layout: Two Columns */}
      <div className={styles.paMainGrid}>
        {/* Left Large Card: Payment Method Usage */}
        <div className={styles.paMethodCardContainer}>
          <div className={styles.paCard}>
            <div className={styles.paCardHeader}>
              <div>
                <h2 className={styles.paCardTitle}>Payment Method Usage</h2>
                <p className={styles.paCardSubtitle}>Customer count and transaction details by payment method</p>
              </div>
              <button type="button" className={`${styles.paSelectAllBtn} ${allSelected ? styles.paSelectAllBtnActive : ''}`} onClick={toggleSelectAll}>
                {allSelected ? 'Clear All' : 'Select All'}
              </button>
            </div>
            <div className={styles.paMethodsList}>
              {methodAnalytics.map((m) => (
                <PaymentMethodCard
                  key={m.id}
                  method={m}
                  customers={m.customers}
                  total={totalCustomers}
                  isSelected={selectedMethods.includes(m.id)}
                  onClick={() => toggleMethod(m.id)}
                  config={config}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.paRightCol}>
          {/* Donut Chart */}
          <div className={styles.paCard}>
            <div className={styles.paCardHeader}>
              <h2 className={styles.paCardTitle}>Customers by Payment Method</h2>
            </div>
            <DonutChart data={donutData} total={totalCustomers} />
          </div>

          {/* Payment Status */}
          <div className={styles.paCard}>
            <div className={styles.paCardHeader}>
              <h2 className={styles.paCardTitle}>Payment Status</h2>
            </div>
            {totalTransactions === 0 ? (
              <div className={styles.paEmpty}>No payment data for this period.</div>
            ) : (
              <div className={styles.paStatusList}>
                <div className={styles.paStatusRow}>
                  <div className={styles.paStatusLeft}>
                    <span className={styles.paStatusDot} style={{ background: '#16A34A' }} />
                    <span className={styles.paStatusLabel}>Successful</span>
                    <span className={styles.paStatusCount}>{successfulTxns.length} ({successRate.toFixed(0)}%)</span>
                  </div>
                  <div className={styles.paStatusAmount}>{sym}{successfulTxns.reduce((s, t) => s + t.amount, 0).toLocaleString()}</div>
                </div>
                <div className={styles.paStatusBarWrap}>
                  <div className={styles.paStatusBar} style={{ width: `${successRate}%`, background: '#16A34A' }} />
                </div>

                <div className={styles.paStatusRow}>
                  <div className={styles.paStatusLeft}>
                    <span className={styles.paStatusDot} style={{ background: '#D97706' }} />
                    <span className={styles.paStatusLabel}>Refunded</span>
                    <span className={styles.paStatusCount}>{refundedTxns.length} ({refundRate.toFixed(0)}%)</span>
                  </div>
                  <div className={styles.paStatusAmount}>{sym}{refundedTxns.reduce((s, t) => s + t.amount, 0).toLocaleString()}</div>
                </div>
                <div className={styles.paStatusBarWrap}>
                  <div className={styles.paStatusBar} style={{ width: `${refundRate}%`, background: '#D97706' }} />
                </div>

                <div className={styles.paRevenueBox}>
                  <div className={styles.paRevenueLabel}>Total Revenue</div>
                  <div className={styles.paRevenueValue}>{sym}{totalAmount.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Provider Chips (when method is selected) */}
      {activeMethod && (
        <div className={styles.paProviderSection}>
          <div className={styles.paCard}>
            <div className={styles.paCardHeader}>
              <h2 className={styles.paCardTitle}>{activeMethod.label} Providers</h2>
              <p className={styles.paCardSubtitle}>Select a provider to view specific transactions</p>
            </div>
            <div className={styles.paProviderGrid}>
              {activeMethod.providerCounts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.paProviderCard} ${selectedProvider === p.id ? styles.paProviderCardActive : ''}`}
                  onClick={() => setSelectedProvider(selectedProvider === p.id ? null : p.id)}
                >
                  <span className={styles.paProviderIcon}>{p.icon}</span>
                  <div className={styles.paProviderInfo}>
                    <div className={styles.paProviderName}>{p.label}</div>
                    <div className={styles.paProviderCount}>{p.count} customers</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Method Details */}
      {(hasSelection || selectedProvider) && (activeMethod || hasSelection) && (
        <div className={styles.paSelectedSection}>
          <div className={styles.paCard}>
            <div className={styles.paCardHeader}>
              <div>
                <h2 className={styles.paCardTitle}>Selected Method Details</h2>
                <p className={styles.paCardSubtitle}>View detailed transactions for the selected payment method</p>
              </div>
              <button type="button" className={styles.paBackBtn} onClick={handleBack}>
                ← Back
              </button>
            </div>

            {/* Summary */}
            <div className={styles.paSelectedSummary}>
              <div className={styles.paSelectedIcon}>{activeMethod ? activeMethod.icon : '💳'}</div>
              <div className={styles.paSelectedInfo}>
                <div className={styles.paSelectedName}>
                  {selectedProvider && activeMethod
                    ? activeMethod.providerCounts.find((p) => p.id === selectedProvider)?.label ?? selectedProvider
                    : activeMethod
                      ? activeMethod.label
                      : `${selectedMethods.length} Methods Selected`}
                </div>
                <div className={styles.paSelectedCustomers}>
                  {displayTxns.length} transactions
                </div>
                {!selectedProvider && !activeMethod && (
                  <div className={styles.paSelectedProviders}>
                    {methodAnalytics.filter((m) => selectedMethods.includes(m.id)).map((m) => (
                      <span key={m.id} className={styles.paSelectedProviderChip}>
                        {m.icon} {m.label} ({m.customers})
                      </span>
                    ))}
                  </div>
                )}
                {!selectedProvider && activeMethod && (
                  <div className={styles.paSelectedProviders}>
                    {activeMethod.providerCounts.filter((p) => p.count > 0).map((p) => (
                      <span key={p.id} className={styles.paSelectedProviderChip}>
                        {p.icon} {p.label} ({p.count})
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.paSelectedStats}>
                <div className={styles.paStatBox}>
                  <div className={styles.paStatLabel}>Customer Count</div>
                  <div className={styles.paStatValue}>{selectedProvider ? new Set(providerTxns.map((t) => t.customerId)).size : new Set(displayTxns.map((t) => t.customerId)).size}</div>
                </div>
                <div className={styles.paStatBox}>
                  <div className={styles.paStatLabel}>Total Amount</div>
                  <div className={styles.paStatValue}>{sym}{displayTxns.reduce((s, t) => s + t.amount, 0).toLocaleString()}</div>
                </div>
                <div className={styles.paStatBox}>
                  <div className={styles.paStatLabel}>Successful</div>
                  <div className={styles.paStatValue} style={{ color: '#86EFAC' }}>{displayTxns.filter((t) => t.status === 'successful').length}</div>
                </div>
                <div className={styles.paStatBox}>
                  <div className={styles.paStatLabel}>Refunded</div>
                  <div className={styles.paStatValue} style={{ color: '#FDE68A' }}>{displayTxns.filter((t) => t.status === 'refunded').length}</div>
                </div>
              </div>
            </div>

            {/* Transaction Table */}
            <TransactionTable txns={displayTxns} sym={sym} onView={openTxn} />
          </div>
        </div>
      )}

      {/* ── Payment Details Side Drawer ── */}
      {viewTxn && (
        <div className={styles.paDrawerOverlay} onClick={() => setViewTxn(null)}>
          <div className={styles.paDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.paDrawerHeader}>
              <div className={styles.paDrawerTitle}>Payment Details — {viewTxn.id}</div>
              <button type="button" className={styles.paDrawerClose} onClick={() => setViewTxn(null)}>&times;</button>
            </div>
            <div className={styles.paDrawerBody}>
              {/* Payment Details */}
              <div className={styles.paDrawerSection}>
                <div className={styles.paDrawerSectionTitle}>Payment Details</div>
                <div className={styles.paDrawerGrid}>
                  {[
                    { label: 'CUSTOMER', value: viewTxn.customer },
                    { label: 'CUSTOMER ID', value: viewTxn.customerId },
                    { label: 'ORDER', value: viewTxn.orderNumber },
                    { label: 'PAYMENT METHOD', value: viewTxn.method },
                    { label: 'PAYMENT PROVIDER', value: viewTxn.paymentProvider },
                    { label: 'PAYMENT AMOUNT', value: `${sym}${viewTxn.amount.toLocaleString()}` },
                    { label: 'PAYMENT ID', value: viewTxn.id },
                    { label: 'TRANSACTION ID', value: `TXN-${viewTxn.orderNumber}` },
                    { label: 'PAYMENT DATE', value: fmtDate(viewTxn.date) },
                    { label: 'PAYMENT TIME', value: new Date(viewTxn.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) },
                    { label: 'PAYMENT STATUS', value: getStatusBadge(viewTxn.status).label },
                    { label: 'ORDER STATUS', value: viewTxn.orderStatus.charAt(0) + viewTxn.orderStatus.slice(1).toLowerCase() },
                  ].map((f) => (
                    <div key={f.label} className={styles.paDrawerField}>
                      <div className={styles.paDrawerFieldLabel}>{f.label}</div>
                      <div className={`${styles.paDrawerFieldValue} ${f.label === 'PAYMENT AMOUNT' ? styles.paDrawerFieldAmount : ''}`}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ordered Products */}
              <div className={styles.paDrawerSection}>
                <div className={styles.paDrawerSectionTitle}>
                  Ordered Products {viewOrder ? `(${viewOrder.items.length})` : ''}
                </div>
                <div className={styles.paDrawerProducts}>
                  {orderLoading ? (
                    <div className={styles.paEmpty}>Loading order items…</div>
                  ) : !viewOrder || viewOrder.items.length === 0 ? (
                    <div className={styles.paEmpty}>No order items available.</div>
                  ) : (
                    viewOrder.items.map((item, idx) => (
                      <div key={idx} className={styles.paDrawerProduct}>
                        <div>
                          <div className={styles.paDrawerProductName}>{item.name}</div>
                          <div className={styles.paDrawerProductQty}>Qty: {item.qty} &times; {sym}{item.unitPrice}</div>
                        </div>
                        <div className={styles.paDrawerProductTotal}>{sym}{item.lineTotal.toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
