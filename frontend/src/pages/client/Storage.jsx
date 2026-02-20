import React, { useState } from 'react';
import StorageCard from '../../components/client/StorageCard';
import { storageUnits } from '../../data/StorageData';

const Storage = ({ isActive, onShowPage }) => {
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

  const handleFilterChange = (filter) => {
    setFilters({ ...filters, [filter]: !filters[filter] });
  };

  const handleApplyFilters = () => {
    // In a real app, this would filter the results
    console.log('Applying filters:', filters, priceRange);
  };

  const handleBookStorage = (unit) => {
    // Navigate to booking page with selected unit
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
          <div className="storage-toolbar">
            <div className="results-count">
              <strong>{storageUnits.length} spaces</strong> available near you
            </div>
            <select className="sort-select">
              <option>Sort: Price — Low to High</option>
              <option>Sort: Price — High to Low</option>
              <option>Sort: Size — Smallest First</option>
              <option>Sort: Nearest First</option>
            </select>
          </div>

          <div className="storage-grid">
            {storageUnits.map(unit => (
              <StorageCard 
                key={unit.id}
                unit={unit}
                onBook={handleBookStorage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storage;