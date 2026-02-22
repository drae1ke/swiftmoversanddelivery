import React from 'react';
import { FaEdit, FaTrash, FaCheck, FaPlus } from 'react-icons/fa';
import { formatNumber, getPillClass } from '../../utils/utils';

export default function PaymentsPage({ 
  active, filtPayments, payFilter, setPayFilter, 
  setPayMod, markPaid, deletePayment 
}) {
  if (!active) return null;

  const filters = ['all', 'paid', 'pending', 'overdue'];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return '✅';
      case 'overdue': return '🔴';
      default: return '🕐';
    }
  };

  return (
    <div className="op-page active">
      <div className="op-page-header">
        <div className="op-tag">Financials</div>
        <h1 className="op-page-title">Rent <span>Payments</span></h1>
        <p className="op-page-desc">Track, record, and manage all rent payments across your units.</p>
      </div>
      <div className="op-toolbar">
        <div className="op-filter-tabs">
          {filters.map(f => (
            <button 
              key={f} 
              className={`op-tab ${payFilter === f ? 'active' : ''}`} 
              onClick={() => setPayFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button 
          className="op-btn op-btn-primary" 
          onClick={() => setPayMod({ 
            open: true, 
            mode: 'add', 
            data: { tenant: '', unit: '', amount: '', date: '', status: 'pending', type: 'Rent', propId: '' } 
          })}
        >
          <FaPlus /> Record Payment
        </button>
      </div>
      <div className="op-payment-list">
        {filtPayments.map(p => (
          <div key={p.id} className="op-payment-row">
            <div className="op-payment-icon">{getStatusIcon(p.status)}</div>
            <div className="op-payment-info">
              <div className="op-payment-name">{p.tenant}</div>
              <div className="op-unit-meta">{p.unit} · {p.type} · {p.date}</div>
            </div>
            <span className={`op-pill ${getPillClass(p.status)}`}>{p.status}</span>
            <div className={`op-payment-amount ${p.status === 'paid' ? 'credit' : 'debit'}`}>
              KES {formatNumber(p.amount)}
            </div>
            <div className="op-row-actions">
              {p.status !== 'paid' && (
                <button className="op-btn op-btn-success op-btn-xs" onClick={() => markPaid(p.id)}>
                  <FaCheck /> Paid
                </button>
              )}
              <button className="op-btn op-btn-outline op-btn-xs" onClick={() => setPayMod({ open: true, mode: 'edit', data: { ...p } })}>
                <FaEdit />
              </button>
              <button className="op-btn op-btn-danger op-btn-xs" onClick={() => deletePayment(p.id)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
        {filtPayments.length === 0 && (
          <div className="op-empty">No payments match your filter.</div>
        )}
      </div>
    </div>
  );
}