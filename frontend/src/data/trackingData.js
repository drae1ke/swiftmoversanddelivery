export const trackingDB = {
  'SD-2025-48271': {
    type: 'delivery',
    status: 'delivered',
    statusClass: 'delivered',
    icon: '✅',
    eta: 'Delivered — 15 Jan, 5:48 PM',
    etaLabel: 'Delivered On',
    pkg: [
      { l: 'Service', v: 'Express Delivery' },
      { l: 'Package', v: 'Electronics (Small, 0.8kg)' },
      { l: 'From', v: 'Nairobi CBD' },
      { l: 'To', v: 'Kisumu Town' },
      { l: 'Recipient', v: 'Grace Otieno' },
      { l: 'Value', v: 'KES 4,500' },
    ],
    driver: { initials: 'KO', name: 'Kamau Otieno', rating: '⭐ 4.8 · 342 deliveries' },
    timeline: [
      { state: 'done', icon: '✓', title: 'Order Confirmed', desc: 'Booking accepted and driver assigned.', time: '15 Jan, 8:02 AM' },
      { state: 'done', icon: '✓', title: 'Package Picked Up', desc: 'Driver collected from Nairobi CBD.', time: '15 Jan, 9:15 AM' },
      { state: 'done', icon: '✓', title: 'In Transit — Naivasha', desc: 'Package passed Naivasha checkpoint.', time: '15 Jan, 11:40 AM' },
      { state: 'done', icon: '✓', title: 'Approaching Kisumu', desc: 'ETA updated — 45 min away.', time: '15 Jan, 5:12 PM' },
      { state: 'done', icon: '✓', title: 'Delivered', desc: 'Signed for by Grace Otieno at gate.', time: '15 Jan, 5:48 PM' },
    ],
  },
  'CG-2025-33901': {
    type: 'cargo',
    status: 'transit',
    statusClass: 'transit',
    icon: '🚛',
    eta: 'Today, est. 8:00 PM',
    etaLabel: 'Estimated Arrival',
    pkg: [
      { l: 'Service', v: 'Cargo — 3-Tonne Truck' },
      { l: 'Cargo Type', v: 'General Goods' },
      { l: 'Weight', v: '2.4 tonnes' },
      { l: 'From', v: 'Nairobi Industrial Area' },
      { l: 'To', v: 'Eldoret Town' },
      { l: 'Insurance', v: 'Covered (KES 500)' },
    ],
    driver: { initials: 'PM', name: 'Peter Mutua', rating: '⭐ 4.9 · 218 deliveries' },
    timeline: [
      { state: 'done', icon: '✓', title: 'Booking Confirmed', desc: 'Cargo request approved, truck assigned.', time: '2 Jan, 6:00 AM' },
      { state: 'done', icon: '✓', title: 'Loaded & Departed', desc: 'Truck loaded and departed Industrial Area.', time: '2 Jan, 7:30 AM' },
      { state: 'done', icon: '✓', title: 'Nakuru Checkpoint', desc: 'Cargo inspected, all clear.', time: '2 Jan, 11:15 AM' },
      { state: 'current', icon: '→', title: 'En Route — Eldoret', desc: 'Currently on Eldoret Expressway, ~60km out.', time: 'Est. arrival 8:00 PM' },
      { state: 'pending', icon: '5', title: 'Delivery & Offloading', desc: 'Offloading crew will be at destination.', time: 'Pending' },
    ],
  },
  'SD-2025-39104': {
    type: 'delivery',
    status: 'delivered',
    statusClass: 'delivered',
    icon: '✅',
    eta: 'Delivered — 8 Jan, 3:22 PM',
    etaLabel: 'Delivered On',
    pkg: [
      { l: 'Service', v: 'Standard Delivery' },
      { l: 'Package', v: 'Clothes & Accessories (Medium, 3kg)' },
      { l: 'From', v: 'Mombasa, Nyali' },
      { l: 'To', v: 'Nairobi, Westlands' },
      { l: 'Recipient', v: 'James Mwangi' },
      { l: 'Value', v: 'KES 8,200' },
    ],
    driver: { initials: 'AW', name: 'Aisha Wanjiku', rating: '⭐ 4.7 · 189 deliveries' },
    timeline: [
      { state: 'done', icon: '✓', title: 'Order Confirmed', desc: 'Standard delivery booked.', time: '7 Jan, 4:00 PM' },
      { state: 'done', icon: '✓', title: 'Picked Up', desc: 'Collected from Nyali, Mombasa.', time: '8 Jan, 7:00 AM' },
      { state: 'done', icon: '✓', title: 'Departed Mombasa', desc: 'On Nairobi–Mombasa highway.', time: '8 Jan, 7:45 AM' },
      { state: 'done', icon: '✓', title: 'Arrived Nairobi', desc: 'Package entered Nairobi sorting.', time: '8 Jan, 2:30 PM' },
      { state: 'done', icon: '✓', title: 'Delivered', desc: 'Received by James Mwangi, Westlands.', time: '8 Jan, 3:22 PM' },
    ],
  },
  'SD-2024-91822': {
    type: 'delivery',
    status: 'delivered',
    statusClass: 'delivered',
    icon: '✅',
    eta: 'Delivered — 28 Dec, 4:10 PM',
    etaLabel: 'Delivered On',
    pkg: [
      { l: 'Service', v: 'Express Delivery' },
      { l: 'Package', v: 'Documents (Small, 0.1kg)' },
      { l: 'From', v: 'Kisumu Town' },
      { l: 'To', v: 'Nakuru CBD' },
      { l: 'Recipient', v: 'Brian Kariuki' },
      { l: 'Value', v: 'KES 500' },
    ],
    driver: { initials: 'JK', name: 'John Kimani', rating: '⭐ 4.6 · 411 deliveries' },
    timeline: [
      { state: 'done', icon: '✓', title: 'Confirmed', desc: 'Express booking accepted.', time: '28 Dec, 9:00 AM' },
      { state: 'done', icon: '✓', title: 'Picked Up', desc: 'Collected from Kisumu Town.', time: '28 Dec, 10:20 AM' },
      { state: 'done', icon: '✓', title: 'In Transit', desc: 'On Kisumu–Nakuru road.', time: '28 Dec, 12:00 PM' },
      { state: 'done', icon: '✓', title: 'Delivered', desc: 'Signed by Brian Kariuki.', time: '28 Dec, 4:10 PM' },
    ],
  },
  'RL-2024-05512': {
    type: 'relocation',
    status: 'delivered',
    statusClass: 'delivered',
    icon: '✅',
    eta: 'Completed — 15 Dec, 5:30 PM',
    etaLabel: 'Completed On',
    pkg: [
      { l: 'Service', v: 'Residential Relocation' },
      { l: 'Home Size', v: '2 Bedroom' },
      { l: 'From', v: 'Nairobi CBD, Upper Hill' },
      { l: 'To', v: 'Kiambu Town' },
      { l: 'Add-ons', v: 'Packing, Assembly' },
      { l: 'Crew', v: '4 movers + truck' },
    ],
    driver: { initials: 'SM', name: 'Samuel Mwema', rating: '⭐ 4.9 · 95 moves' },
    timeline: [
      { state: 'done', icon: '✓', title: 'Booking Confirmed', desc: 'Moving crew assigned.', time: '14 Dec, 2:00 PM' },
      { state: 'done', icon: '✓', title: 'Packing Started', desc: 'Crew arrived, began packing items.', time: '15 Dec, 8:00 AM' },
      { state: 'done', icon: '✓', title: 'Loaded & Departed', desc: 'All items secured in truck.', time: '15 Dec, 1:00 PM' },
      { state: 'done', icon: '✓', title: 'Arrived Kiambu', desc: 'Truck arrived at new address.', time: '15 Dec, 3:30 PM' },
      { state: 'done', icon: '✓', title: 'Move Completed', desc: 'All items placed, assembly done.', time: '15 Dec, 5:30 PM' },
    ],
  },
};

export const CITIES = {
  nairobi: { name: 'Nairobi', x: 270, y: 220, dx: 8, dy: -10 },
  mombasa: { name: 'Mombasa', x: 390, y: 295, dx: 8, dy: -8 },
  kisumu: { name: 'Kisumu', x: 175, y: 195, dx: -72, dy: 4 },
  nakuru: { name: 'Nakuru', x: 218, y: 190, dx: 8, dy: -10 },
  eldoret: { name: 'Eldoret', x: 188, y: 145, dx: 8, dy: -10 },
  thika: { name: 'Thika', x: 285, y: 195, dx: 8, dy: -10 },
  naivasha: { name: 'Naivasha', x: 238, y: 210, dx: 6, dy: -10 },
  kiambu: { name: 'Kiambu', x: 275, y: 205, dx: 8, dy: -10 },
  malindi: { name: 'Malindi', x: 418, y: 258, dx: 8, dy: -8 },
  garissa: { name: 'Garissa', x: 360, y: 195, dx: 8, dy: -10 },
  nyeri: { name: 'Nyeri', x: 295, y: 170, dx: 8, dy: -10 },
  mandera: { name: 'Mandera', x: 435, y: 78, dx: 8, dy: -10 },
};

export const KE_OUTLINE = 'M 184,20 L 210,18 L 258,24 L 305,22 L 352,28 L 395,42 L 430,58 L 452,80 L 465,108 L 472,140 L 468,168 L 458,192 L 448,212 L 442,234 L 445,258 L 438,278 L 420,295 L 398,308 L 374,316 L 348,322 L 320,326 L 292,322 L 265,314 L 242,300 L 222,282 L 205,260 L 190,238 L 178,215 L 168,192 L 160,168 L 154,144 L 150,118 L 150,92 L 156,68 L 166,46 Z';

export const ROADS = [
  ['nairobi', 'mombasa'], ['nairobi', 'nakuru'], ['nairobi', 'thika'],
  ['nairobi', 'kiambu'], ['nakuru', 'eldoret'], ['nakuru', 'naivasha'],
  ['nakuru', 'kisumu'], ['kisumu', 'eldoret'], ['nairobi', 'nyeri'],
  ['nyeri', 'eldoret'], ['mombasa', 'malindi'], ['nairobi', 'garissa'],
  ['garissa', 'mandera'], ['nairobi', 'naivasha'],
];

export const ROUTES = {
  'SD-2025-48271': { path: ['nairobi', 'naivasha', 'nakuru', 'kisumu'], driverAt: 0.98, label: 'Nairobi → Kisumu' },
  'CG-2025-33901': { path: ['nairobi', 'naivasha', 'nakuru', 'eldoret'], driverAt: 0.72, label: 'Nairobi → Eldoret' },
  'SD-2025-39104': { path: ['mombasa', 'malindi', 'mombasa', 'nairobi'], driverAt: 1.0, label: 'Mombasa → Nairobi' },
  'SD-2024-91822': { path: ['kisumu', 'nakuru'], driverAt: 1.0, label: 'Kisumu → Nakuru' },
  'RL-2024-05512': { path: ['nairobi', 'kiambu'], driverAt: 1.0, label: 'Nairobi → Kiambu' },
};

export const buildMapSvg = (svgElement, routeData, isLive) => {
  // Clear SVG
  while (svgElement.firstChild) svgElement.removeChild(svgElement.firstChild);

  const ns = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

  // Defs (gradient bg)
  const defs = mk('defs', {});
  const grad = mk('linearGradient', { id: 'mapBg', x1: '0', y1: '0', x2: '0', y2: '1' });
  grad.appendChild(mk('stop', { offset: '0%', 'stop-color': '#e8eef4' }));
  grad.appendChild(mk('stop', { offset: '100%', 'stop-color': '#dde6ef' }));
  defs.appendChild(grad);
  svgElement.appendChild(defs);

  // Background
  svgElement.appendChild(mk('rect', { x: '0', y: '0', width: '600', height: '340', fill: 'url(#mapBg)' }));

  // Kenya outline
  svgElement.appendChild(mk('path', {
    d: KE_OUTLINE,
    fill: '#c8d8c0',
    stroke: '#b0c4aa',
    'stroke-width': '1.5',
    opacity: '0.9'
  }));

  // Road network
  ROADS.forEach(([a, b]) => {
    const ca = CITIES[a], cb = CITIES[b];
    if (!ca || !cb) return;
    svgElement.appendChild(mk('line', {
      x1: ca.x, y1: ca.y, x2: cb.x, y2: cb.y,
      stroke: '#b8c4cc', 'stroke-width': '1.5', 'stroke-linecap': 'round', opacity: '0.7'
    }));
  });

  if (!routeData) return;

  const pts = routeData.path.map(k => CITIES[k]).filter(Boolean);
  if (pts.length < 2) return;

  const pathD = 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');

  // Route shadow
  svgElement.appendChild(mk('path', {
    d: pathD, fill: 'none',
    stroke: 'rgba(0,0,0,0.15)', 'stroke-width': '7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  }));

  // Route line
  const routeLine = mk('path', {
    d: pathD, fill: 'none',
    stroke: '#dd3333', 'stroke-width': '4.5',
    'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'stroke-dasharray': isLive ? '10 4' : 'none',
  });
  if (isLive) routeLine.setAttribute('style', 'animation:dashMove 1.2s linear infinite;');
  svgElement.appendChild(routeLine);

  // Completed portion
  const doneRatio = routeData.driverAt;
  if (doneRatio > 0 && doneRatio < 1) {
    const totalSegs = pts.length - 1;
    const doneSegs = Math.floor(doneRatio * totalSegs);
    const segFrac = (doneRatio * totalSegs) - doneSegs;
    const donePts = pts.slice(0, doneSegs + 1);
    if (doneSegs < totalSegs) {
      const p1 = pts[doneSegs], p2 = pts[doneSegs + 1];
      donePts.push({ x: p1.x + (p2.x - p1.x) * segFrac, y: p1.y + (p2.y - p1.y) * segFrac });
    }
    const doneD = 'M ' + donePts.map(p => `${p.x},${p.y}`).join(' L ');
    svgElement.appendChild(mk('path', {
      d: doneD, fill: 'none',
      stroke: '#22a855', 'stroke-width': '4.5',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    }));
  } else if (doneRatio >= 1) {
    svgElement.appendChild(mk('path', {
      d: pathD, fill: 'none',
      stroke: '#22a855', 'stroke-width': '4.5',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    }));
  }

  // Origin pin
  const origin = pts[0];
  svgElement.appendChild(mk('circle', { cx: origin.x, cy: origin.y, r: '8', fill: '#fff', stroke: '#888', 'stroke-width': '2' }));
  const ot = mk('text', { x: origin.x, y: origin.y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: '#555', 'font-size': '8', 'font-weight': '700' });
  ot.textContent = 'A';
  svgElement.appendChild(ot);

  // Destination pin
  const dest = pts[pts.length - 1];
  const pinG = mk('g', { transform: `translate(${dest.x},${dest.y})` });
  pinG.appendChild(mk('path', {
    d: 'M 0,-16 C -8,-16 -8,-4 0,0 C 8,-4 8,-16 0,-16',
    fill: doneRatio >= 1 ? '#22a855' : '#dd3333', stroke: '#fff', 'stroke-width': '1.5'
  }));
  pinG.appendChild(mk('circle', { cx: '0', cy: '-10', r: '3.5', fill: '#fff' }));
  svgElement.appendChild(pinG);

  // City labels
  [...new Set(routeData.path)].forEach(key => {
    const c = CITIES[key];
    if (!c) return;
    svgElement.appendChild(mk('circle', { cx: c.x, cy: c.y, r: '4', fill: '#fff', stroke: '#888', 'stroke-width': '1.5' }));
    const label = mk('text', {
      x: c.x + c.dx, y: c.y + c.dy,
      fill: '#2d3a4a', 'font-size': '10', 'font-weight': '700',
      'font-family': 'DM Sans, sans-serif'
    });
    label.textContent = c.name;
    svgElement.appendChild(label);
  });

  // SVG keyframes
  if (!document.getElementById('svg-anim-style')) {
    const st = document.createElement('style');
    st.id = 'svg-anim-style';
    st.textContent = `
      @keyframes dashMove{to{stroke-dashoffset:-28;}}
      @keyframes svgPulse{0%{transform:scale(.5);opacity:1;}100%{transform:scale(2);opacity:0;}}
    `;
    document.head.appendChild(st);
  }
};