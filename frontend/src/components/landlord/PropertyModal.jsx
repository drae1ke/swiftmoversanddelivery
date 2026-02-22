import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ICONS, COLORS } from '../../utils/utils';

export default function PropertyModal({ modal, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', location: '', icon: '🏢', color: 'c0' });

  useEffect(() => {
    if (modal.open) {
      setForm({ name: '', location: '', icon: '🏢', color: 'c0', ...modal.data });
    }
  }, [modal.open, modal.data]);

  if (!modal.open) return null;

  const setField = (key, value) => setForm(p => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.location.trim()) {
      alert('Name and location are required');
      return;
    }
    onSave({ ...modal.data, ...form });
  };

  return (
    <div className="op-mo open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="op-modal-lg">
        <div className="op-modal-hdr">
          <div className="op-modal-htitle">{modal.mode === 'add' ? 'Add Property' : 'Edit Property'}</div>
          <button className="op-panel-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="op-fg">
          <div className="op-field">
            <label>Property Name</label>
            <input 
              placeholder="e.g. Westlands Industrial Units" 
              value={form.name} 
              onChange={e => setField('name', e.target.value)} 
            />
          </div>
          <div className="op-field">
            <label>Location / Address</label>
            <input 
              placeholder="e.g. Westlands, Nairobi" 
              value={form.location} 
              onChange={e => setField('location', e.target.value)} 
            />
          </div>
          <div className="op-frow">
            <div className="op-field">
              <label>Icon</label>
              <select value={form.icon} onChange={e => setField('icon', e.target.value)}>
                {ICONS.map(ic => <option key={ic} value={ic}>{ic} {ic}</option>)}
              </select>
            </div>
            <div className="op-field">
              <label>Card Colour</label>
              <select value={form.color} onChange={e => setField('color', e.target.value)}>
                {COLORS.map((c, i) => <option key={c} value={c}>Colour {i + 1}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="op-form-footer">
          <button className="op-btn op-btn-outline" onClick={onClose}>Cancel</button>
          <button className="op-btn op-btn-primary" onClick={handleSave}>
            {modal.mode === 'add' ? 'Add Property' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}