export const T = {
  maroon: '#7B1E1E', maroonDark: '#5C1515',
  gold: '#D4A017', goldLight: '#E8B82A', goldPale: '#F5E6B8', goldBg: '#FBF4E0',
  cream: '#F5F0E8', creamDark: '#EDE4D4',
  white: '#FFFFFF',
  text: '#2C1810', textMid: '#5C3D2E', textLight: '#8B6E5A', textGhost: '#B89A8A',
  green: '#1B6B3A', greenLight: '#E8F5EE',
  red: '#B71C1C', redLight: '#FFEBEE',
  amber: '#B45309', amberLight: '#FEF3C7',
  blue: '#1565C0', blueLight: '#E3F2FD',
  border: '#DDD0B8', borderLight: '#EDE4D4',
};

export const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const todayStr = () => new Date().toISOString().slice(0, 10);
export const currentYM = () => new Date().toISOString().slice(0, 7);
export const monthLabel = (ym) => {
  const [y, m] = ym.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + y;
};
export const daysInMonth = (ym) => {
  const [y, m] = ym.split('-');
  return new Date(+y, +m, 0).getDate();
};
