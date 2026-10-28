/** Client-side report export of already-loaded data (mirrors legacy export.js output). */

export type ExportRow = (string | number | null | undefined)[];

export interface ExportData {
  filename: string;
  title: string;
  columns: string[];
  rows: ExportRow[];
}

function csvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadBlob(filename: string, content: BlobPart, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escHtml(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function downloadCsv(filename: string, columns: string[], rows: ExportRow[]): void {
  const lines = [columns.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))];
  downloadBlob(filename, '\uFEFF' + lines.join('\r\n'), 'text/csv;charset=utf-8');
}

/** Excel-compatible .xls via an HTML table (same technique as legacy export.js, no new dependency). */
export function downloadExcel(data: ExportData): void {
  const { filename, columns, rows } = data;
  let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table border="1">';
  html += '<tr>' + columns.map((c) => `<th>${escHtml(c)}</th>`).join('') + '</tr>';
  for (const row of rows) {
    html += '<tr>' + columns.map((_, i) => `<td>${escHtml(row[i])}</td>`).join('') + '</tr>';
  }
  html += '</table></body></html>';
  downloadBlob(filename.replace(/\.csv$/i, '') + '.xls', html, 'application/vnd.ms-excel');
}

/** Printable report in a popup window (same technique as legacy export.js). */
export function printTable(data: ExportData): void {
  const { title, columns, rows } = data;
  let html = `<html><head><title>${escHtml(title)}</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left}th{background:#f8fafc}</style></head><body>`;
  html += `<h2>${escHtml(title)}</h2><table><thead><tr>` + columns.map((c) => `<th>${escHtml(c)}</th>`).join('') + '</tr></thead><tbody>';
  for (const row of rows) {
    html += '<tr>' + columns.map((_, i) => `<td>${escHtml(row[i])}</td>`).join('') + '</tr>';
  }
  html += '</tbody></table></body></html>';
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
}

/** PDF export via styled popup (user saves as PDF from browser print dialog). */
export function downloadPdf(data: ExportData): void {
  const { title, columns, rows } = data;
  let html = `<html><head><title>${escHtml(title)}</title><style>
    @page { margin: 15mm; }
    body { font-family: Inter, Arial, sans-serif; padding: 20px; color: #1a1a1a; }
    h2 { color: #134B2F; margin-bottom: 4px; }
    .subtitle { font-size: 12px; color: #64748B; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #134B2F; color: #fff; padding: 8px 10px; font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: 0.3px; }
    td { border: 1px solid #E5E7EB; padding: 7px 10px; font-size: 11px; }
    tr:nth-child(even) { background: #F8FAFC; }
    .footer { margin-top: 16px; font-size: 10px; color: #94A3B8; text-align: right; }
  </style></head><body>`;
  html += `<h2>${escHtml(title)}</h2>`;
  html += `<div class="subtitle">Generated ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · ${rows.length} records</div>`;
  html += '<table><thead><tr>' + columns.map((c) => `<th>${escHtml(c)}</th>`).join('') + '</tr></thead><tbody>';
  for (const row of rows) {
    html += '<tr>' + columns.map((_, i) => `<td>${escHtml(row[i])}</td>`).join('') + '</tr>';
  }
  html += '</tbody></table>';
  html += `<div class="footer">VPNexues Report · ${escHtml(title)}</div>`;
  html += '</body></html>';
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  }
}
