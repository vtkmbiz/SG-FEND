import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { T } from '../utils/theme';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [u, setU] = useState('owner');
  const [p, setP] = useState('owner123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const doLogin = async () => {
    if (!u || !p) return toast.error('Enter username and password');
    setLoading(true);
    try {
      await login(u, p);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '11px 14px', border: `1.5px solid ${T.border}`, borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 12, color: T.text };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg,${T.maroon} 0%,${T.maroonDark} 55%,#3D0E0E 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`*{box-sizing:border-box} input:focus{border-color:${T.gold}!important;outline:none}`}</style>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', border: '40px solid rgba(212,160,23,0.07)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', border: '30px solid rgba(212,160,23,0.05)' }} />
      <div style={{ background: T.white, borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 82, height: 82, borderRadius: '50%', background: T.gold, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, boxShadow: '0 6px 20px rgba(212,160,23,0.4)' }}>🔧</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: T.maroon, fontFamily: "'Poppins',sans-serif" }}>Swastik Auto Repairers</div>
          <div style={{ fontSize: 12, color: T.textLight, marginTop: 4 }}>Manubhai G Joshi · Jamnagar · Since 1952</div>
        </div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textLight, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>Username</label>
        <input value={u} onChange={e => setU(e.target.value)} placeholder="Enter username" style={inp} />
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textLight, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>Password</label>
        <input type="password" value={p} onChange={e => setP(e.target.value)} placeholder="Enter password" style={inp} onKeyDown={e => e.key === 'Enter' && doLogin()} />
        <button onClick={doLogin} disabled={loading} style={{ width: '100%', padding: 13, background: T.maroon, color: T.gold, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", marginTop: 4 }}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>
        <div style={{ marginTop: 18, background: T.cream, borderRadius: 10, padding: '12px 14px', fontSize: 12, lineHeight: 2 }}>
          <div style={{ fontWeight: 800, color: T.maroon, marginBottom: 2 }}>Quick Login</div>
          {[['owner','owner123','Owner'],['kaushik','kaushik123','Co-Owner'],['om','om123','Worker']].map(([un,pw,role]) => (
            <div key={un} onClick={() => { setU(un); setP(pw); }} style={{ cursor: 'pointer', color: T.textMid }}>
              <span style={{ fontWeight: 700, color: T.maroon }}>{un}</span> / {pw} <span style={{ fontSize: 11, color: T.textLight }}>— {role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
