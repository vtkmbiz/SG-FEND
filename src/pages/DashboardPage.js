import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { T, fmtINR } from '../utils/theme';
import { Card, Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
/* eslint-disable react-hooks/exhaustive-deps */

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: 16, border: `1px solid ${T.borderLight}` }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 11, color: T.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Poppins',sans-serif", marginTop: 2 }}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [entries, setEntries] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [attStats, setAttStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const reqs = [api.get('/entries'), api.get('/vendors'), api.get('/dashboard/attendance')];
    if (['owner', 'co-owner'].includes(user?.role)) {
      reqs.push(api.get('/reports?period=all'), api.get('/settlements'));
    }
    Promise.all(reqs.map(r => r.catch(() => ({ data: null })))).then(([e, v, att, rep, set]) => {
      setEntries((e.data || []).filter(x => !x.invoiced));
      setVendors(v.data || []);
      setAttStats(att.data);
      if (rep?.data) setReport(rep.data);
      if (set?.data) setSettlements(set.data);
    }).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const totalRevenue = report?.summary?.total_revenue || 0;
  const totalDue = vendors.reduce((s, v) => s + parseFloat(v.balance || 0), 0);
  const lastSettle = settlements[0];

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.maroon, marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>Dashboard</div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg,${T.maroon} 0%,${T.maroonDark} 100%)`, borderRadius: 18, padding: '22px 24px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(212,160,23,0.1)' }} />
        <div style={{ fontSize: 11, color: 'rgba(212,160,23,0.65)', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Total Revenue</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: T.gold, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(totalRevenue)}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{new Date().toDateString()} · Jamnagar, Gujarat</div>
      </div>

      {/* Stats grid */}
      <div className="g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard label="Total Revenue" value={fmtINR(totalRevenue)} icon="💰" color={T.green} bg={T.greenLight} />
        <StatCard label="Amount Due" value={fmtINR(report?.summary?.due || 0)} icon="⏰" color={T.red} bg={T.redLight} />
        <StatCard label="Open Jobs" value={entries.length} icon="🔧" color={T.maroon} bg={T.goldBg} />
        <StatCard label="Vendor Dues" value={fmtINR(totalDue)} icon="🏪" color={T.amber} bg={T.amberLight} />
      </div>

      {/* Attendance banner */}
      {attStats && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.maroon, fontFamily: "'Poppins',sans-serif" }}>👥 Today's Staff Attendance</div>
            <div style={{ fontSize: 11, color: T.textLight }}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {[
              { label: 'Present', val: attStats.present, color: T.green, bg: T.greenLight, icon: '✅' },
              { label: 'Absent', val: attStats.absent, color: T.red, bg: T.redLight, icon: '❌' },
              { label: 'Half Day', val: attStats.half, color: T.amber, bg: T.amberLight, icon: '🌓' },
              { label: 'Unmarked', val: attStats.notMarked, color: T.textLight, bg: T.cream, icon: '○' },
            ].map(c => (
              <div key={c.label} style={{ background: c.bg, borderRadius: 10, padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{c.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: c.color, lineHeight: 1, fontFamily: "'Poppins',sans-serif" }}>{c.val}</div>
                <div style={{ fontSize: 9, color: c.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 3 }}>{c.label}</div>
              </div>
            ))}
          </div>
          {attStats.marked > 0 && (
            <div style={{ marginTop: 10, background: T.cream, borderRadius: 8, padding: '6px 12px', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: T.textLight }}>{attStats.marked} of {attStats.total} active staff marked</span>
              <span style={{ color: T.maroon, fontWeight: 700 }}>{Math.round(attStats.present / attStats.total * 100)}% attendance rate</span>
            </div>
          )}
          {attStats.marked === 0 && (
            <div style={{ marginTop: 8, fontSize: 11, color: T.textGhost, textAlign: 'center', fontStyle: 'italic' }}>
              Attendance not marked yet — <span onClick={() => navigate('/staff')} style={{ color: T.maroon, cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>Go to Staff → Daily</span>
            </div>
          )}
        </Card>
      )}

      <div className="g2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
        {/* Last settlement */}
        {lastSettle && (
          <Card>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.maroon, marginBottom: 10, fontFamily: "'Poppins',sans-serif" }}>📊 Last Settlement — {lastSettle.date}</div>
            <div className="g2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {[['Earned', lastSettle.earned, T.green], ['To Vendors', lastSettle.paid_vendors, T.red], ['Expenses', lastSettle.expenses, T.amber], ['Taken Home', lastSettle.taken_home, T.maroon]].map(([l, v, c]) => (
                <div key={l} style={{ background: T.cream, borderRadius: 9, padding: 10 }}>
                  <div style={{ fontSize: 10, color: T.textLight, fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontWeight: 800, color: c, fontSize: 15, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(v)}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Open jobs */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.maroon, marginBottom: 12, fontFamily: "'Poppins',sans-serif" }}>🔧 Open Jobs ({entries.length})</div>
          {entries.length === 0 ? <div style={{ color: T.textGhost, textAlign: 'center', padding: 20, fontSize: 13 }}>No open jobs 🎉</div> :
            entries.map(e => (
              <div key={e.id} onClick={() => navigate('/manage')} style={{ background: T.goldBg, borderRadius: 10, padding: '10px 12px', marginBottom: 8, borderLeft: `3px solid ${T.gold}`, cursor: 'pointer' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{e.customer_name}</div>
                <div style={{ fontSize: 11, color: T.textLight }}>{e.vehicle} · {e.vehicle_no}</div>
                <div style={{ fontSize: 11, color: T.textGhost, marginTop: 2 }}>{e.problems?.slice(0, 55)}…</div>
              </div>
            ))
          }
        </Card>

        {/* Vendor dues */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.maroon, marginBottom: 10, fontFamily: "'Poppins',sans-serif" }}>🏪 Vendor Outstanding</div>
          {vendors.filter(v => parseFloat(v.balance) > 0).map(v => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${T.borderLight}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{v.name}</div>
                <div style={{ fontSize: 11, color: T.textLight }}>{v.type}</div>
              </div>
              <div style={{ fontWeight: 800, color: T.red, fontFamily: "'Poppins',sans-serif" }}>{fmtINR(v.balance)}</div>
            </div>
          ))}
          {vendors.filter(v => parseFloat(v.balance) > 0).length === 0 && <div style={{ color: T.textGhost, fontSize: 13, textAlign: 'center', padding: 12 }}>No outstanding dues 🎉</div>}
        </Card>
      </div>
    </div>
  );
}
