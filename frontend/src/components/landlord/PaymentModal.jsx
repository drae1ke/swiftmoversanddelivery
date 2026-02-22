import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function PaymentModal({ modal, onClose, onSave, allUnits }) {
  const [form, setForm] = useState({ 
    tenant: '', unit: '', amount: '', date: '', 
    status: 'pending', type: 'Rent', propId: '' 
  });

  useEffect(() => {
    if (modal.open) {
      setForm({ 
        tenant: '', unit: '', amount: '', 
        date: new Date().toISOString().split('T')[0], 
        status: 'pending', type: 'Rent', propId: '', 
        ...modal.data 
      });
    }
  }, [modal.open, modal.data]);

  if (!modal.open) return null;

  const setField = (key, value) => setForm(p => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.tenant.trim() || !form.amount) {
      alert('Tenant and amount are required');
      return;
    }
    onSave({ ...modal.data, ...form });
  };

  return (
    <div className="op-mo open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="op-modal-lg">
        <div className="op-modal-hdr">
          <div className="op-modal-htitle">{modal.mode === 'add' ? 'Record Payment' : 'Edit Payment'}</div>
          <button className="op-panel-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="op-fg">
          <div className="op-frow">
            <div className="op-field">
              <label>Tenant Name</label>
              <input 
                placeholder="e.g. James Kariuki" 
                value={form.tenant} 
                onChange={e => setField('tenant', e.target.value)} 
              />
            </div>
            <div className="op-field">
              <label>Unit</label>
              <select value={form.unit} onChange={e => setField('unit', e.target.value)}>
                <option value="">— Select Unit —</option>
                {allUnits.map(u => (
                  <option key={u.id} value={u.unitId}>{u.unitId} · {u.propName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="op-frow">
            <div className="op-field">
              <label>Amount (KES)</label>
              <input 
                type="number" 
                placeholder="e.g. 18000" 
                value={form.amount} 
                onChange={e => setField('amount', e.target.value)} 
              />
            </div>
            <div className="op-field">
              <label>Payment Date</label>
              <input 
                type="date" 
                value={form.date} 
                onChange={e => setField('date', e.target.value)} 
              />
            </div>
          </div>
          <div className="op-frow">
            <div className="op-field">
              <label>Status</label>
              <select value={form.status} onChange={e => setField('status', e.target.value)}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="op-field">
              <label>Type</label>
              <select value={form.type} onChange={e => setField('type', e.target.value)}>
                <option>Rent</option>
                <option>Deposit</option>
                <option>Penalty</option>
                <option>Service Charge</option>
              </select>
            </div>
          </div>
        </div>
        <div className="op-form-footer">
          <button className="op-btn op-btn-outline" onClick={onClose}>Cancel</button>
          <button className="op-btn op-btn-primary" onClick={handleSave}>
            {modal.mode === 'add' ? 'Record Payment' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}