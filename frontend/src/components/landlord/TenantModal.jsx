import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function TenantModal({ modal, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', phone: '', since: '', leaseEnd: '' });

  useEffect(() => {
    if (modal.open) {
      setForm({ name: '', phone: '', since: '', leaseEnd: '' });
    }
  }, [modal.open]);

  if (!modal.open) return null;

  const setField = (key, value) => setForm(p => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      alert('Name and phone are required');
      return;
    }
    onSave(form, modal.unitId, modal.propId);
  };

  return (
    <div className="op-mo open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="op-modal-lg">
        <div className="op-modal-hdr">
          <div className="op-modal-htitle">Assign Tenant</div>
          <button className="op-panel-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="op-fg">
          <div className="op-field">
            <label>Full Name</label>
            <input 
              placeholder="e.g. James Kariuki" 
              value={form.name} 
              onChange={e => setField('name', e.target.value)} 
            />
          </div>
          <div className="op-field">
            <label>Phone Number</label>
            <input 
              placeholder="+254 7XX XXX XXX" 
              value={form.phone} 
              onChange={e => setField('phone', e.target.value)} 
            />
          </div>
          <div className="op-frow">
            <div className="op-field">
              <label>Move-in Date</label>
              <input 
                type="date" 
                value={form.since} 
                onChange={e => setField('since', e.target.value)} 
              />
            </div>
            <div className="op-field">
              <label>Lease End Date</label>
              <input 
                type="date" 
                value={form.leaseEnd} 
                onChange={e => setField('leaseEnd', e.target.value)} 
              />
            </div>
          </div>
        </div>
        <div className="op-form-footer">
          <button className="op-btn op-btn-outline" onClick={onClose}>Cancel</button>
          <button className="op-btn op-btn-primary" onClick={handleSave}>
            Assign Tenant
          </button>
        </div>
      </div>
    </div>
  );
}