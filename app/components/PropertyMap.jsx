"use client";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";

const PropertyMap = ({ property }) => {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapImageLoaded, setMapImageLoaded] = useState(false);
  const [mapImageError, setMapImageError] = useState(false);
  const [currentMapService, setCurrentMapService] = useState(0);

  // Geocoding function
  useEffect(() => {
    console.log("Property data:", property);

    if (!property?.location) {
      console.error("No property location data provided");
      setLat(40.7128); // Default to NYC
      setLng(-74.0060);
      setLoading(false);
      return;
    }

    const fetchCoords = async () => {
      try {
        // Known city coordinates for immediate results
        const cityCoordinates = {
          "miami": { lat: 25.7617, lng: -80.1918 },
          "new york": { lat: 40.7128, lng: -74.0060 },
          "los angeles": { lat: 34.0522, lng: -118.2437 },
          "chicago": { lat: 41.8781, lng: -87.6298 },
          "houston": { lat: 29.7604, lng: -95.3698 },
          "phoenix": { lat: 33.4484, lng: -112.0740 },
          "philadelphia": { lat: 39.9526, lng: -75.1652 },
          "san antonio": { lat: 29.4241, lng: -98.4936 },
          "san diego": { lat: 32.7157, lng: -117.1611 },
          "dallas": { lat: 32.7767, lng: -96.7970 },
          "portland": { lat: 45.5152, lng: -122.6784 },
          "seattle": { lat: 47.6062, lng: -122.3321 },
          "boston": { lat: 42.3601, lng: -71.0589 },
          "denver": { lat: 39.7392, lng: -104.9903 },
          "atlanta": { lat: 33.7490, lng: -84.3880 }
        };

        const cityName = property.location.city?.toLowerCase();
        console.log("Looking for city:", cityName);
        
        if (cityName && cityCoordinates[cityName]) {
          const coords = cityCoordinates[cityName];
          console.log("Using coordinates for", cityName, coords);
          setLat(coords.lat);
          setLng(coords.lng);
          setLoading(false);
          return;
        }

        // Try OpenStreetMap geocoding as backup
        try {
          const fullAddress = [
            property.location.street,
            property.location.city,
            property.location.state,
            property.location.zipcode
          ].filter(Boolean).join(', ');

          const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`;
          console.log("Trying geocoding for:", fullAddress);
          
          const response = await fetch(nominatimUrl);
          const data = await response.json();
          
          if (data && data.length > 0) {
            const latitude = parseFloat(data[0].lat);
            const longitude = parseFloat(data[0].lon);
            console.log("Geocoding success:", { latitude, longitude });
            setLat(latitude);
            setLng(longitude);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log("Geocoding failed:", error);
        }

        // Default coordinates if everything fails
        console.log("Using default coordinates (NYC)");
        setLat(40.7128);
        setLng(-74.0060);
        setLoading(false);

      } catch (error) {
        console.error("Error in fetchCoords:", error);
        setLat(40.7128);
        setLng(-74.0060);
        setLoading(false);
      }
    };

    fetchCoords();
  }, [property]);

  // Generate Google Maps Navigation PNG URLs
  const getGoogleNavigationMapUrls = () => {
    if (!lat || !lng) return [];
    
    // Navigation-style parameters with enhanced features
    const baseParams = `center=${lat},${lng}&zoom=16&size=640x400&scale=2&format=png&maptype=roadmap`;
    
    return [
      // Option 1: Navigation style with enhanced markers and path-ready styling
      `https://maps.gomaps.pro/maps/api/staticmap?${baseParams}&markers=color:blue%7Csize:mid%7Cicon:https://maps.google.com/mapfiles/ms/icons/blue-dot.png%7C${lat},${lng}&style=feature:poi%7Celement:labels%7Cvisibility:on&style=feature:road%7Celement:geometry%7Ccolor:0xffffff&key=${process.env.NEXT_PUBLIC_GO_MAPS_PRO_API_KEY}`,
      
      // Option 2: Google Navigation style with route-ready appearance
      `https://maps.googleapis.com/maps/api/staticmap?${baseParams}&markers=anchor:center%7Cicon:https://maps.google.com/mapfiles/ms/icons/blue-dot.png%7C${lat},${lng}&style=feature:road.highway%7Celement:geometry%7Ccolor:0x4285f4&style=feature:road.arterial%7Celement:geometry%7Ccolor:0xffffff&key=${process.env.NEXT_PUBLIC_GO_MAPS_PRO_API_KEY}`,
      
      // Option 3: Enhanced navigation view with cleaner roads
      `https://maps.googleapis.com/maps/api/staticmap?${baseParams}&markers=color:0x4285f4%7Csize:mid%7C${lat},${lng}&style=feature:poi.business%7Celement:labels%7Cvisibility:off&style=feature:road%7Celement:labels%7Cvisibility:on&key=${process.env.NEXT_PUBLIC_GO_MAPS_PRO_API_KEY}`,
      
      // Fallback: OpenStreetMap static map (no API key required)
      `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=640x400&maptype=mapnik&markers=${lat},${lng},lightblue`,
    ];
  };

  const mapUrls = getGoogleNavigationMapUrls();

  const handleImageLoad = () => {
    console.log(`Google Navigation Maps loaded successfully from service ${currentMapService + 1}`);
    setMapImageLoaded(true);
    setMapImageError(false);
  };

  const handleImageError = () => {
    console.log(`Google Navigation service ${currentMapService + 1} failed`);
    
    if (currentMapService < mapUrls.length - 1) {
      console.log(`Trying next Google Navigation service (${currentMapService + 2}/${mapUrls.length})`);
      setCurrentMapService(currentMapService + 1);
      setMapImageLoaded(false);
      setMapImageError(false);
    } else {
      console.log("All Google Navigation services failed");
      setMapImageError(true);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-64 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Spinner />
            <p className="mt-2 text-sm text-gray-500">Finding location...</p>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Property Address</h3>
              <p className="text-sm text-gray-500 mt-1">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMapUrl = mapUrls[currentMapService];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Map Background Container */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        
        {/* Loading state */}
        {!mapImageLoaded && !mapImageError && currentMapUrl && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Spinner />
              <p className="mt-2 text-xs text-gray-500">
                Loading Google Navigation ({currentMapService + 1}/{mapUrls.length})...
              </p>
            </div>
          </div>
        )}

        {/* Map Image */}
        {currentMapUrl && (
          <img
            key={currentMapService} // Force re-render when URL changes
            src={currentMapUrl}
            alt="Google Navigation Maps - Property Location"
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              mapImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ 
              maxWidth: '100%', 
              height: '100%',
              imageRendering: 'crisp-edges'
            }}
          />
        )}

        {/* Fallback when all map services fail */}
        {mapImageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-blue-100">
            {/* Simulate map grid */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(66,133,244,.2) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(66,133,244,.2) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Center marker and info */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 text-5xl mb-2">📍</div>
                <div className="bg-white rounded-lg shadow-lg p-3 border">
                  <h4 className="font-medium text-gray-800 text-sm mb-1">Property Location</h4>
                  <p className="text-xs text-gray-600">
                    {property.location.city}, {property.location.state}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {lat?.toFixed(4)}, {lng?.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map controls overlay */}
        {mapImageLoaded && (
          <>
            {/* Google Navigation logo style indicator */}
            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded shadow text-xs font-medium text-gray-700 flex items-center gap-1">
              <span className="text-blue-500">🧭</span>
              Google Navigation
            </div>
            
            {/* Coordinates */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
              {lat?.toFixed(4)}, {lng?.toFixed(4)}
            </div>
            
            {/* Zoom controls style */}
            <div className="absolute top-2 right-2 bg-white shadow-lg rounded">
              <div className="px-2 py-1 text-xs text-gray-600 border-b cursor-pointer hover:bg-gray-50">+</div>
              <div className="px-2 py-1 text-xs text-gray-600 cursor-pointer hover:bg-gray-50">−</div>
            </div>
          </>
        )}

        {/* Success indicator */}
        {mapImageLoaded && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <span>✓</span>
            Google Navigation
          </div>
        )}
      </div>

      {/* Property Address Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Property Address</h3>
            <p className="text-sm text-gray-500">
              {property.location.street && (
                <>
                  {property.location.street}<br />
                </>
              )}
              {property.location.city}, {property.location.state} {property.location.zipcode}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="ml-4">
            <p className="text-xs text-gray-500 mb-2">Quick Actions</p>
            <div className="space-y-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors text-center"
              >
                View in Google Maps
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors text-center"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;