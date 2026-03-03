import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import { ICONS, COLORS } from '../../utils/utils';
import { uploadImage } from '../../api';

export default function PropertyModal({ modal, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', location: '', icon: '🏢', color: 'c0', images: [] });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (modal.open) {
      setForm({ name: '', location: '', icon: '🏢', color: 'c0', images: [], ...modal.data });
      setUploadError(null);
    }
  }, [modal.open, modal.data]);

  if (!modal.open) return null;

  const setField = (key, value) => setForm(p => ({ ...p, [key]: value }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setUploadError(null);

    for (const file of files) {
      try {
        const result = await uploadImage(file);
        setForm(prev => ({
          ...prev,
          images: [...(prev.images || []), result.url]
        }));
      } catch (err) {
        setUploadError(err.message || 'Failed to upload image');
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

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

          {/* Image Upload Section */}
          <div className="op-field">
            <label>Property Images</label>
            <div style={{
              border: '2px dashed var(--border-l, #cbd5e0)',
              borderRadius: 'var(--r, 8px)',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--off, #f7fafc)',
              marginBottom: 8
            }} onClick={() => fileInputRef.current?.click()}>
              {uploading ? (
                <div style={{ color: 'var(--text-s, #718096)' }}>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Uploading...
                </div>
              ) : (
                <div style={{ color: 'var(--text-s, #718096)' }}>
                  <FaUpload style={{ marginRight: 6 }} />
                  Click to upload images (max 10MB each)
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>
            {uploadError && (
              <div style={{ color: '#e53e3e', fontSize: '0.85rem', marginBottom: 8 }}>{uploadError}</div>
            )}
            {/* Image Previews */}
            {form.images && form.images.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 4
              }}>
                {form.images.map((url, i) => (
                  <div key={i} style={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: '1px solid var(--border-l, #e2e8f0)'
                  }}>
                    <img src={url} alt={`Property ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        fontSize: 10,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaTrash size={8} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="op-form-footer">
          <button className="op-btn op-btn-outline" onClick={onClose}>Cancel</button>
          <button className="op-btn op-btn-primary" onClick={handleSave} disabled={uploading}>
            {modal.mode === 'add' ? 'Add Property' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
