import { useState } from 'react';
import { T } from '../utils/theme';

const iStyle = {
  width: '100%', padding: '10px 13px',
  border: `1.5px solid ${T.border}`, borderRadius: 9,
  fontSize: 14, fontFamily: 'inherit', color: T.text,
  background: T.white, outline: 'none', boxSizing: 'border-box',
};

export function Input({ label, value, onChange, type = 'text', placeholder, style = {}, rows }) {
  const [focus, setFocus] = useState(false);
  const s = { ...iStyle, borderColor: focus ? T.gold : T.border, ...style };
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: T.textLight, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>{label}</label>}
      {rows
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ ...s, resize: 'vertical', lineHeight: 1.5 }} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={s} />
      }
    </div>
  );
}

export function Select({ label, value, onChange, children, style = {} }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: T.textLight, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>{label}</label>}
      <select value={value} onChange={onChange} style={{ ...iStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237B1E1E'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32, ...style }}>
        {children}
      </select>
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', style = {}, disabled = false, type = 'button' }) {
  const variants = {
    primary: { background: T.maroon, color: T.white, border: 'none' },
    gold:    { background: T.gold, color: T.maroon, border: 'none' },
    outline: { background: 'transparent', color: T.maroon, border: `1.5px solid ${T.maroon}` },
    ghost:   { background: T.cream, color: T.textMid, border: `1px solid ${T.borderLight}` },
    green:   { background: T.green, color: T.white, border: 'none' },
    red:     { background: T.redLight, color: T.red, border: 'none' },
    blue:    { background: T.blue, color: T.white, border: 'none' },
    wa:      { background: '#25D366', color: '#fff', border: 'none' },
  };
  const base = variants[variant] || variants.primary;
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13, fontFamily: "'Poppins', sans-serif", cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, ...style }}>
      {children}
    </button>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.white, borderRadius: 14, padding: '16px 18px', marginBottom: 12, border: `1px solid ${T.borderLight}`, boxShadow: '0 2px 8px rgba(123,30,30,0.06)', ...style }}>
      {children}
    </div>
  );
}

export function Badge({ status }) {
  const map = {
    paid:        { bg: T.greenLight, color: T.green,     label: '✓ Paid' },
    pending:     { bg: T.amberLight, color: T.amber,     label: '⏳ Pending' },
    due:         { bg: T.redLight,   color: T.red,       label: '⚠ Due' },
    open:        { bg: T.goldBg,     color: T.maroon,    label: '🔧 Open' },
    invoiced:    { bg: T.greenLight, color: T.green,     label: '✓ Invoiced' },
    owner:       { bg: T.goldPale,   color: T.maroon,    label: '👑 Owner' },
    'co-owner':  { bg: T.blueLight,  color: T.blue,      label: '🔑 Co-Owner' },
    worker:      { bg: T.greenLight, color: T.green,     label: '🔧 Worker' },
    present:     { bg: T.greenLight, color: T.green,     label: 'Present' },
    absent:      { bg: T.redLight,   color: T.red,       label: 'Absent' },
    half:        { bg: T.amberLight, color: T.amber,     label: 'Half Day' },
    active:      { bg: T.greenLight, color: T.green,     label: '● Active' },
    inactive:    { bg: T.cream,      color: T.textGhost, label: '○ Inactive' },
  };
  const m = map[status] || { bg: T.cream, color: T.textMid, label: status };
  return <span style={{ background: m.bg, color: m.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{m.label}</span>;
}

export function Modal({ title, children, onClose, width = 520 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,24,16,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.white, borderRadius: 18, padding: '24px 24px 28px', width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 16px 48px rgba(123,30,30,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.maroon, fontFamily: "'Poppins', sans-serif" }}>{title}</div>
          <button onClick={onClose} style={{ border: 'none', background: T.creamDark, color: T.textMid, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function TabBar({ tabs, active, setActive }) {
  return (
    <div style={{ display: 'flex', background: T.creamDark, borderRadius: 12, padding: 4, marginBottom: 16 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{ flex: 1, border: 'none', borderRadius: 9, padding: '9px 6px', background: active === t.id ? T.maroon : 'transparent', color: active === t.id ? T.gold : T.textLight, fontWeight: active === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${T.borderLight}`, borderTop: `3px solid ${T.maroon}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function Empty({ icon = '📋', text = 'Nothing here yet' }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: T.textGhost }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{text}</div>
    </div>
  );
}
