export const mkInitials = (name) => {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
};



// Helper functions
let _id = 1000;
export const nid = () => `d${++_id}`;

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};


export const formatNumber = (n) => Number(n).toLocaleString();

export const getPillClass = (status) => {
  switch(status) {
    case 'occupied': return 'op-pill-occupied';
    case 'maintenance': return 'op-pill-maintenance';
    case 'vacant': return 'op-pill-vacant';
    case 'paid': return 'op-pill-paid';
    case 'pending': return 'op-pill-pending';
    case 'overdue': return 'op-pill-overdue';
    case 'expiring': return 'op-pill-expiring';
    case 'expired': return 'op-pill-expired';
    default: return 'op-pill-vacant';
  }
};

export const getOccupancyBadge = (units) => {
  const pct = units.length ? Math.round(units.filter(u => u.status === 'occupied').length / units.length * 100) : 0;
  if (pct === 100) return ['op-pbadge-full', 'Full'];
  if (pct > 0) return ['op-pbadge-partial', 'Partial'];
  return ['op-pbadge-vacant', 'Vacant'];
};

export const COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kiambu', 'Machakos'];
export const ICONS = ['🏭', '🏢', '🏗️', '📦', '🏠', '🏪', '🏬', '🏰'];
export const COLORS = ['c0', 'c1', 'c2', 'c3', 'c4'];
export const UNIT_TYPES = ['Mini', 'Small', 'Medium', 'Standard', 'Large', 'Warehouse'];
export const UNIT_STATUSES = ['vacant', 'occupied', 'maintenance'];

export const ACTIVITY = [
  { color: 'g', text: '<strong>KSC-02</strong> — rent received · Grace Njeri', time: '2 hrs ago' },
  { color: 'r', text: '<strong>WIU-03</strong> — unit listed as vacant', time: '5 hrs ago' },
  { color: 'a', text: '<strong>WIU-04</strong> — maintenance flagged', time: 'Yesterday' },
  { color: 'g', text: '<strong>MRW-01</strong> — lease renewed · 12 months', time: '2 days ago' },
  { color: 'r', text: '<strong>MRW-02</strong> — rent payment overdue', time: '3 days ago' },
];