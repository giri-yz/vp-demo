import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { downloadCsv, downloadExcel, downloadPdf, printTable, type ExportData } from '../../utils/csvExport';

export default function ExportMenu({
  getData,
  label = 'Export',
  buttonStyle,
}: {
  getData: () => ExportData;
  label?: string;
  buttonStyle?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePos = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuW = 160;
    let left = rect.right - menuW;
    if (left < 8) left = 8;
    setPos({
      top: rect.bottom + window.scrollY + 8,
      left,
      width: menuW,
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePos();
      const onScroll = () => setOpen(false);
      const onResize = () => updatePos();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
      };
    }
  }, [open, updatePos]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inButton = buttonRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inButton && !inMenu) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function run(kind: 'csv' | 'excel' | 'pdf' | 'print') {
    const data = getData();
    if (kind === 'csv') downloadCsv(data.filename, data.columns, data.rows);
    else if (kind === 'excel') downloadExcel(data);
    else if (kind === 'pdf') downloadPdf(data);
    else printTable(data);
    setOpen(false);
  }

  const itemStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 13,
    color: '#374151',
  };

  const dropdown = open ? (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        minWidth: 150,
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,.15)',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        zIndex: 10000,
      }}
    >
      <button type="button" style={itemStyle} onClick={() => run('csv')}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          CSV
        </span>
      </button>
      <button type="button" style={itemStyle} onClick={() => run('excel')}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          Excel
        </span>
      </button>
      <button type="button" style={itemStyle} onClick={() => run('pdf')}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          PDF
        </span>
      </button>
      <button type="button" style={itemStyle} onClick={() => run('print')}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
          Print
        </span>
      </button>
    </div>
  ) : null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => { setOpen((o) => !o); if (!open) setTimeout(updatePos, 0); }}
        style={{
          padding: '8px 16px',
          borderRadius: 10,
          border: 'none',
          background: '#16A34A',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          ...buttonStyle,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          {label}
        </span>
      </button>
      {open && createPortal(dropdown, document.body)}
    </div>
  );
}
