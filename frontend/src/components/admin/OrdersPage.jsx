import React from 'react';
import { FaSearch } from 'react-icons/fa';

export default function OrdersPage({
  active, filtOrders, orderSearch, setOrderSearch,
  orderFilter, setOrderFilter, setPanel
}) {
  if (!active) return null;

  const filters = ['all', 'pending', 'assigned', 'in-transit', 'delivered'];

  const statusLabel = (s) => {
    if (s === 'in-transit') return 'In Transit';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <div className="ap-page active">
      <div className="ap-page-header">
        <div className="ap-tag">Operations</div>
        <h1 className="ap-page-title">All <span>Orders</span></h1>
        <p className="ap-page-desc">View and manage all delivery orders across the platform.</p>
      </div>
      <div className="ap-toolbar">
        <div className="ap-search-wrap">
          <span className="ap-search-icon"><FaSearch size={12} /></span>
          <input
            placeholder="Search by order ID, client, or driver…"
            value={orderSearch}
            onChange={e => setOrderSearch(e.target.value)}
          />
        </div>
        <div className="ap-filter-tabs">
          {filters.map(f => (
            <button
              key={f}
              className={`ap-tab ${orderFilter === f ? 'active' : ''}`}
              onClick={() => setOrderFilter(f)}
            >
              {f === 'all' ? 'All' : statusLabel(f)}
            </button>
          ))}
        </div>
      </div>
      <div className="ap-card">
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtOrders.map(o => (
                <tr key={o.id} onClick={() => setPanel({ open: true, type: 'order', data: o })}>
                  <td>
                    <div className="ap-td-name" style={{ fontFamily: 'var(--font-d)', fontSize: '.82rem' }}>
                      #{o.shortId}
                    </div>
                  </td>
                  <td style={{ fontSize: '.84rem' }}>{o.clientName}</td>
                  <td style={{ fontSize: '.84rem' }}>{o.driverName}</td>
                  <td style={{ fontSize: '.78rem', color: 'var(--muted)', maxWidth: 200 }}>
                    {o.from} → {o.to}
                  </td>
                  <td>
                    <span className="ap-pill ap-pill-info" style={{ textTransform: 'capitalize' }}>
                      {o.vehicleType}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-d)', fontSize: '.9rem' }}>
                    KES {o.amount.toLocaleString()}
                  </td>
                  <td><span className={`ap-pill ap-pill-${o.status}`}>{statusLabel(o.status)}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{o.date}</td>
                </tr>
              ))}
              {filtOrders.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="ap-empty">No orders match your filter.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
