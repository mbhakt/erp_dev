import React, { useRef } from 'react';
import { Card, Button } from 'antd';

/**
 * ReportCard - wrapper with export buttons
 * props:
 *  - title, children, exportData (array of objects), exportFilename
 */
export default function ReportCard({ title, children, exportData = [], exportFilename = 'report' }) {
  const printableRef = useRef();

  const downloadCSV = () => {
    if (!exportData || !exportData.length) {
      return alert('No data to export');
    }
    const keys = Object.keys(exportData[0]);
    const csv = [keys.join(',')].concat(exportData.map(r => keys.map(k=>`"${String(r[k]||'').replace(/"/g,'""')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(exportData || []);
      const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFilename + '.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('xlsx library not available, falling back to CSV', e);
      downloadCSV();
    }
  };

  const exportPDF = () => {
    // simple print-to-pdf fallback
    const w = window.open('', '_blank');
    const html = `
      <html><head><title>${title}</title></head><body>${printableRef.current ? printableRef.current.innerHTML : ''}</body></html>
    `;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(()=>w.print(), 500);
  };

  return (
    <Card title={title} extra={<div style={{display:'flex',gap:8}}>
      <Button onClick={downloadCSV}>Export CSV</Button>
      <Button onClick={exportExcel}>Export Excel</Button>
      <Button onClick={exportPDF}>Print / PDF</Button>
    </div>}>
      <div ref={printableRef}>
        {children}
      </div>
    </Card>
  );
}