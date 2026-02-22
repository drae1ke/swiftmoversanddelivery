import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { UNIT_TYPES, UNIT_STATUSES } from '../../utils/utils';

export default function UnitModal({ modal, onClose, onSave }) {
  const [form, setForm] = useState({ 
    unitId: '', size: '', type: 'Small', status: 'vacant', 
    price: '', leaseEnd: '', notes: '' 
  });

  useEffect(() => {
    if (modal.open) {
      setForm({ 
        unitId: '', size: '', type: 'Small', status: 'vacant', 
        price: '', leaseEnd: '', notes: '', ...modal.data 
      });
    }
  }, [modal.open, modal.data]);

  if (!modal.open) return null;

  const setField = (key, value) => setForm(p => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.unitId.trim() || !form.price) {
      alert('Unit ID and price are required');
      return;
    }
    onSave({ ...modal.data, ...form });
  };

  return (
    <div className="op-mo open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="op-modal-xl">
        <div className="op-modal-hdr">
          <div className="op-modal-htitle">
            {modal.mode === 'add' ? 'Add Storage Unit' : `Edit Unit — ${form.unitId}`}
          </div>
          <button className="op-panel-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="op-fg">
          <div className="op-frow">
            <div className="op-field">
              <label>Unit ID</label>
              <input 
                placeholder="e.g. WIU-05" 
                value={form.unitId} 
                onChange={e => setField('unitId', e.target.value)} 
              />
            </div>
            <div className="op-field">
              <label>Size (m²)</label>
              <input 
                type="number" 
                placeholder="e.g. 20" 
                value={form.size} 
                onChange={e => setField('size', e.target.value)} 
              />
            </div>
          </div>
          <div className="op-frow">
            <div className="op-field">
              <label>Type</label>
              <select value={form.type} onChange={e => setField('type', e.target.value)}>
                {UNIT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="op-field">
              <label>Status</label>
              <select value={form.status} onChange={e => setField('status', e.target.value)}>
                {UNIT_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="op-frow">
            <div className="op-field">
              <label>Monthly Price (KES)</label>
              <input 
                type="number" 
                placeholder="e.g. 15000" 
                value={form.price} 
                onChange={e => setField('price', e.target.value)} 
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
          <div className="op-field">
            <label>Notes</label>
            <textarea 
              placeholder="Maintenance notes, access restrictions…" 
              value={form.notes} 
              onChange={e => setField('notes', e.target.value)} 
            />
          </div>
        </div>
        <div className="op-form-footer">
          <button className="op-btn op-btn-outline" onClick={onClose}>Cancel</button>
          <button className="op-btn op-btn-primary" onClick={handleSave}>
            {modal.mode === 'add' ? 'Add Unit' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}