import React, { useState, useEffect } from 'react';
import StorageCard from '../../components/client/StorageCard';
import { listProperties } from '../../api';

const Storage = ({ isActive, onShowPage }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState(20000);
  const [filters, setFilters] = useState({
    nairobi: true,
    mombasa: true,
    kisumu: false,
    nakuru: false,
    eldoret: false,
    small: true,
    medium: true,
    large: false,
    warehouse: false,
    cctv: true,
    climate: false,
    access24: false,
    driveUp: false
  });

  // Fetch properties on mount
  useEffect(() => {
    if (isActive) {
      fetchProperties();
    }
  }, [isActive]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listProperties({
        available: 'true',
        maxPrice: priceRange
      });
      setProperties(data.properties || []);
    } catch (err) {
      setError(err.message || 'Failed to load properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setFilters({ ...filters, [filter]: !filters[filter] });
  };

  const handleApplyFilters = () => {
    fetchProperties();
  };

  const handleBookStorage = (unit) => {
    // Store selected property in sessionStorage for the booking page
    sessionStorage.setItem('selectedProperty', JSON.stringify(unit));
    onShowPage('storage-book');
  };

  if (!isActive) return null;

  return (
    <div className={`page ${isActive ? 'active' : ''}`} id="page-storage">
      <div className="page-header">
        <div className="page-tag">Storage Spaces</div>
        <h1 className="page-title">Find Your <span>Space</span></h1>
        <p className="page-desc">All units are secured, insured, and monitored 24/7. Filter by your needs and book instantly.</p>
      </div>

      <div className="storage-layout">
        {/* Filters */}
        <div className="filter-panel">
          <div className="filter-title">Filter Spaces</div>

          <div className="filter-section">
            <div className="filter-section-label">Location</div>
            <div className="filter-options">
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.nairobi}
                  onChange={() => handleFilterChange('nairobi')}
                />
                <span>Nairobi (8)</span>
              </label>
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.mombasa}
                  onChange={() => handleFilterChange('mombasa')}
                />
                <span>Mombasa (3)</span>
              </label>
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.kisumu}
                  onChange={() => handleFilterChange('kisumu')}
                />
                <span>Kisumu (4)</span>
              </label>
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.nakuru}
                  onChange={() => handleFilterChange('nakuru')}
                />
                <span>Nakuru (2)</span>
              </label>
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.eldoret}
                  onChange={() => handleFilterChange('eldoret')}
                />
                <span>Eldoret (1)</span>
              </label>
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section-label">Unit Size</div>
            <div className="filter-options">
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.small}
                  onChange={() => handleFilterChange('small')}
                />
                <span>Small (1–5 m²)</span>
              </label>
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.medium}
                  onChange={() => handleFilterChange('medium')}
                />
                <span>Medium (5–20 m²)</span>
              </label>
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.large}
                  onChange={() => handleFilterChange('large')}
                />
                <span>Large (20–50 m²)</span>
              </label>
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.warehouse}
                  onChange={() => handleFilterChange('warehouse')}
                />
                <span>Warehouse (50m²+)</span>
              </label>
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section-label">Max Price/Month</div>
            <input 
              type="range" 
              className="filter-range" 
              min="2000" 
              max="50000" 
              value={priceRange} 
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
            />
            <div className="filter-range-vals">
              <span>KES 2,000</span>
              <span>KES {priceRange.toLocaleString()}</span>
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-section-label">Features</div>
            <div className="filter-options">
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.cctv}
                  onChange={() => handleFilterChange('cctv')}
                />
                <span>CCTV Monitored</span>
              </label>
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.climate}
                  onChange={() => handleFilterChange('climate')}
                />
                <span>Climate Controlled</span>
              </label>
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.access24}
                  onChange={() => handleFilterChange('access24')}
                />
                <span>24/7 Access</span>
              </label>
              <label className="filter-opt">
                <input 
                  type="checkbox" 
                  checked={filters.driveUp}
                  onChange={() => handleFilterChange('driveUp')}
                />
                <span>Drive-Up Access</span>
              </label>
            </div>
          </div>

          <button className="filter-apply" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>

        {/* Results */}
        <div className="storage-results">
          {loading && <div className="loading-message">Loading properties...</div>}
          {error && <div className="error-message">Error: {error}</div>}
          
          {!loading && !error && (
            <>
              <div className="storage-toolbar">
                <div className="results-count">
                  <strong>{properties.length} spaces</strong> available near you
                </div>
                <select className="sort-select">
                  <option>Sort: Price — Low to High</option>
                  <option>Sort: Price — High to Low</option>
                  <option>Sort: Size — Smallest First</option>
                  <option>Sort: Nearest First</option>
                </select>
              </div>

              <div className="storage-grid">
                {properties.map(property => (
                  <StorageCard 
                    key={property._id}
                    unit={{
                      id: property._id,
                      name: property.name,
                      location: property.location,
                      icon: '📦',
                      status: property.availability === 'available' ? 'available' : 'limited',
                      badgeText: property.availability === 'available' ? 'Available' : 'Limited',
                      tags: [
                        `${property.sizeSqFt} m²`,
                        ...(property.hasParking ? ['Parking'] : []),
                        ...(property.hasSecurityCameras ? ['CCTV'] : []),
                        ...(property.has24HourAccess ? ['24/7 Access'] : []),
                      ],
                      price: `KES ${property.pricePerMonth?.toLocaleString()}`
                    }}
                    onBook={handleBookStorage}
                  />
                ))}
                {properties.length === 0 && (
                  <div className="no-results">No properties available matching your filters</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storage;