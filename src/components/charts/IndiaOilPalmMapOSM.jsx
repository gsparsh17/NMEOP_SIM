import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Tooltip, LayersControl, ScaleControl, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { stateWiseData, nmeoOPDetailedData } from '../../data/staticData';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom icons
// import React, { useState, useEffect, useMemo } from 'react';
// import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Tooltip, ScaleControl, ZoomControl } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { stateWiseData } from '../../data/staticData';

// // Fix for default markers in React-Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });

// Custom color palette for states
const STATE_COLORS = {
  "Andhra Pradesh": "#1e5c2a",
  "Telangana": "#2ecc71", 
  "Tamil Nadu": "#f39c12",
  "Odisha": "#e74c3c",
  "Karnataka": "#3498db",
  "Chhattisgarh": "#9b59b6",
  "Gujarat": "#1abc9c",
  "Goa": "#f1c40f",
  "Kerala": "#e67e22"
};

export default function IndiaStatesDistrictsMap({ selectedState = "All-India", showDistricts = true }) {
  const [indiaStatesGeoJSON, setIndiaStatesGeoJSON] = useState(null);
  const [selectedStateDistricts, setSelectedStateDistricts] = useState([]);
  const [districtBoundaries, setDistrictBoundaries] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load India states GeoJSON
  useEffect(() => {
    setLoading(true);
    
    // Load Indian states boundaries
    fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson')
      .then(response => response.json())
      .then(data => {
        // Filter to only show states that have oil palm data
        const filteredFeatures = data.features.filter(feature => {
          const stateName = feature.properties.NAME_1;
          return stateWiseData[stateName] || stateName === selectedState;
        });
        
        setIndiaStatesGeoJSON({
          ...data,
          features: filteredFeatures
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading India states GeoJSON:', error);
        setLoading(false);
      });
  }, [selectedState]);

  // Load district boundaries for selected state
  useEffect(() => {
    if (selectedState !== "All-India" && showDistricts) {
      // Try to load district boundaries for the selected state
      fetch('https://raw.githubusercontent.com/geohacker/india/master/district/india_district.geojson')
        .then(response => response.json())
        .then(data => {
          // Filter districts for selected state
          const stateDistricts = stateWiseData[selectedState]?.districts || [];
          const filteredDistricts = data.features.filter(feature => {
            const districtName = feature.properties.NAME_2;
            const stateName = feature.properties.NAME_1;
            return stateName === selectedState && stateDistricts.includes(districtName);
          });
          
          setDistrictBoundaries({
            ...data,
            features: filteredDistricts
          });
          
          // Create district markers with approximate coordinates
          const districtMarkers = filteredDistricts.map(feature => {
            const districtName = feature.properties.NAME_2;
            // Get centroid of district polygon
            const coordinates = getPolygonCentroid(feature.geometry);
            return {
              name: districtName,
              coordinates: coordinates,
              state: selectedState
            };
          });
          
          setSelectedStateDistricts(districtMarkers);
        })
        .catch(error => {
          console.error('Error loading district boundaries:', error);
          // Fallback: create approximate district markers
          createApproximateDistrictMarkers();
        });
    } else {
      setDistrictBoundaries(null);
      setSelectedStateDistricts([]);
    }
  }, [selectedState, showDistricts]);

  // Fallback function to create approximate district markers
  const createApproximateDistrictMarkers = () => {
    if (!stateWiseData[selectedState]?.districts) return;
    
    const stateCoords = getStateCoordinates(selectedState);
    const districts = stateWiseData[selectedState].districts;
    const markers = districts.map((district, index) => {
      // Create a grid of points within the state
      const angle = (index / districts.length) * Math.PI * 2;
      const radius = 0.5; // degrees
      return {
        name: district,
        coordinates: [
          stateCoords[0] + Math.cos(angle) * radius,
          stateCoords[1] + Math.sin(angle) * radius
        ],
        state: selectedState
      };
    });
    
    setSelectedStateDistricts(markers);
  };

  // Calculate centroid of polygon
  const getPolygonCentroid = (geometry) => {
    if (geometry.type === 'Polygon') {
      const coordinates = geometry.coordinates[0];
      let lat = 0, lng = 0;
      coordinates.forEach(coord => {
        lng += coord[0];
        lat += coord[1];
      });
      return [lat / coordinates.length, lng / coordinates.length];
    }
    return [22.0, 79.0]; // Default to center of India
  };

  // Get state center coordinates
  const getStateCoordinates = (stateName) => {
    const coordinates = {
      "Andhra Pradesh": [16.5, 80.0],
      "Telangana": [17.5, 79.0],
      "Tamil Nadu": [10.5, 78.5],
      "Odisha": [20.5, 85.0],
      "Karnataka": [14.5, 76.5],
      "Chhattisgarh": [21.0, 81.5],
      "Gujarat": [22.0, 71.5],
      "Goa": [15.5, 74.0],
      "Kerala": [10.0, 76.5]
    };
    return coordinates[stateName] || [22.0, 79.0];
  };

  // Style for states
  const stateStyle = (feature) => {
    const stateName = feature.properties.NAME_1;
    const stateData = stateWiseData[stateName];
    const isSelected = stateName === selectedState;
    const hasData = !!stateData;
    
    return {
      fillColor: hasData ? (STATE_COLORS[stateName] || '#95a5a6') : '#f0f0f0',
      weight: isSelected ? 4 : 1,
      opacity: isSelected ? 1 : 0.8,
      color: isSelected ? '#0072bc' : '#ffffff',
      fillOpacity: hasData ? 0.7 : 0.3,
      dashArray: hasData ? '' : '5, 5'
    };
  };

  // Style for district boundaries
  const districtStyle = {
    fillColor: 'transparent',
    weight: 2,
    opacity: 0.6,
    color: '#0072bc',
    fillOpacity: 0,
    dashArray: '3, 3'
  };

  // On each state feature
  const onEachState = (feature, layer) => {
    const stateName = feature.properties.NAME_1;
    const stateData = stateWiseData[stateName];
    
    if (stateData) {
      const tooltipContent = `
        <div style="font-weight: bold; font-size: 14px; color: ${STATE_COLORS[stateName] || '#000'}">
          ${stateName}
        </div>
        <div style="font-size: 12px; margin-top: 4px;">
          <strong>Coverage:</strong> ${stateData.coveragePercentage}%<br/>
          <strong>Area Covered:</strong> ${stateData.areaCovered.toLocaleString()} ha<br/>
          <strong>Districts:</strong> ${stateData.districts?.length || 0}
        </div>
      `;
      
      layer.bindTooltip(tooltipContent);
      
      const popupContent = `
        <div style="min-width: 250px; max-width: 300px;">
          <h3 style="margin: 0 0 10px 0; color: ${STATE_COLORS[stateName] || '#000'}">${stateName}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div style="grid-column: span 2; background: #f8f9fa; padding: 8px; border-radius: 4px;">
              <strong>Districts with Oil Palm:</strong><br/>
              ${stateData.districts?.slice(0, 6).join(', ') || 'None specified'}
              ${stateData.districts?.length > 6 ? ` and ${stateData.districts.length - 6} more...` : ''}
            </div>
            <div>
              <strong>Coverage:</strong><br/>
              ${stateData.coveragePercentage}%
            </div>
            <div>
              <strong>Area Covered:</strong><br/>
              ${stateData.areaCovered.toLocaleString()} ha
            </div>
            <div>
              <strong>Potential Area:</strong><br/>
              ${stateData.potentialArea.toLocaleString()} ha
            </div>
            <div>
              <strong>Processing Mills:</strong><br/>
              ${stateData.processingMills || 0}
            </div>
          </div>
          ${stateData.currentFFBPrice ? `
            <div style="margin-top: 8px; padding: 6px; background: #e9f5db; border-radius: 4px; font-size: 11px;">
              <strong>Current FFB Price:</strong> ₹${stateData.currentFFBPrice.toLocaleString()}/MT
            </div>
          ` : ''}
        </div>
      `;
      
      layer.bindPopup(popupContent);
      
      // Hover effects
      layer.on({
        mouseover: (e) => {
          e.target.setStyle({
            weight: 3,
            color: '#0072bc',
            fillOpacity: 0.9
          });
        },
        mouseout: (e) => {
          e.target.setStyle(stateStyle(feature));
        }
      });
    }
  };

  // District marker icon
  const districtIcon = new L.DivIcon({
    className: 'custom-district-marker',
    html: `<div style="
      background: #0072bc;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">●</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg border border-gray-300">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#1e5c2a] border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading India Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-300 shadow-sm relative z-0">
      {/* Toggle District View */}
      <div className="absolute top-4 right-4 z-10">
        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200">
          <input 
            type="checkbox" 
            checked={showDistricts}
            onChange={(e) => {/* Handle toggle via parent */}}
            className="w-4 h-4 text-[#1e5c2a] rounded"
          />
          <span className="text-sm font-medium">Show Districts</span>
        </label>
      </div>

      {/* The Map */}
      <MapContainer
        center={[22.0, 79.0]}
        zoom={5}
        minZoom={4}
        maxZoom={10}
        maxBounds={[[6.0, 68.0], [36.0, 98.0]]} // Restrict to India only
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="rounded-lg"
      >
        {/* Base Map - Light theme focused on India */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={10}
          minZoom={4}
        />

        {/* Indian States */}
        {indiaStatesGeoJSON && (
          <GeoJSON
            key="india-states"
            data={indiaStatesGeoJSON}
            style={stateStyle}
            onEachFeature={onEachState}
          />
        )}

        {/* District Boundaries for Selected State */}
        {selectedState !== "All-India" && showDistricts && districtBoundaries && (
          <GeoJSON
            key="district-boundaries"
            data={districtBoundaries}
            style={districtStyle}
            onEachFeature={(feature, layer) => {
              const districtName = feature.properties.NAME_2;
              layer.bindTooltip(`
                <div style="font-weight: bold; font-size: 12px;">${districtName}</div>
                <div style="font-size: 10px;">${selectedState}</div>
              `);
            }}
          />
        )}

        {/* District Markers with Names */}
        {selectedState !== "All-India" && showDistricts && selectedStateDistricts.map((district, index) => (
          <Marker
            key={`district-${index}`}
            position={[district.coordinates[0], district.coordinates[1]]}
            icon={districtIcon}
          >
            <Tooltip 
              direction="top" 
              offset={[0, -15]} 
              opacity={0.9}
              permanent={false}
            >
              <span className="font-medium text-sm">{district.name}</span>
            </Tooltip>
            <Popup>
              <div className="p-2">
                <h4 className="font-bold text-[#0072bc]">{district.name}</h4>
                <p className="text-sm">
                  <strong>State:</strong> {district.state}<br/>
                  <strong>Status:</strong> Oil Palm Growing District
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Scale Control */}
        <ScaleControl position="bottomright" imperial={false} />
        
        {/* Zoom Control */}
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-300 max-w-xs">
        <h4 className="font-bold mb-2 text-sm">Oil Palm States Legend</h4>
        <div className="space-y-1">
          {Object.entries(STATE_COLORS).map(([state, color]) => (
            <div key={state} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs">{state}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t">
            <div className="w-4 h-4 rounded-full bg-[#0072bc] border-2 border-white"></div>
            <span className="text-xs">District Marker</span>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          {selectedState === "All-India" 
            ? "Click on any state to view details"
            : `Showing ${stateWiseData[selectedState]?.districts?.length || 0} districts in ${selectedState}`}
        </div>
      </div>
    </div>
  );
}