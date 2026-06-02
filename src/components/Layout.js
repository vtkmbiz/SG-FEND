import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { T } from '../utils/theme';

const NAV = [
  { path: '/',         icon: '⊞', label: 'Dashboard' },
  { path: '/new',      icon: '＋', label: 'New Job' },
  { path: '/manage',   icon: '≡',  label: 'Manage' },
  { path: '/vendors',  icon: '◈',  label: 'Vendors' },
  { path: '/reports',  icon: '◉',  label: 'Reports', roles: ['owner','co-owner'] },
  { path: '/staff',    icon: '◐',  label: 'Staff' },
  { path: '/settings', icon: '◎',  label: 'Settings' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const nav = NAV.filter(n => !n.roles || n.roles.includes(user?.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.cream, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;}
        @media(min-width:768px){.bottom-nav{display:none!important}.sidebar{display:flex!important}.main-pad{margin-left:220px!important;padding-bottom:20px!important}}
        @media(max-width:767px){.sidebar{display:none!important}.bottom-nav{display:flex!important}}
        .sbi:hover{background:rgba(212,160,23,0.14)!important}
        button{transition:opacity .15s,transform .1s}button:active{transform:scale(0.97)}
        input:focus,select:focus,textarea:focus{border-color:${T.gold}!important;outline:none}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}
        @media(min-width:900px){.g2{grid-template-columns:1fr 1fr!important}}
        @media(min-width:1100px){.g4{grid-template-columns:repeat(4,1fr)!important}}
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar" style={{ width: 220, background: `linear-gradient(180deg,${T.maroon} 0%,${T.maroonDark} 100%)`, position: 'fixed', top: 0, left: 0, bottom: 0, flexDirection: 'column', zIndex: 200, display: 'none' }}>
        <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(212,160,23,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔧</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: T.gold, fontFamily: "'Poppins',sans-serif" }}>Swastik Auto</div>
              <div style={{ fontSize: 10, color: 'rgba(212,160,23,0.55)' }}>Jamnagar · Since 1952</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '10px 10px' }}>
          {nav.map(n => (
            <button key={n.path} className="sbi" onClick={() => navigate(n.path)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', borderRadius: 10, cursor: 'pointer', background: pathname === n.path ? 'rgba(212,160,23,0.18)' : 'transparent', color: pathname === n.path ? T.gold : 'rgba(212,160,23,0.55)', fontWeight: pathname === n.path ? 700 : 500, fontSize: 13, marginBottom: 2, textAlign: 'left', fontFamily: "'Inter',sans-serif" }}>
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(212,160,23,0.1)' }}>
          <div style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>{user?.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(212,160,23,0.5)', textTransform: 'capitalize', marginBottom: 10 }}>{user?.role}</div>
          <button onClick={logout} style={{ background: 'rgba(183,28,28,0.35)', color: '#FFCDD2', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-pad" style={{ flex: 1, marginLeft: 0, paddingBottom: 70 }}>
        {/* Topbar */}
        <div style={{ background: `linear-gradient(90deg,${T.maroon},${T.maroonDark})`, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(92,21,21,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: T.gold, fontFamily: "'Poppins',sans-serif" }}>Swastik Auto Repairers</div>
              <div style={{ fontSize: 9, color: 'rgba(212,160,23,0.55)' }}>Jamnagar · Trusted Since 1952</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: 9, color: 'rgba(212,160,23,0.55)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>

        <div style={{ padding: '16px 14px', maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.white, borderTop: `1px solid ${T.borderLight}`, display: 'none', zIndex: 100, boxShadow: '0 -2px 12px rgba(123,30,30,0.08)' }}>
        {nav.slice(0, 6).map(n => (
          <button key={n.path} onClick={() => navigate(n.path)} style={{ flex: 1, border: 'none', background: 'none', padding: '8px 2px 6px', cursor: 'pointer', borderTop: pathname === n.path ? `3px solid ${T.maroon}` : '3px solid transparent' }}>
            <div style={{ fontSize: 18 }}>{n.icon}</div>
            <div style={{ fontSize: 8, fontWeight: pathname === n.path ? 800 : 500, color: pathname === n.path ? T.maroon : T.textGhost, marginTop: 1, fontFamily: "'Poppins',sans-serif" }}>{n.label}</div>
          </button>
        ))}
      </nav>
    </div>
  );
}
