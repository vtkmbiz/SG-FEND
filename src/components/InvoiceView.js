import { useRef } from 'react';
import QR_CODE from '../assets/qrCode';
import { T, fmtINR } from '../utils/theme';
import { Btn, Badge, Modal } from '../components/UI';
import api from '../utils/api';
import toast from 'react-hot-toast';

const UPI_ID = '9898165220@okbizaxis';

function buildDownloadHTML(inv) {
  const itemRows = (inv.items || []).map((it, i) =>
    `<tr><td style="padding:10px 12px;color:#8B6E5A">${i+1}</td><td style="padding:10px 12px">${it.description}</td><td style="padding:10px 12px;text-align:right;font-weight:700">₹${Number(it.charge).toLocaleString('en-IN')}</td></tr>`
  ).join('');
  const statusColor = inv.status === 'paid' ? '#1B6B3A' : inv.status === 'due' ? '#B71C1C' : '#B45309';
  const statusBg = inv.status === 'paid' ? '#E8F5EE' : inv.status === 'due' ? '#FFEBEE' : '#FEF3C7';
  const statusLabel = inv.status === 'paid' ? '✓ Paid' : inv.status === 'due' ? '⚠ Due' : '⏳ Pending';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${inv.id} - Swastik Auto</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#fff;padding:24px;max-width:640px;margin:0 auto}@media print{body{padding:0}}</style>
</head><body>
<div style="background:#7B1E1E;padding:22px 26px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:flex-start">
  <div>
    <div style="font-weight:800;font-size:22px;color:#D4A017;font-family:Arial,sans-serif">🔧 SWASTIK AUTO REPAIRERS</div>
    <div style="font-size:11px;color:rgba(212,160,23,0.7);margin-top:3px">Manubhai G Joshi Gerej vada</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:8px;line-height:1.7">59 Digvijay Plot, ST Main Road, Jamnagar, Gujarat 361005<br>📞 9898165220 · 9998013335<br>UPI: ${UPI_ID}</div>
  </div>
  <div style="background:#fff;border-radius:10px;padding:8px;text-align:center">
    <img src="${QR_CODE}" width="88" height="88" style="display:block;border-radius:6px;object-fit:cover" alt="Pay QR">
    <div style="font-size:9px;color:#7B1E1E;font-weight:700;margin-top:3px">SCAN &amp; PAY</div>
  </div>
</div>
<div style="border:1px solid #EDE4D4;border-top:none;border-radius:0 0 12px 12px">
  <div style="padding:14px 22px;border-bottom:1px solid #EDE4D4;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-size:10px;color:#8B6E5A;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Invoice Number</div>
      <div style="font-size:26px;font-weight:800;color:#7B1E1E">${inv.id}</div>
      <div style="font-size:12px;color:#8B6E5A;margin-top:3px">Date: ${inv.date}${inv.delivery_date ? '  |  Delivery: ' + inv.delivery_date : ''}</div>
    </div>
    <span style="background:${statusBg};color:${statusColor};padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700">${statusLabel}</span>
  </div>
  <div style="padding:12px 22px;background:#F5F0E8;border-bottom:1px solid #EDE4D4">
    <div style="font-size:10px;font-weight:700;color:#7B1E1E;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Customer Details</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div><div style="font-size:9px;color:#8B6E5A">NAME</div><div style="font-size:13px;font-weight:700;color:#2C1810">${inv.customer_name}</div></div>
      <div><div style="font-size:9px;color:#8B6E5A">CONTACT</div><div style="font-size:13px;font-weight:700;color:#2C1810">${inv.contact}</div></div>
      <div><div style="font-size:9px;color:#8B6E5A">VEHICLE</div><div style="font-size:13px;font-weight:700;color:#2C1810">${inv.vehicle}</div></div>
      <div><div style="font-size:9px;color:#8B6E5A">REG. NO.</div><div style="font-size:13px;font-weight:700;color:#7B1E1E">${inv.vehicle_no}</div></div>
    </div>
  </div>
  <div style="padding:16px 22px">
    <div style="font-size:10px;font-weight:700;color:#7B1E1E;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Services &amp; Parts</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:#F5F0E8"><th style="padding:9px 12px;text-align:left;font-size:11px;color:#8B6E5A;font-weight:700">Sr.</th><th style="padding:9px 12px;text-align:left;font-size:11px;color:#8B6E5A;font-weight:700">Description</th><th style="padding:9px 12px;text-align:right;font-size:11px;color:#8B6E5A;font-weight:700">Amount</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div style="background:#7B1E1E;border-radius:10px;padding:14px 18px;margin-top:14px;display:flex;justify-content:space-between;align-items:center">
      <span style="color:#D4A017;font-size:14px;font-weight:700">TOTAL AMOUNT</span>
      <span style="color:#D4A017;font-size:26px;font-weight:800">₹${Number(inv.total).toLocaleString('en-IN')}</span>
    </div>
  </div>
  <div style="padding:18px 22px;background:#FBF4E0;border-top:1px solid #EDE4D4;display:flex;align-items:center;gap:24px">
    <img src="${QR_CODE}" style="width:130px;height:130px;border:3px solid #D4A017;border-radius:10px;object-fit:cover;flex-shrink:0" alt="UPI QR">
    <div>
      <div style="font-size:13px;font-weight:800;color:#7B1E1E;margin-bottom:5px">📲 Scan &amp; Pay via UPI</div>
      <div style="font-size:16px;font-weight:800;color:#7B1E1E;margin-bottom:4px">${UPI_ID}</div>
      <div style="font-size:12px;color:#8B6E5A;margin-bottom:10px">Pay ₹${Number(inv.total).toLocaleString('en-IN')} — Works on all UPI apps</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${['G Pay','PhonePe','Paytm','BHIM'].map(a => `<span style="background:#fff;border:1px solid #EDE4D4;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#5C3D2E">${a}</span>`).join('')}
      </div>
    </div>
  </div>
  <div style="padding:14px 22px;text-align:center;border-top:1px solid #EDE4D4">
    <div style="font-size:14px;color:#D4A017;font-weight:700;margin-bottom:4px">🙏 Thank you for your visit! Drive safe.</div>
    <div style="font-size:11px;color:#B89A8A">Trusted Since 1952 · 59 Digvijay Plot, ST Main Road, Jamnagar, Gujarat</div>
  </div>
</div>
</body></html>`;
}

export default function InvoiceView({ inv, onClose, onStatusChange }) {
  const printRef = useRef();

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(buildDownloadHTML(inv));
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const handleDownload = () => {
    const html = buildDownloadHTML(inv);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${inv.id}_${inv.customer_name.replace(/\s+/g,'_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded!');
  };

  const sendWA = async (type) => {
    try {
      const { data } = await api.get(`/invoices/${inv.id}/whatsapp?type=${type}`);
      window.open(data.waLink, '_blank');
      toast.success(type === 'reminder' ? 'Reminder opened in WhatsApp!' : 'Invoice opened in WhatsApp!');
    } catch { toast.error('Failed to open WhatsApp'); }
  };

  const markStatus = async (status) => {
    try {
      await api.put(`/invoices/${inv.id}/status`, { status });
      toast.success(`Marked as ${status}`);
      onStatusChange(inv.id, status);
    } catch { toast.error('Failed'); }
  };

  return (
    <Modal title={`Invoice — ${inv.id}`} onClose={onClose} width={600}>
      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <Btn variant="gold" onClick={handlePrint} style={{ fontSize: 12, padding: '9px 8px' }}>🖨️ Print Invoice</Btn>
        <Btn variant="blue" onClick={handleDownload} style={{ fontSize: 12, padding: '9px 8px' }}>⬇️ Download Invoice</Btn>
        <Btn variant="wa" onClick={() => sendWA('invoice')} style={{ fontSize: 12, padding: '9px 8px' }}>📲 WhatsApp Invoice</Btn>
        <Btn variant="ghost" onClick={() => sendWA('reminder')} style={{ fontSize: 12, padding: '9px 8px', background: T.amberLight, color: T.amber, border: 'none' }}>🔔 WhatsApp Reminder</Btn>
      </div>

      {/* Tip */}
      <div style={{ background: T.cream, borderRadius: 10, padding: '8px 12px', marginBottom: 14, fontSize: 11, color: T.textLight, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 14 }}>💡</span>
        <span><strong style={{ color: T.maroon }}>Tip:</strong> Download the invoice first, then send on WhatsApp and attach the downloaded file for a complete PDF delivery.</span>
      </div>

      {/* Status buttons */}
      {inv.status !== 'paid' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Btn variant="green" onClick={() => markStatus('paid')} style={{ flex: 1 }}>✅ Mark as Paid</Btn>
          {inv.status === 'pending' && <Btn variant="outline" onClick={() => markStatus('due')} style={{ flex: 1 }}>⚠️ Mark as Due</Btn>}
          {inv.status === 'due' && <Btn variant="ghost" onClick={() => markStatus('pending')} style={{ flex: 1 }}>🔄 Reset to Pending</Btn>}
        </div>
      )}

      {/* Invoice Preview */}
      <div ref={printRef} style={{ border: `1px solid ${T.borderLight}`, borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: T.maroon, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19, color: T.gold, fontFamily: "'Poppins',sans-serif" }}>SWASTIK AUTO REPAIRERS</div>
              <div style={{ fontSize: 11, color: 'rgba(212,160,23,0.7)', marginTop: 2 }}>Manubhai G Joshi Gerej vada</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 7, lineHeight: 1.7 }}>
                59 Digvijay Plot, ST Main Road, Jamnagar, Gujarat<br/>
                📞 9898165220 · 9998013335 · UPI: {UPI_ID}
              </div>
            </div>
            <div style={{ background: T.white, borderRadius: 9, padding: 7, textAlign: 'center', flexShrink: 0 }}>
              <img src={QR_CODE} alt="Pay QR" style={{ width: 74, height: 74, display: 'block', borderRadius: 5, objectFit: 'cover' }} />
              <div style={{ fontSize: 8, color: T.maroon, fontWeight: 700, marginTop: 3 }}>SCAN & PAY</div>
            </div>
          </div>
        </div>

        {/* Invoice meta */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, color: T.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Invoice Number</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.maroon, fontFamily: "'Poppins',sans-serif" }}>{inv.id}</div>
            <div style={{ fontSize: 12, color: T.textLight, marginTop: 2 }}>Date: {inv.date}{inv.delivery_date && ` · Delivery: ${inv.delivery_date}`}</div>
          </div>
          <Badge status={inv.status} />
        </div>

        {/* Customer */}
        <div style={{ padding: '12px 20px', background: T.cream, borderBottom: `1px solid ${T.borderLight}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.maroon, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Customer Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
            {[['Name', inv.customer_name], ['Contact', inv.contact], ['Vehicle', inv.vehicle], ['Reg. No.', inv.vehicle_no]].map(([l, v]) => (
              <div key={l}><div style={{ fontSize: 9, color: T.textLight }}>{l}</div><div style={{ fontWeight: 700, color: T.text }}>{v}</div></div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.maroon, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Services & Parts</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: T.cream }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, color: T.textLight, fontWeight: 700 }}>Sr.</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, color: T.textLight, fontWeight: 700 }}>Description</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 11, color: T.textLight, fontWeight: 700 }}>Amount</th>
            </tr></thead>
            <tbody>
              {(inv.items || []).map((it, i) => (
                <tr key={it.id || i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: '10px', fontSize: 12, color: T.textLight }}>{i+1}</td>
                  <td style={{ padding: '10px', fontSize: 13, color: T.text }}>{it.description}</td>
                  <td style={{ padding: '10px', fontSize: 13, fontWeight: 700, color: T.text, textAlign: 'right' }}>{fmtINR(it.charge)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ background: T.maroon, borderRadius: 10, padding: '12px 16px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: T.gold, fontSize: 14 }}>TOTAL AMOUNT</span>
            <span style={{ fontWeight: 800, fontSize: 22, color: T.gold, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(inv.total)}</span>
          </div>
        </div>

        {/* QR Payment */}
        <div style={{ padding: '16px 20px', background: T.goldBg, borderTop: `1px solid ${T.borderLight}`, display: 'flex', alignItems: 'center', gap: 20 }}>
          <img src={QR_CODE} alt="UPI QR Code" style={{ width: 120, height: 120, border: `3px solid ${T.gold}`, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.maroon, marginBottom: 5 }}>📲 Scan & Pay via UPI</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.maroon, marginBottom: 4 }}>{UPI_ID}</div>
            <div style={{ fontSize: 11, color: T.textLight, marginBottom: 8 }}>Pay {fmtINR(inv.total)} — Works on all UPI apps</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['G Pay','PhonePe','Paytm','BHIM'].map(app => (
                <span key={app} style={{ background: T.white, border: `1px solid ${T.borderLight}`, borderRadius: 6, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: T.textMid }}>{app}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', textAlign: 'center', borderTop: `1px solid ${T.borderLight}` }}>
          <div style={{ fontSize: 13, color: T.gold, fontWeight: 700 }}>🙏 Thank you for your visit! Drive safe.</div>
          <div style={{ fontSize: 10, color: T.textGhost, marginTop: 3 }}>Trusted Since 1952 · 59 Digvijay Plot, ST Main Road, Jamnagar, Gujarat</div>
        </div>
      </div>
    </Modal>
  );
}
