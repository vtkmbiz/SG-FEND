// ─── NEW ENTRY ────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { T, fmtINR, todayStr, currentYM, monthLabel } from '../utils/theme';
import { Input, Select, Btn, Card, Badge, Modal, TabBar, Spinner, Empty } from '../components/UI';
import InvoiceView from '../components/InvoiceView';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
/* eslint-disable react-hooks/exhaustive-deps */

export function NewEntryPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [found, setFound] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', email: '', vehicle: '', vehicle_no: '', problems: '' });
  const [saving, setSaving] = useState(false);

  const doSearch = async () => {
    if (!search.trim()) return;
    try {
      const { data } = await api.get(`/customers?q=${search}`);
      if (data.length > 0) { setFound(data[0]); }
      else { toast('No customer found — fill new details'); setIsNew(true); setStep(2); }
    } catch { toast.error('Search failed'); }
  };

  const applyCustomer = (c) => {
    setFound(c);
    setForm({ name: c.name, contact: c.contact, email: '', vehicle: c.vehicle || '', vehicle_no: c.vehicle_no || '', problems: '' });
    setStep(2);
  };

  const f = k => e => setForm(v => ({ ...v, [k]: k === 'vehicle_no' ? e.target.value.toUpperCase() : e.target.value }));

  const save = async () => {
    if (!form.name || !form.contact || !form.problems) return toast.error('Fill all required fields');
    setSaving(true);
    try {
      await api.post('/entries', { is_new_customer: isNew || !found, customer_id: found?.id, ...form });
      toast.success('✅ Service entry saved!');
      navigate('/manage');
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const steps = ['Find Customer', 'Details', 'Problems'];

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.maroon, marginBottom: 18, fontFamily: "'Poppins',sans-serif" }}>New Service Entry</div>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', background: T.white, borderRadius: 14, padding: '14px 20px', marginBottom: 20, border: `1px solid ${T.borderLight}` }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > i + 1 ? T.green : step === i + 1 ? T.maroon : T.creamDark, color: step > i + 1 ? T.white : step === i + 1 ? T.gold : T.textGhost, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: step === i + 1 ? 700 : 500, color: step === i + 1 ? T.maroon : T.textLight, whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 1.5, background: step > i + 1 ? T.green : T.borderLight, margin: '0 10px' }} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.maroon, marginBottom: 14, fontFamily: "'Poppins',sans-serif" }}>🔍 Search Existing Customer</div>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, phone or vehicle number…" />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={doSearch} style={{ flex: 2, padding: 12 }}>Search Customer</Btn>
            <Btn variant="outline" onClick={() => { setIsNew(true); setStep(2); }} style={{ flex: 1, padding: 12 }}>+ New</Btn>
          </div>
          {found && (
            <div style={{ marginTop: 14, background: T.goldBg, borderRadius: 12, padding: 14, border: `1.5px solid ${T.gold}` }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.maroon }}>👋 Returning Customer Found!</div>
              <div style={{ fontSize: 13, color: T.textMid, marginTop: 5 }}>{found.vehicle} · {found.vehicle_no}</div>
              <div style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>Visits: {found.visits} · Total: {fmtINR(found.total_spent)}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Btn onClick={() => applyCustomer(found)} style={{ flex: 1 }}>Use This Customer →</Btn>
                <Btn variant="outline" onClick={() => { setFound(null); setIsNew(true); setStep(2); }} style={{ flex: 1 }}>New Customer</Btn>
              </div>
            </div>
          )}
        </Card>
      )}
      {step === 2 && (
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.maroon, marginBottom: 14, fontFamily: "'Poppins',sans-serif" }}>👤 Customer Details</div>
          {found && !isNew && <div style={{ background: T.goldBg, borderRadius: 10, padding: 10, marginBottom: 14, fontSize: 13, color: T.textMid, border: `1px solid ${T.gold}` }}>Returning: {found.name} · {found.visits} visits · {fmtINR(found.total_spent)} spent</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Full Name *" value={form.name} onChange={f('name')} placeholder="Customer name" />
            <Input label="Contact *" type="tel" value={form.contact} onChange={f('contact')} placeholder="Mobile number" />
            <Input label="Email" type="email" value={form.email} onChange={f('email')} placeholder="Optional" />
            <Input label="Vehicle" value={form.vehicle} onChange={f('vehicle')} placeholder="e.g. Honda Activa 6G" />
            <div style={{ gridColumn: 'span 2' }}>
              <Input label="Vehicle Number" value={form.vehicle_no} onChange={f('vehicle_no')} placeholder="e.g. GJ03AB1234" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="outline" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Btn>
            <Btn onClick={() => setStep(3)} style={{ flex: 2 }}>Next →</Btn>
          </div>
        </Card>
      )}
      {step === 3 && (
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.maroon, marginBottom: 10, fontFamily: "'Poppins',sans-serif" }}>📝 Problems / Work Needed</div>
          <div style={{ background: T.cream, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: T.textMid }}>
            <strong style={{ color: T.maroon }}>{form.name}</strong> · {form.vehicle} · {form.vehicle_no}
          </div>
          <Input label="Describe all problems *" value={form.problems} onChange={f('problems')} placeholder="Describe everything the customer mentioned…" rows={5} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="outline" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</Btn>
            <Btn onClick={save} disabled={saving} style={{ flex: 2 }}>{saving ? 'Saving…' : '✓ Save Entry'}</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── MANAGE PAGE ──────────────────────────────────────────────────────────────
export function ManagePage() {
  const [tab, setTab] = useState('jobs');
  const [entries, setEntries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invFilter, setInvFilter] = useState('all');
  const [genModal, setGenModal] = useState(null);
  const [viewInv, setViewInv] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [e, i] = await Promise.all([api.get('/entries'), api.get('/invoices')]);
      setEntries(e.data); setInvoices(i.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const genInvoice = async (entry, items, delDate, delTime) => {
    try {
      const { data } = await api.post('/invoices', { entry_id: entry.id, customer_id: entry.customer_id, customer_name: entry.customer_name, contact: entry.contact, vehicle: entry.vehicle, vehicle_no: entry.vehicle_no, services: items, delivery_date: delDate, delivery_time: delTime });
      toast.success('🧾 Invoice generated!');
      setGenModal(null);
      await load();
      setViewInv(data);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleStatusChange = (id, status) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (viewInv?.id === id) setViewInv(v => ({ ...v, status }));
  };

  const quickWA = (inv, type) => {
    const phone = inv.contact?.replace(/\D/g, '');
    const items = (inv.items || []).map((it, i) => `${i + 1}. ${it.description} — ${fmtINR(it.charge)}`).join('\n');
    const msg = type === 'reminder'
      ? `🔔 *Payment Reminder — Swastik Auto Repairers*\n━━━━━━━━━━━━━━━━━━━━\nDear *${inv.customer_name}*,\n\nYour invoice *${inv.id}* has a pending payment.\n\n🚗 ${inv.vehicle} (${inv.vehicle_no})\n💰 Amount Due: *${fmtINR(inv.total)}*\n━━━━━━━━━━━━━━━━━━━━\n💳 Pay via UPI: *9898165220@okbizaxis*\n✅ G Pay · PhonePe · Paytm · BHIM\n\nThank you! 🙏\n_— Swastik Auto, Jamnagar | 📞 9898165220_`
      : `🔧 *Swastik Auto Repairers*\n59 Digvijay Plot, Jamnagar | 📞 9898165220\n\n✅ *INVOICE — ${inv.id}*\n━━━━━━━━━━━━━━━━━━━━\n👤 ${inv.customer_name}\n🚗 ${inv.vehicle} (${inv.vehicle_no})\n📅 ${inv.date}\n━━━━━━━━━━━━━━━━━━━━\n${items}\n━━━━━━━━━━━━━━━━━━━━\n💰 *TOTAL: ${fmtINR(inv.total)}*\n\n💳 UPI: *9898165220@okbizaxis*\n✅ G Pay · PhonePe · Paytm · BHIM\n\n🙏 Thank you! Drive safe.`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filtered = invFilter === 'all' ? invoices : invoices.filter(i => i.status === invFilter);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.maroon, marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>Manage</div>
      <TabBar tabs={[{ id: 'jobs', label: '🔧 Jobs' }, { id: 'invoices', label: '🧾 Invoices' }]} active={tab} setActive={setTab} />
      {loading ? <Spinner /> : tab === 'jobs' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>
          {entries.length === 0 && <Empty icon="🔧" text="No service entries yet" />}
          {entries.map(e => (
            <Card key={e.id} style={{ borderLeft: `4px solid ${e.invoiced ? T.green : T.gold}`, marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{e.customer_name}</div>
                  <div style={{ fontSize: 12, color: T.textLight }}>{e.vehicle} · {e.vehicle_no}</div>
                  <div style={{ fontSize: 11, color: T.textGhost }}>{e.id} · {e.date}</div>
                </div>
                <Badge status={e.invoiced ? 'invoiced' : 'open'} />
              </div>
              <div style={{ background: T.cream, borderRadius: 8, padding: '8px 10px', fontSize: 12, color: T.textMid, marginBottom: e.invoiced ? 0 : 10 }}>{e.problems}</div>
              {!e.invoiced && (
                <button onClick={() => setGenModal(e)} style={{ width: '100%', background: T.maroon, color: T.gold, border: 'none', borderRadius: 9, padding: '10px 0', fontWeight: 800, cursor: 'pointer', fontSize: 13 }}>
                  🧾 Service Done — Generate Invoice
                </button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {['all', 'pending', 'due', 'paid'].map(f => (
              <button key={f} onClick={() => setInvFilter(f)} style={{ padding: '6px 18px', borderRadius: 20, border: invFilter === f ? 'none' : `1px solid ${T.borderLight}`, background: invFilter === f ? T.maroon : T.white, color: invFilter === f ? T.gold : T.textMid, fontWeight: 700, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>{f === 'all' ? 'All' : f}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
            {filtered.length === 0 && <Empty icon="🧾" text="No invoices found" />}
            {filtered.map(inv => (
              <Card key={inv.id} style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{inv.customer_name}</div>
                    <div style={{ fontSize: 12, color: T.textLight }}>{inv.vehicle} · {inv.vehicle_no}</div>
                    <div style={{ fontSize: 11, color: T.textGhost }}>{inv.id} · {inv.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: T.maroon, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(inv.total)}</div>
                    <Badge status={inv.status} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Btn variant="ghost" onClick={() => setViewInv(inv)} style={{ flex: 1, fontSize: 11, padding: '7px 4px', minWidth: 55 }}>📄 View</Btn>
                  <Btn variant="ghost" onClick={() => quickWA(inv, 'invoice')} style={{ flex: 1, fontSize: 11, padding: '7px 4px', background: '#E8F5E9', color: T.green, border: 'none', minWidth: 55 }}>📲 WA</Btn>
                  {inv.status !== 'paid' && <Btn variant="ghost" onClick={() => quickWA(inv, 'reminder')} style={{ flex: 1, fontSize: 11, padding: '7px 4px', background: T.amberLight, color: T.amber, border: 'none', minWidth: 55 }}>🔔 Remind</Btn>}
                  {inv.status !== 'paid' && <Btn variant="green" onClick={async () => { await api.put(`/invoices/${inv.id}/status`, { status: 'paid' }); setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid' } : i)); toast.success('Marked paid!'); }} style={{ flex: 1, fontSize: 11, padding: '7px 4px', minWidth: 55 }}>✅ Paid</Btn>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {genModal && <GenerateInvoiceModal entry={genModal} onClose={() => setGenModal(null)} onGenerate={genInvoice} />}
      {viewInv && <InvoiceView inv={invoices.find(i => i.id === viewInv.id) || viewInv} onClose={() => setViewInv(null)} onStatusChange={handleStatusChange} />}
    </div>
  );
}

function GenerateInvoiceModal({ entry, onClose, onGenerate }) {
  const [items, setItems] = useState([{ description: '', charge: '' }]);
  const [delDate, setDelDate] = useState(todayStr());
  const [delTime, setDelTime] = useState('17:00');
  const total = items.reduce((s, i) => s + (+i.charge || 0), 0);
  return (
    <Modal title={`Invoice — ${entry.customer_name}`} onClose={onClose} width={540}>
      <div style={{ background: T.goldBg, borderRadius: 10, padding: 12, marginBottom: 14, border: `1px solid ${T.gold}`, fontSize: 13, color: T.textMid }}>
        <strong style={{ color: T.maroon }}>Problems:</strong> {entry.problems}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.maroon, marginBottom: 10 }}>Services / Parts</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={item.description} onChange={e => setItems(items.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} placeholder="Service or Part name" style={{ flex: 2, padding: '9px 12px', border: `1.5px solid ${T.border}`, borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          <input type="number" value={item.charge} onChange={e => setItems(items.map((x, j) => j === i ? { ...x, charge: e.target.value } : x))} placeholder="₹" style={{ flex: 1, padding: '9px 10px', border: `1.5px solid ${T.border}`, borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          {items.length > 1 && <button onClick={() => setItems(items.filter((_, j) => j !== i))} style={{ background: T.redLight, color: T.red, border: 'none', borderRadius: 8, padding: '0 10px', cursor: 'pointer', fontWeight: 700 }}>✕</button>}
        </div>
      ))}
      <button onClick={() => setItems([...items, { description: '', charge: '' }])} style={{ width: '100%', border: `1.5px dashed ${T.gold}`, background: T.goldBg, color: T.maroon, borderRadius: 9, padding: '8px 0', cursor: 'pointer', fontWeight: 700, fontSize: 13, marginBottom: 14 }}>+ Add Item</button>
      {total > 0 && <div style={{ background: T.maroon, borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: T.gold, fontWeight: 700 }}>Total</span>
        <span style={{ color: T.gold, fontWeight: 800, fontSize: 20, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(total)}</span>
      </div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Input label="Delivery Date" type="date" value={delDate} onChange={e => setDelDate(e.target.value)} />
        <Input label="Delivery Time" type="time" value={delTime} onChange={e => setDelTime(e.target.value)} />
      </div>
      <Btn onClick={() => onGenerate(entry, items.filter(i => i.description && i.charge), delDate, delTime)} style={{ width: '100%', padding: 13 }}>✓ Generate Invoice</Btn>
    </Modal>
  );
}

// ─── VENDORS PAGE ─────────────────────────────────────────────────────────────
export function VendorsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [purModal, setPurModal] = useState(null);
  const [ledgerModal, setLedgerModal] = useState(null);
  const [addVendor, setAddVendor] = useState(false);
  const [newV, setNewV] = useState({ name: '', type: '', contact: '', address: '' });

  const load = async () => {
    try {
      const [v, pu, pa, e] = await Promise.all([api.get('/vendors'), api.get('/purchases'), api.get('/vendor-payments'), api.get('/entries')]);
      setVendors(v.data); setPurchases(pu.data); setPayments(pa.data);
      setEntries(e.data.filter(x => !x.invoiced));
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const pay = async (vendorId, amount, note) => {
    await api.post('/vendor-payments', { vendor_id: vendorId, amount, note });
    toast.success('💰 Payment recorded!'); setPayModal(null); setLedgerModal(null); load();
  };

  const purchase = async (vendorId, item, qty, rate, entryId, entryLabel) => {
    await api.post('/purchases', { vendor_id: vendorId, item, qty, rate, entry_id: entryId || null, entry_label: entryLabel || null });
    toast.success('🛒 Purchase recorded!'); setPurModal(null); load();
  };

  const totalDue = vendors.reduce((s, v) => s + parseFloat(v.balance || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.maroon, fontFamily: "'Poppins',sans-serif" }}>Vendors</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={() => setPurModal({})} style={{ fontSize: 12, padding: '8px 14px' }}>+ Purchase</Btn>
          {['owner', 'co-owner'].includes(user.role) && <Btn variant="outline" onClick={() => setAddVendor(true)} style={{ fontSize: 12, padding: '8px 14px' }}>+ Vendor</Btn>}
        </div>
      </div>
      <TabBar tabs={[{ id: 'vendors', label: '🏪 Vendors' }, { id: 'purchases', label: '🛒 Purchases' }, { id: 'payments', label: '💸 Payments' }]} active={tab} setActive={setTab} />
      {loading ? <Spinner /> : tab === 'vendors' ? (
        <div>
          <div style={{ background: `linear-gradient(135deg,${T.red},#8B1A1A)`, borderRadius: 14, padding: '14px 20px', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 700, textTransform: 'uppercase' }}>Total Outstanding</div>
            <div style={{ fontWeight: 800, fontSize: 22, color: T.white, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(totalDue)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
            {vendors.map(v => (
              <Card key={v.id} style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: T.textLight }}>{v.type}</div>
                    <div style={{ fontSize: 11, color: T.textGhost }}>{v.contact} · {v.address}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 17, color: parseFloat(v.balance) > 0 ? T.red : T.green, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(v.balance)}</div>
                    <div style={{ fontSize: 10, color: T.textGhost }}>outstanding</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn variant="ghost" onClick={() => setLedgerModal(v)} style={{ flex: 1, fontSize: 11, padding: '7px 0' }}>📖 Ledger</Btn>
                  {parseFloat(v.balance) > 0 && <Btn variant="green" onClick={() => setPayModal(v)} style={{ flex: 1, fontSize: 11, padding: '7px 0' }}>💰 Pay</Btn>}
                  <Btn onClick={() => setPurModal(v)} style={{ flex: 1, fontSize: 11, padding: '7px 0' }}>🛒 Buy</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : tab === 'purchases' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
          {purchases.length === 0 && <Empty icon="🛒" text="No purchases recorded" />}
          {purchases.map(p => (
            <Card key={p.id} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{p.item}</div>
                  <div style={{ fontSize: 12, color: T.textLight }}>{p.vendor_name} · {p.date}</div>
                  {p.entry_label && <div style={{ fontSize: 11, color: T.gold, fontWeight: 600 }}>Job: {p.entry_label}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: T.red, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(p.amount)}</div>
                  <div style={{ fontSize: 11, color: T.textGhost }}>{p.qty}×{fmtINR(p.rate)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
          {payments.length === 0 && <Empty icon="💸" text="No payments recorded" />}
          {payments.map(p => (
            <Card key={p.id} style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{p.vendor_name}</div>
                <div style={{ fontSize: 12, color: T.textLight }}>{p.date}{p.note ? ` · ${p.note}` : ''}</div>
              </div>
              <div style={{ fontWeight: 800, color: T.green, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(p.amount)}</div>
            </Card>
          ))}
        </div>
      )}

      {payModal && (
        <Modal title={`Pay — ${payModal.name}`} onClose={() => setPayModal(null)} width={400}>
          <PayForm vendor={payModal} onPay={pay} />
        </Modal>
      )}
      {purModal && (
        <Modal title="Record Purchase" onClose={() => setPurModal(null)} width={480}>
          <PurchaseForm vendors={vendors} entries={entries} preVendor={purModal?.id} onSave={purchase} />
        </Modal>
      )}
      {ledgerModal && (
        <Modal title={ledgerModal.name} onClose={() => setLedgerModal(null)} width={560}>
          <VendorLedgerContent vendor={ledgerModal} onPay={() => { setPayModal(ledgerModal); setLedgerModal(null); }} />
        </Modal>
      )}
      {addVendor && (
        <Modal title="Add Vendor" onClose={() => setAddVendor(false)} width={420}>
          {['name', 'type', 'contact', 'address'].map(k => <Input key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={newV[k]} onChange={e => setNewV(v => ({ ...v, [k]: e.target.value }))} />)}
          <Btn onClick={async () => { await api.post('/vendors', newV); toast.success('✅ Vendor added!'); setAddVendor(false); setNewV({ name: '', type: '', contact: '', address: '' }); load(); }} style={{ width: '100%' }}>Save Vendor</Btn>
        </Modal>
      )}
    </div>
  );
}

function PayForm({ vendor, onPay }) {
  const [amount, setAmount] = useState(''); const [note, setNote] = useState('');
  return (
    <div>
      <div style={{ background: T.redLight, borderRadius: 10, padding: 14, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: T.red, fontWeight: 700 }}>Outstanding</span>
        <span style={{ color: T.red, fontWeight: 800, fontSize: 18 }}>{fmtINR(vendor.balance)}</span>
      </div>
      <button onClick={() => setAmount(String(vendor.balance))} style={{ width: '100%', background: T.goldBg, border: `1px solid ${T.gold}`, color: T.maroon, borderRadius: 9, padding: '8px 0', cursor: 'pointer', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Pay Full {fmtINR(vendor.balance)}</button>
      <Input label="Amount ₹" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <Input label="Note" value={note} onChange={e => setNote(e.target.value)} />
      <Btn onClick={() => onPay(vendor.id, +amount, note)} disabled={!amount} style={{ width: '100%' }}>Confirm Payment</Btn>
    </div>
  );
}

function PurchaseForm({ vendors, entries, preVendor, onSave }) {
  const [vid, setVid] = useState(preVendor || ''); const [item, setItem] = useState(''); const [qty, setQty] = useState('1'); const [rate, setRate] = useState(''); const [eid, setEid] = useState('');
  return (
    <div>
      <Select label="Vendor" value={vid} onChange={e => setVid(e.target.value)}><option value="">Select vendor…</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</Select>
      <Input label="Item / Part" value={item} onChange={e => setItem(e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Qty" type="number" value={qty} onChange={e => setQty(e.target.value)} />
        <Input label="Rate ₹" type="number" value={rate} onChange={e => setRate(e.target.value)} />
      </div>
      {qty && rate && <div style={{ background: T.greenLight, borderRadius: 9, padding: '10px 14px', marginBottom: 12, fontWeight: 700, color: T.green, fontSize: 15 }}>Total: {fmtINR(+qty * +rate)}</div>}
      <Select label="Link to Job (optional)" value={eid} onChange={e => setEid(e.target.value)}><option value="">None</option>{entries.map(e => <option key={e.id} value={e.id}>{e.id} – {e.customer_name}</option>)}</Select>
      <Btn onClick={() => onSave(vid, item, qty, rate, eid, eid ? entries.find(e => e.id === eid)?.customer_name ? `${eid} – ${entries.find(e => e.id === eid)?.customer_name}` : null : null)} disabled={!vid || !item} style={{ width: '100%' }}>Save Purchase</Btn>
    </div>
  );
}

function VendorLedgerContent({ vendor, onPay }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.get(`/vendors/${vendor.id}/ledger`).then(r => setData(r.data)); }, [vendor.id]);
  if (!data) return <Spinner />;
  const totalPur = data.purchases.reduce((s, p) => s + parseFloat(p.amount), 0);
  const totalPay = data.payments.reduce((s, p) => s + parseFloat(p.amount), 0);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[['Purchased', fmtINR(totalPur), T.red], ['Paid', fmtINR(totalPay), T.green], ['Outstanding', fmtINR(vendor.balance), parseFloat(vendor.balance) > 0 ? T.red : T.green], ['Purchases', data.purchases.length, T.maroon]].map(([l, v, c]) => (
          <div key={l} style={{ background: T.cream, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10, color: T.textLight, fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
            <div style={{ fontWeight: 800, color: c, fontFamily: "'Poppins',sans-serif" }}>{v}</div>
          </div>
        ))}
      </div>
      {parseFloat(vendor.balance) > 0 && <Btn onClick={onPay} style={{ width: '100%', marginBottom: 14 }}>Pay Now {fmtINR(vendor.balance)}</Btn>}
      <div style={{ fontWeight: 700, color: T.maroon, marginBottom: 8 }}>Purchase History</div>
      {data.purchases.map(p => <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: `1px solid ${T.borderLight}` }}><span style={{ color: T.textMid }}>{p.item} ({p.qty}×{fmtINR(p.rate)}) · {p.date}</span><span style={{ color: T.red, fontWeight: 700 }}>{fmtINR(p.amount)}</span></div>)}
      <div style={{ fontWeight: 700, color: T.maroon, margin: '14px 0 8px' }}>Payment History</div>
      {data.payments.map(p => <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: `1px solid ${T.borderLight}` }}><span style={{ color: T.textMid }}>{p.date}{p.note ? ` · ${p.note}` : ''}</span><span style={{ color: T.green, fontWeight: 700 }}>{fmtINR(p.amount)}</span></div>)}
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export function ReportsPage() {
  const [tab, setTab] = useState('earnings');
  const [period, setPeriod] = useState('all');
  const [report, setReport] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settleModal, setSettleModal] = useState(false);
  const [sf, setSf] = useState({ earned: '', paid_vendors: '', expenses: '', note: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([api.get(`/reports?period=${period}`), api.get('/settlements')]);
      setReport(r.data); setSettlements(s.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [period]);

  const saveSettle = async () => {
    await api.post('/settlements', { earned: +sf.earned, paid_vendors: +sf.paid_vendors, expenses: +sf.expenses, note: sf.note });
    toast.success('✅ Settlement saved!'); setSettleModal(false); setSf({ earned: '', paid_vendors: '', expenses: '', note: '' }); load();
  };

  const takeHome = (+sf.earned || 0) - (+sf.paid_vendors || 0) - (+sf.expenses || 0);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.maroon, marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>Reports</div>
      <TabBar tabs={[{ id: 'earnings', label: '📈 Earnings' }, { id: 'settlements', label: '💰 Settlements' }]} active={tab} setActive={setTab} />
      {tab === 'earnings' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {[['today', 'Today'], ['week', 'This Week'], ['month', 'This Month'], ['all', 'All Time']].map(([v, l]) => (
              <button key={v} onClick={() => setPeriod(v)} style={{ padding: '6px 16px', borderRadius: 20, border: period === v ? 'none' : `1px solid ${T.borderLight}`, background: period === v ? T.maroon : T.white, color: period === v ? T.gold : T.textMid, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
          {loading ? <Spinner /> : report && (
            <>
              <div className="g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
                {[['Total Revenue', fmtINR(report.summary?.total_revenue || 0), '💰', T.maroon, T.goldBg], ['Collected', fmtINR(report.summary?.collected || 0), '✅', T.green, T.greenLight], ['Due', fmtINR(report.summary?.due || 0), '⚠️', T.red, T.redLight], ['Pending', fmtINR(report.summary?.pending || 0), '⏳', T.amber, T.amberLight], ['Invoices', report.summary?.total_invoices || 0, '🧾', T.blue, T.blueLight], ['Customers', report.summary?.unique_customers || 0, '👥', T.maroon, T.cream]].map(([l, v, ic, c, bg]) => (
                  <div key={l} style={{ background: bg, borderRadius: 14, padding: 14, border: `1px solid ${T.borderLight}` }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{ic}</div>
                    <div style={{ fontSize: 11, color: T.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{l}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: c, fontFamily: "'Poppins',sans-serif" }}>{v}</div>
                  </div>
                ))}
              </div>
              {report.topServices?.length > 0 && (
                <Card style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.maroon, marginBottom: 10, fontFamily: "'Poppins',sans-serif" }}>🏆 Top Services</div>
                  {report.topServices.map((s, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}><span>{i + 1}. {s.description}</span><span style={{ fontWeight: 700, color: T.maroon }}>{s.count}×</span></div>)}
                </Card>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
                {report.invoices?.map(inv => (
                  <Card key={inv.id} style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{inv.customer_name}</div><div style={{ fontSize: 11, color: T.textLight }}>{inv.id} · {inv.date}</div></div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, color: T.maroon }}>{fmtINR(inv.total)}</div><Badge status={inv.status} /></div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {tab === 'settlements' && (
        <div>
          <Btn onClick={() => setSettleModal(true)} style={{ marginBottom: 14 }}>+ Daily Settlement</Btn>
          {settlements.map(s => (
            <Card key={s.id} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.maroon, marginBottom: 10, fontFamily: "'Poppins',sans-serif" }}>📅 {s.date} {s.note && <span style={{ fontSize: 12, fontWeight: 400, color: T.textLight }}>· {s.note}</span>}</div>
              <div className="g2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                {[['Earned', s.earned, T.green], ['To Vendors', s.paid_vendors, T.red], ['Expenses', s.expenses, T.amber], ['Taken Home', s.taken_home, T.maroon]].map(([l, v, c]) => (
                  <div key={l} style={{ background: T.cream, borderRadius: 9, padding: 10 }}>
                    <div style={{ fontSize: 10, color: T.textLight, fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                    <div style={{ fontWeight: 800, color: c, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(v)}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          {settleModal && (
            <Modal title="Add Daily Settlement" onClose={() => setSettleModal(false)} width={440}>
              {[['Earned Today ₹', 'earned'], ['Paid to Vendors ₹', 'paid_vendors'], ['Other Expenses ₹', 'expenses']].map(([l, k]) => (
                <Input key={k} label={l} type="number" value={sf[k]} onChange={e => setSf(v => ({ ...v, [k]: e.target.value }))} />
              ))}
              {sf.earned && <div style={{ background: T.maroon, borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: T.goldPale, fontWeight: 700 }}>🏠 Take Home</span>
                <span style={{ color: T.gold, fontWeight: 800, fontSize: 20, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(takeHome)}</span>
              </div>}
              <Input label="Note (optional)" value={sf.note} onChange={e => setSf(v => ({ ...v, note: e.target.value }))} />
              <Btn onClick={saveSettle} style={{ width: '100%' }}>Save Settlement</Btn>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}

// ─── STAFF PAGE ───────────────────────────────────────────────────────────────
export function StaffPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('attendance');
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [salary, setSalary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selDate, setSelDate] = useState(todayStr());
  const [selMonth, setSelMonth] = useState(currentYM());
  const [addEmp, setAddEmp] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', role: '', salary: '', phone: '' });
  const [detailEmp, setDetailEmp] = useState(null);
  const [reasonEdit, setReasonEdit] = useState(null);
  const [reasonVal, setReasonVal] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const loadEmployees = () => api.get('/employees').then(r => setEmployees(r.data));
  const loadAttendance = (date) => api.get(`/attendance?date=${date}`).then(r => setAttendance(r.data));
  const loadSalary = (month) => api.get(`/salary/${month}`).then(r => setSalary(r.data));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Promise.all([loadEmployees(), loadAttendance(selDate)]).finally(() => setLoading(false));
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!loading) loadAttendance(selDate); }, [selDate]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!loading && (tab === 'salary' || tab === 'history')) loadSalary(selMonth); }, [selMonth, tab]);

  const getAtt = (empId) => attendance.find(a => a.employee_id === empId);

  const mark = async (empId, status) => {
    await api.post('/attendance', { employee_id: empId, date: selDate, status, reason: '' });
    loadAttendance(selDate);
    toast.success(status === 'present' ? '✅ Present' : status === 'absent' ? '❌ Absent' : '🌓 Half Day');
  };

  const saveReason = async (empId, reason) => {
    const rec = getAtt(empId);
    await api.post('/attendance', { employee_id: empId, date: selDate, status: rec.status, reason });
    setReasonEdit(null); loadAttendance(selDate); toast.success('Reason saved!');
  };

  const toggleActive = async (empId) => {
    const { data } = await api.put(`/employees/${empId}/toggle`);
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, active: data.active } : e));
    toast.success(data.active ? '✅ Employee set Active' : '⏸ Employee set Inactive');
  };

  const activeEmps = employees.filter(e => e.active);
  const inactiveEmps = employees.filter(e => !e.active);
  const visible = showInactive ? employees : activeEmps;
  const presentToday = activeEmps.filter(e => getAtt(e.id)?.status === 'present').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.maroon, fontFamily: "'Poppins',sans-serif" }}>Staff & Attendance</div>
          <div style={{ fontSize: 12, color: T.textLight, marginTop: 3 }}>{activeEmps.length} active{inactiveEmps.length > 0 ? ` · ${inactiveEmps.length} inactive` : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {inactiveEmps.length > 0 && (
            <button onClick={() => setShowInactive(v => !v)} style={{ background: showInactive ? T.maroon : T.cream, color: showInactive ? T.gold : T.textMid, border: `1px solid ${showInactive ? T.maroon : T.borderLight}`, borderRadius: 9, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              {showInactive ? 'Hide Inactive' : `Show Inactive (${inactiveEmps.length})`}
            </button>
          )}
          {user.role === 'owner' && <Btn variant="outline" onClick={() => setAddEmp(true)} style={{ fontSize: 12, padding: '8px 14px' }}>+ Employee</Btn>}
        </div>
      </div>

      <TabBar tabs={[{ id: 'attendance', label: '📋 Daily' }, { id: 'history', label: '📆 Monthly' }, { id: 'salary', label: '💰 Salary' }]} active={tab} setActive={setTab} />

      {loading ? <Spinner /> : tab === 'attendance' ? (
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)} style={{ padding: '10px 12px', border: `1.5px solid ${T.border}`, borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: T.text }} />
            <div style={{ background: T.maroon, color: T.gold, padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13 }}>✅ {presentToday}/{activeEmps.length} Present</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
            {visible.map(emp => {
              const rec = getAtt(emp.id);
              const inactive = !emp.active;
              const bc = inactive ? T.borderLight : !rec ? T.borderLight : rec.status === 'present' ? T.green : rec.status === 'absent' ? T.red : T.amber;
              return (
                <Card key={emp.id} style={{ marginBottom: 0, borderLeft: `4px solid ${bc}`, opacity: inactive ? 0.65 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{emp.name}</div>
                        {inactive && <span style={{ background: T.cream, color: T.textGhost, border: `1px solid ${T.borderLight}`, borderRadius: 6, fontSize: 9, fontWeight: 700, padding: '1px 7px', textTransform: 'uppercase' }}>Inactive</span>}
                      </div>
                      <div style={{ fontSize: 12, color: T.textLight }}>{emp.role} · {fmtINR(emp.salary)}/mo</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                      {rec && !inactive && <Badge status={rec.status} />}
                      {user.role === 'owner' && (
                        <button onClick={() => toggleActive(emp.id)} style={{ background: inactive ? T.greenLight : T.redLight, color: inactive ? T.green : T.red, border: 'none', borderRadius: 7, padding: '3px 9px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                          {inactive ? 'Set Active' : 'Set Inactive'}
                        </button>
                      )}


                    </div>
                  </div>
                  {inactive ? (
                    <div style={{ background: T.cream, borderRadius: 8, padding: 10, textAlign: 'center', fontSize: 12, color: T.textGhost, fontStyle: 'italic' }}>Employee is inactive — reactivate to mark attendance</div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['present', 'absent', 'half'].map(s => (
                        <button key={s} onClick={() => mark(emp.id, s)} style={{ flex: 1, border: 'none', borderRadius: 8, padding: '8px 4px', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: rec?.status === s ? (s === 'present' ? T.green : s === 'absent' ? T.red : T.amber) : T.cream, color: rec?.status === s ? T.white : T.textMid }}>
                          {s === 'present' ? '✅ Present' : s === 'absent' ? '❌ Absent' : '🌓 Half'}
                        </button>
                      ))}
                    </div>
                  )}
                  {rec?.status === 'absent' && !inactive && (
                    <div style={{ marginTop: 8 }}>
                      {reasonEdit === emp.id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input value={reasonVal} onChange={e => setReasonVal(e.target.value)} placeholder="Reason for absence…" style={{ flex: 1, padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
                          <button onClick={() => saveReason(emp.id, reasonVal)} style={{ background: T.maroon, color: T.white, border: 'none', borderRadius: 7, padding: '0 12px', cursor: 'pointer', fontWeight: 700 }}>Save</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: T.redLight, borderRadius: 7, padding: '6px 10px' }}>
                          <span style={{ fontSize: 12, color: T.red, fontStyle: rec.reason ? 'normal' : 'italic' }}>{rec.reason || 'No reason added'}</span>
                          <button onClick={() => { setReasonEdit(emp.id); setReasonVal(rec.reason || ''); }} style={{ background: 'none', border: 'none', color: T.maroon, cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>Edit</button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ) : tab === 'history' ? (
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <input type="month" value={selMonth} onChange={e => { setSelMonth(e.target.value); loadSalary(e.target.value); }} style={{ padding: '10px 12px', border: `1.5px solid ${T.border}`, borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: T.text }} />
            <div style={{ fontWeight: 800, color: T.maroon, fontSize: 15, fontFamily: "'Poppins',sans-serif" }}>{monthLabel(selMonth)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
            {salary.map(emp => (
              <Card key={emp.id} style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{emp.name}</div>
                    <div style={{ fontSize: 12, color: T.textLight }}>{emp.role} · {emp.marked}/{emp.daysInMonth} days marked</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['✅', emp.present, T.green, T.greenLight], ['❌', emp.absent, T.red, T.redLight], ['🌓', emp.half, T.amber, T.amberLight]].map(([ic, cnt, c, bg]) => (
                    <div key={ic} style={{ flex: 1, background: bg, borderRadius: 9, padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18 }}>{ic}</div>
                      <div style={{ fontWeight: 800, color: c, fontSize: 16, fontFamily: "'Poppins',sans-serif" }}>{cnt}</div>
                    </div>
                  ))}
                </div>
                {emp.absences?.length > 0 && (
                  <div style={{ marginTop: 10, background: T.redLight, borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700, color: T.red, fontSize: 12, marginBottom: 4 }}>Absence Log:</div>
                    {emp.absences.map((a, i) => <div key={i} style={{ fontSize: 11, color: T.textMid }}>• {a.date ? new Date(a.date).toLocaleDateString('en-IN') : ''}: {a.reason || 'No reason'}</div>)}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <input type="month" value={selMonth} onChange={e => { setSelMonth(e.target.value); loadSalary(e.target.value); }} style={{ padding: '10px 12px', border: `1.5px solid ${T.border}`, borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: T.text }} />
            <div style={{ fontWeight: 800, color: T.maroon, fontSize: 15, fontFamily: "'Poppins',sans-serif" }}>{monthLabel(selMonth)}</div>
          </div>
          <div style={{ background: `linear-gradient(135deg,${T.maroon},${T.maroonDark})`, borderRadius: 16, padding: '16px 22px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(212,160,23,0.65)', fontWeight: 700, textTransform: 'uppercase' }}>Total Monthly Payroll</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: T.gold, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(salary.reduce((s, e) => s + (e.earned || 0), 0))}</div>
            </div>
            <div style={{ fontSize: 36 }}>💰</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
            {salary.map(emp => {
              const expanded = detailEmp === emp.id;
              return (
                <Card key={emp.id} style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: T.textLight }}>{emp.role} · {fmtINR(emp.salary)}/month</div>
                      <div style={{ fontSize: 11, color: T.textGhost, marginTop: 3 }}>✅ {emp.present} &nbsp;❌ {emp.absent} &nbsp;🌓 {emp.half} &nbsp;· {fmtINR(emp.perDay)}/day</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 20, color: T.green, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(emp.earned)}</div>
                      {emp.deducted > 0 && <div style={{ fontSize: 11, color: T.red }}>-{fmtINR(emp.deducted)}</div>}
                    </div>
                  </div>
                  <button onClick={() => setDetailEmp(expanded ? null : emp.id)} style={{ background: 'none', border: 'none', color: T.gold, fontWeight: 700, fontSize: 12, cursor: 'pointer', marginTop: 8, padding: 0 }}>
                    {expanded ? '▲ Hide breakdown' : '▼ Show breakdown'}
                  </button>
                  {expanded && (
                    <div style={{ background: T.cream, borderRadius: 10, padding: 12, marginTop: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, marginBottom: 10 }}>
                        {[['Base Salary', fmtINR(emp.salary)], ['Working Days', emp.daysInMonth], ['Per Day Rate', fmtINR(emp.perDay)], ['Days Present', emp.present], ['Days Absent', emp.absent], ['Half Days', emp.half], ['Deduction', fmtINR(emp.deducted)], ['Net Payable', fmtINR(emp.earned)]].map(([l, v]) => (
                          <div key={l}><span style={{ color: T.textLight }}>{l}: </span><span style={{ fontWeight: 700, color: T.text }}>{v}</span></div>
                        ))}
                      </div>
                      <div style={{ background: T.maroon, borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: T.goldPale, fontWeight: 700 }}>Net Payable</span>
                        <span style={{ color: T.gold, fontWeight: 800, fontSize: 18, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(emp.earned)}</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {addEmp && (
        <Modal title="Add Employee" onClose={() => setAddEmp(false)} width={420}>
          <Input label="Full Name" value={newEmp.name} onChange={e => setNewEmp(v => ({ ...v, name: e.target.value }))} />
          <Input label="Role / Designation" value={newEmp.role} onChange={e => setNewEmp(v => ({ ...v, role: e.target.value }))} />
          <Input label="Monthly Salary ₹" type="number" value={newEmp.salary} onChange={e => setNewEmp(v => ({ ...v, salary: e.target.value }))} />
          <Input label="Phone" type="tel" value={newEmp.phone} onChange={e => setNewEmp(v => ({ ...v, phone: e.target.value }))} />
          <Btn onClick={async () => { await api.post('/employees', { ...newEmp, salary: +newEmp.salary }); toast.success('✅ Employee added!'); setAddEmp(false); setNewEmp({ name: '', role: '', salary: '', phone: '' }); loadEmployees(); }} style={{ width: '100%' }}>Save Employee</Btn>
        </Modal>
      )}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [addUser, setAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'worker' });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (['owner', 'co-owner'].includes(user.role)) api.get('/users').then(r => setUsers(r.data));
  }, []);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.maroon, marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>Settings</div>
      <div className="g2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔧</div>
            <div><div style={{ fontWeight: 800, fontSize: 16, color: T.maroon, fontFamily: "'Poppins',sans-serif" }}>Swastik Auto Repairers</div><div style={{ fontSize: 11, color: T.textLight }}>Manubhai G Joshi Gerej vada</div></div>
          </div>
          {[['📍 Address', '59 Digvijay Plot, ST Main Road, Jamnagar, Gujarat'], ['📞 Kaushik Joshi', '9898165220'], ['📞 Om Joshi', '9998013335'], ['💳 UPI ID', '9898165220@okbizaxis'], ['📅 Established', 'Trusted Since 1952']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
              <span style={{ color: T.textLight, minWidth: 140 }}>{l}</span><span style={{ color: T.text, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </Card>

        <div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.maroon, marginBottom: 12, fontFamily: "'Poppins',sans-serif" }}>👤 My Account</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{user.name}</div><div style={{ fontSize: 12, color: T.textLight }}>@{user.username}</div></div>
              <Badge status={user.role} />
            </div>
          </Card>

          {['owner', 'co-owner'].includes(user.role) && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.maroon, fontFamily: "'Poppins',sans-serif" }}>👥 Team Members</div>
                {user.role === 'owner' && <Btn onClick={() => setAddUser(true)} style={{ fontSize: 11, padding: '6px 12px' }}>+ Add</Btn>}
              </div>
              {users.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.borderLight}` }}>
                  <div><div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{u.name}</div><div style={{ fontSize: 11, color: T.textLight }}>@{u.username}</div></div>
                  <Badge status={u.role} />
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      <Card style={{ marginTop: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.maroon, marginBottom: 12, fontFamily: "'Poppins',sans-serif" }}>🔐 Role Permissions</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 400 }}>
            <thead><tr style={{ background: T.cream }}>{['Feature', '👑 Owner', '🔑 Co-Owner', '🔧 Worker'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: T.textLight, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>
              {[['New Entry', true, true, true], ['Generate Invoice', true, true, true], ['Send WhatsApp', true, true, true], ['View Reports', true, true, false], ['Settlements', true, true, false], ['Add Vendor', true, true, false], ['Manage Users', true, false, false], ['Attendance', true, true, true], ['View Salary', true, true, false], ['Active/Inactive Staff', true, false, false]].map(([f, o, c, w]) => (
                <tr key={f} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: '8px 12px', color: T.textMid }}>{f}</td>
                  {[o, c, w].map((v, i) => <td key={i} style={{ padding: '8px 12px', textAlign: 'center', fontSize: 16 }}>{v ? '✅' : '❌'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <button onClick={logout} style={{ width: '100%', padding: 14, background: T.redLight, color: T.red, border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: "'Poppins',sans-serif", marginTop: 14 }}>🚪 Logout</button>

      {addUser && (
        <Modal title="Add Team Member" onClose={() => setAddUser(false)} width={400}>
          <Input label="Full Name" value={newUser.name} onChange={e => setNewUser(v => ({ ...v, name: e.target.value }))} />
          <Input label="Username" value={newUser.username} onChange={e => setNewUser(v => ({ ...v, username: e.target.value }))} />
          <Input label="Password" type="password" value={newUser.password} onChange={e => setNewUser(v => ({ ...v, password: e.target.value }))} />
          <Select label="Role" value={newUser.role} onChange={e => setNewUser(v => ({ ...v, role: e.target.value }))}><option value="worker">🔧 Worker</option><option value="co-owner">🔑 Co-Owner</option></Select>
          <Btn onClick={async () => { await api.post('/users', newUser); toast.success('✅ User created!'); setAddUser(false); setNewUser({ name: '', username: '', password: '', role: 'worker' }); api.get('/users').then(r => setUsers(r.data)); }} style={{ width: '100%' }}>Create Account</Btn>
        </Modal>
      )}
    </div>
  );
}
