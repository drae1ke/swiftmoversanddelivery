import React, { useEffect, useRef } from 'react';
import { KE_OUTLINE, CITIES, ROADS, buildMapSvg } from '../../data/trackingData';

const TrackingMap = ({ routeData, isLive }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && routeData) {
      buildMapSvg(svgRef.current, routeData, isLive);
    }
  }, [routeData, isLive]);

  if (!routeData) return null;

  return (
    <div className="map-card">
      <div className="map-header">
        <div className="map-header-left">
          <span className="map-title">Live Route Map</span>
          <span className={`map-live-dot ${!isLive ? 'grey' : ''}`}>
            <span className="map-live-pulse"></span>
            {isLive ? 'Live' : 'Completed'}
          </span>
        </div>
        <div className="map-route-label">{routeData.label}</div>
      </div>
      <div className="map-body">
        <svg 
          ref={svgRef}
          id="track-map-svg" 
          viewBox="0 0 600 340" 
          preserveAspectRatio="xMidYMid meet"
        ></svg>
      </div>
    </div>
  );
};

export default TrackingMap;