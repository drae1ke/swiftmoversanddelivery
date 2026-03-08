import React, { useState, useEffect, useCallback } from 'react';
import StorageCard from '../../components/client/StorageCard';
import { listProperties } from '../../api';
import { FaSearch, FaFilter, FaSlidersH } from 'react-icons/fa';

const STORAGE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'room', label: 'Room' },
  { value: 'garage', label: 'Garage' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'container', label: 'Container' },
  { value: 'basement', label: 'Basement' },
  { value: 'attic', label: 'Attic' },
];

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'size-asc', label: 'Size: Smallest First' },
  { value: 'size-desc', label: 'Size: Largest First' },
  { value: 'newest', label: 'Newest First' },
];

const Storage = ({ isActive, onShowPage }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [storageType, setStorageType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSize, setMinSize] = useState('');
  const [sortBy, setSortBy] = useState('price-asc');

  // Amenity filters
  const [amenityFilters, setAmenityFilters] = useState({
    'security-camera': false,
    '24hr-access': false,
    'climate-controlled': false,
    'parking': false,
    'loading-dock': false,
    'electricity': false,
  });

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { available: 'available' };
      if (storageType) params.storageType = storageType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minSize) params.minSize = minSize;

      const data = await listProperties(params);
      setProperties(data.properties || []);
    } catch (err) {
      setError(err.message || 'Failed to load properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [storageType, minPrice, maxPrice, minSize]);

  useEffect(() => {
    if (isActive) fetchProperties();
  }, [isActive, fetchProperties]);

  const toggleAmenity = (key) =>
    setAmenityFilters(f => ({ ...f, [key]: !f[key] }));

  const handleApplyFilters = () => fetchProperties();

  const handleClearFilters = () => {
    setStorageType('');
    setMinPrice('');
    setMaxPrice('');
    setMinSize('');
    setAmenityFilters(Object.fromEntries(Object.keys(amenityFilters).map(k => [k, false])));
    setSearch('');
  };

  const handleBookStorage = (unit) => {
    sessionStorage.setItem('selectedProperty', JSON.stringify(unit));
    onShowPage('storage-book');
  };

  // Client-side filtering (search + amenities) + sorting
  const activeAmenities = Object.keys(amenityFilters).filter(k => amenityFilters[k]);

  let displayed = properties.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (p.title || '').toLowerCase().includes(q) ||
      (p.address || '').toLowerCase().includes(q) ||
      (p.storageType || '').toLowerCase().includes(q);

    const matchAmenities = activeAmenities.every(a =>
      (p.amenities || []).includes(a)
    );

    return matchSearch && matchAmenities;
  });

  displayed = [...displayed].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.pricePerMonth || 0) - (b.pricePerMonth || 0);
    if (sortBy === 'price-desc') return (b.pricePerMonth || 0) - (a.pricePerMonth || 0);
    if (sortBy === 'size-asc') return (a.sizeSqFt || 0) - (b.sizeSqFt || 0);
    if (sortBy === 'size-desc') return (b.sizeSqFt || 0) - (a.sizeSqFt || 0);
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  if (!isActive) return null;

  return (
    <div className="page active" id="page-storage">
      <div className="page-header">
        <div className="page-tag">Storage Spaces</div>
        <h1 className="page-title">Find Your <span>Storage Space</span></h1>
        <p className="page-desc">Browse secure, verified storage units across Kenya. All spaces are monitored and insured.</p>
      </div>

      <div className="storage-layout">
        {/* Filter sidebar */}
        <div className="filter-panel">
          <div className="filter-title">Filter Spaces</div>

          {/* Storage type */}
          <div className="filter-section">
            <div className="filter-section-label">Storage Type</div>
            <select
              className="filter-select"
              value={storageType}
              onChange={e => setStorageType(e.target.value)}
            >
              {STORAGE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Price range */}
          <div className="filter-section">
            <div className="filter-section-label">Price / Month (KES)</div>
            <div className="filter-range-row">
              <input
                type="number"
                className="filter-input-sm"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                min="0"
              />
              <span className="filter-range-sep">—</span>
              <input
                type="number"
                className="filter-input-sm"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Min size */}
          <div className="filter-section">
            <div className="filter-section-label">Minimum Size (sq ft)</div>
            <input
              type="number"
              className="filter-input"
              placeholder="e.g. 100"
              value={minSize}
              onChange={e => setMinSize(e.target.value)}
              min="0"
            />
          </div>

          {/* Amenities */}
          <div className="filter-section">
            <div className="filter-section-label">Features</div>
            <div className="filter-options">
              {Object.entries(amenityFilters).map(([key, checked]) => (
                <label key={key} className="filter-opt">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAmenity(key)}
                  />
                  <span>{key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="filter-apply" onClick={handleApplyFilters}>
            Apply Filters
          </button>
          <button className="filter-clear" onClick={handleClearFilters}>
            Clear All
          </button>
        </div>

        {/* Results */}
        <div className="storage-results">
          {/* Search + sort toolbar */}
          <div className="storage-toolbar">
            <div className="st-search-wrap">
              <FaSearch size={12} className="st-search-icon" />
              <input
                className="st-search-input"
                placeholder="Search by name, location, type…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="storage-toolbar-right">
              <div className="results-count">
                <strong>{displayed.length}</strong> space{displayed.length !== 1 ? 's' : ''} found
              </div>
              <select
                className="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="loading-message">
              <div className="loading-spinner" /> Loading storage spaces…
            </div>
          )}

          {error && !loading && (
            <div className="error-message">
              {error}
              <button className="retry-btn" onClick={fetchProperties}>Retry</button>
            </div>
          )}

          {!loading && !error && (
            <>
              {displayed.length === 0 ? (
                <div className="no-results">
                  <div className="no-results-icon">
                    <FaSlidersH size={32} />
                  </div>
                  <div className="no-results-title">No spaces found</div>
                  <div className="no-results-desc">Try adjusting your filters or search terms.</div>
                  <button className="filter-clear" onClick={handleClearFilters}>Clear Filters</button>
                </div>
              ) : (
                <div className="storage-grid">
                  {displayed.map(property => (
                    <StorageCard
                      key={property._id}
                      unit={{
                        id: property._id,
                        title: property.title,
                        address: property.address,
                        storageType: property.storageType,
                        sizeSqFt: property.sizeSqFt,
                        pricePerMonth: property.pricePerMonth,
                        amenities: property.amenities || [],
                        images: property.images || [],
                        availability: property.availability,
                      }}
                      onBook={handleBookStorage}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storage;