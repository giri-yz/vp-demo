/** Visible marker shown on every admin screen while on a demo (offline) session. */
export default function DemoBanner() {
  return (
    <div
      style={{
        background: '#B45309',
        color: '#fff',
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 600,
        position: 'sticky',
        top: 0,
        zIndex: 2000,
        alignSelf: 'flex-start',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      Demo mode — backend offline. Login is local only; data views will show errors until the server is running.
    </div>
  );
}
