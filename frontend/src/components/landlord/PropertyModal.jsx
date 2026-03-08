import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import { uploadImage } from '../../api';

const STORAGE_TYPES = [
  { value: 'room', label: 'Room' },
  { value: 'garage', label: 'Garage' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'container', label: 'Container' },
  { value: 'basement', label: 'Basement' },
  { value: 'attic', label: 'Attic' },
  { value: 'other', label: 'Other' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'reserved', label: 'Reserved' },
];

const ALL_AMENITIES = [
  { value: 'climate-controlled', label: 'Climate Controlled' },
  { value: 'security-camera', label: 'Security Camera' },
  { value: '24hr-access', label: '24hr Access' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'ventilation', label: 'Ventilation' },
  { value: 'loading-dock', label: 'Loading Dock' },
  { value: 'ground-floor', label: 'Ground Floor' },
  { value: 'first-floor', label: 'First Floor' },
  { value: 'elevator', label: 'Elevator' },
  { value: 'parking', label: 'Parking' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  address: '',
  storageType: 'room',
  sizeSqFt: '',
  pricePerMonth: '',
  availability: 'available',
  amenities: [],
  images: [],
};

export default function PropertyModal({ modal, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (modal.open) {
      if (modal.mode === 'edit' && modal.data) {
        setForm({
          title: modal.data.title || modal.data.name || '',
          description: modal.data.description || modal.data.notes || '',
          address: modal.data.address || modal.data.location || '',
          storageType: modal.data.storageType || 'room',
          sizeSqFt: modal.data.sizeSqFt || modal.data.size || '',
          pricePerMonth: modal.data.pricePerMonth || modal.data.price || '',
          availability: modal.data.availability || 'available',
          amenities: modal.data.amenities || [],
          images: modal.data.images || [],
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setUploadError(null);
    }
  }, [modal.open, modal.mode, modal.data]);

  if (!modal.open) return null;

  const setField = (key, value) => setForm(p => ({ ...p, [key]: value }));

  const toggleAmenity = (val) => {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(val)
        ? p.amenities.filter(a => a !== val)
        : [...p.amenities, val],
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);
    for (const file of files) {
      try {
        const result = await uploadImage(file);
        setForm(prev => ({ ...prev, images: [...(prev.images || []), result.url] }));
      } catch (err) {
        setUploadError(err.message || 'Failed to upload image');
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.sizeSqFt || Number(form.sizeSqFt) <= 0) e.sizeSqFt = 'Valid size required';
    if (!form.pricePerMonth || Number(form.pricePerMonth) <= 0) e.pricePerMonth = 'Valid price required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...(modal.data || {}),
      title: form.title.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      storageType: form.storageType,
      sizeSqFt: Number(form.sizeSqFt),
      pricePerMonth: Number(form.pricePerMonth),
      availability: form.availability,
      amenities: form.amenities,
      images: form.images,
    });
  };

  return (
    <div className="op-mo open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="op-modal-xl">
        <div className="op-modal-hdr">
          <div className="op-modal-htitle">
            {modal.mode === 'add' ? 'Add Storage Property' : 'Edit Storage Property'}
          </div>
          <button className="op-panel-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="op-fg">
          {/* Title */}
          <div className="op-field">
            <label>Property Title *</label>
            <input
              placeholder="e.g. Westlands Warehouse Unit A"
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              className={errors.title ? 'op-field-error' : ''}
            />
            {errors.title && <span className="op-field-err-msg">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="op-field">
            <label>Description *</label>
            <textarea
              placeholder="Describe the storage space — size, access, security, any notable features…"
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              rows={3}
              className={errors.description ? 'op-field-error' : ''}
            />
            {errors.description && <span className="op-field-err-msg">{errors.description}</span>}
          </div>

          {/* Address */}
          <div className="op-field">
            <label>Address / Location *</label>
            <input
              placeholder="e.g. Mombasa Road, Industrial Area, Nairobi"
              value={form.address}
              onChange={e => setField('address', e.target.value)}
              className={errors.address ? 'op-field-error' : ''}
            />
            {errors.address && <span className="op-field-err-msg">{errors.address}</span>}
          </div>

          {/* Storage Type + Availability */}
          <div className="op-frow">
            <div className="op-field">
              <label>Storage Type *</label>
              <select value={form.storageType} onChange={e => setField('storageType', e.target.value)}>
                {STORAGE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="op-field">
              <label>Availability</label>
              <select value={form.availability} onChange={e => setField('availability', e.target.value)}>
                {AVAILABILITY_OPTIONS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Size + Price */}
          <div className="op-frow">
            <div className="op-field">
              <label>Size (sq ft) *</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 200"
                value={form.sizeSqFt}
                onChange={e => setField('sizeSqFt', e.target.value)}
                className={errors.sizeSqFt ? 'op-field-error' : ''}
              />
              {errors.sizeSqFt && <span className="op-field-err-msg">{errors.sizeSqFt}</span>}
            </div>
            <div className="op-field">
              <label>Price per Month (KES) *</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 15000"
                value={form.pricePerMonth}
                onChange={e => setField('pricePerMonth', e.target.value)}
                className={errors.pricePerMonth ? 'op-field-error' : ''}
              />
              {errors.pricePerMonth && <span className="op-field-err-msg">{errors.pricePerMonth}</span>}
            </div>
          </div>

          {/* Amenities */}
          <div className="op-field">
            <label>Amenities & Features</label>
            <div className="op-amenities-grid">
              {ALL_AMENITIES.map(a => (
                <label key={a.value} className="op-amenity-check">
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(a.value)}
                    onChange={() => toggleAmenity(a.value)}
                  />
                  <span>{a.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="op-field">
            <label>Property Images</label>
            {uploadError && <div className="op-upload-err">{uploadError}</div>}
            <div className="op-img-grid">
              {(form.images || []).map((url, i) => (
                <div key={i} className="op-img-thumb">
                  <img src={url} alt={`Property ${i + 1}`} />
                  <button className="op-img-rm" onClick={() => removeImage(i)}>
                    <FaTrash size={10} />
                  </button>
                </div>
              ))}
              <button
                className="op-img-add"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <FaSpinner className="op-spin" /> : <FaUpload size={14} />}
                <span>{uploading ? 'Uploading…' : 'Add Image'}</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
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