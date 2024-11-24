import React, { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaCompass, FaSearchLocation } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const BinLocation = ({ binData }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [mapStyle, setMapStyle] = useState("detailed");
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [mapError, setMapError] = useState(null);

    // Updated tile layers with all map options
    const tileLayers = {
        detailed: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        googleRoad: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',  // Google Road Map
        googleSatellite: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',  // Google Satellite
        googleHybrid: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',    // Google Hybrid (Satellite + Labels)
        stadiaSatellite: 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg'  // Stadia Satellite
    };

    const tileAttributions = {
        detailed: '© CyclOSM & OpenStreetMap contributors',
        satellite: 'Tiles © Esri',
        googleRoad: '© Google Maps',
        googleSatellite: '© Google Maps',
        googleHybrid: '© Google Maps',
        stadiaSatellite: '© CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | © <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> © <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    };

    const layerNames = {
        detailed: 'OSM Detailed',
        satellite: 'Esri Satellite',
        googleRoad: 'Google Roads',
        googleSatellite: 'Google Satellite',
        googleHybrid: 'Google Hybrid',
        stadiaSatellite: 'Stadia Satellite'
    };

    const maxZoomLevels = {
        detailed: 20,
        satellite: 18,
        googleRoad: 20,
        googleSatellite: 20,
        googleHybrid: 20,
        stadiaSatellite: 20
    };

    // Update the layer groups to include Stadia Satellite
    const layerGroups = {
        'OpenStreetMap': ['detailed'],
        'Google Maps': ['googleRoad', 'googleSatellite', 'googleHybrid'],
        'Satellite': ['satellite', 'stadiaSatellite']  // Added Stadia Satellite here
    };

    // DMS to Decimal conversion helper function
    const dmsToDecimal = (dmsString) => {
        const regex = /(\d+)[°]?\s*(\d+)?[']?\s*(\d+)?[.]?\s*(\d+)?["]?\s*([NSEW])?/i;
        const match = dmsString.match(regex);
        if (!match) return null;
        const degrees = parseFloat(match[1]);
        const minutes = parseFloat(match[2] || 0) / 60;
        const seconds = parseFloat(match[3] || 0) / 3600;
        const direction = match[5]?.toUpperCase();
        let decimal = degrees + minutes + seconds;
        if (direction === 'S' || direction === 'W') {
            decimal = -decimal;
        }
        return decimal;
    };

    const parseCoordinates = () => {
        const latitude = binData?.geoLocation?.latitude;
        const longitude = binData?.geoLocation?.longitude;

        if (!latitude || !longitude) return null;

        const lat = isNaN(latitude) ? dmsToDecimal(latitude) : parseFloat(latitude);
        const lng = isNaN(longitude) ? dmsToDecimal(longitude) : parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            setMapError("Invalid coordinates provided.");
            return null;
        }

        return { lat, lng };
    };

    const coordinates = parseCoordinates();

    const createTileLayer = (style) => {
        let tileLoadingTimeout;
        let hasLoadedTiles = false;

        const layer = L.tileLayer(tileLayers[style], {
            maxZoom: maxZoomLevels[style],
            attribution: tileAttributions[style],
            keepBuffer: 8,
            updateWhenZooming: false,
            updateWhenIdle: true,
            subdomains: style.startsWith('google') ? ['mt0', 'mt1', 'mt2', 'mt3'] : ['a', 'b', 'c'],
            // Add timeout to prevent infinite loading
            timeout: 5000 // 5 seconds timeout for tile loading
        });

        // Clear previous error when starting to load new tiles
        layer.on('loading', () => {
            setMapError(null);
            hasLoadedTiles = false;

            // Set a timeout to check if tiles have loaded
            clearTimeout(tileLoadingTimeout);
            tileLoadingTimeout = setTimeout(() => {
                if (!hasLoadedTiles && style.startsWith('google')) {
                    setMapError('Some map tiles may not be visible. You can continue using the map or try a different layer.');
                }
            }, 7000); // Check after 7 seconds
        });

        // Track successful tile loads
        layer.on('tileload', () => {
            hasLoadedTiles = true;
            clearTimeout(tileLoadingTimeout);
            setMapError(null);
        });

        // Handle tile errors more gracefully
        layer.on('tileerror', (error) => {
            console.warn('Tile loading issue:', error);
            if (style.startsWith('google')) {
                setMapError('Some Google Maps tiles may not be visible. You can continue using the map or try a different layer.');
            } else {
                setMapError('Some map tiles failed to load. You can continue using the map or try a different layer.');
            }
        });

        // Cleanup on layer removal
        layer.on('remove', () => {
            clearTimeout(tileLoadingTimeout);
        });

        return layer;
    };

    useEffect(() => {
        if (coordinates) {
            const { lat, lng } = coordinates;

            if (!mapInstance.current) {
                mapInstance.current = L.map(mapRef.current, {
                    maxZoom: maxZoomLevels[mapStyle],
                    preferCanvas: true,
                    zoomControl: false
                }).setView([lat, lng], 19);

                // Add base tile layer with error handling
                const layer = createTileLayer(mapStyle);
                layer.addTo(mapInstance.current);

                // Add marker with custom popup
                const marker = L.marker([lat, lng], {
                    riseOnHover: true
                }).addTo(mapInstance.current);

                const popupContent = `
                    <div class="text-center">
                        <strong class="mb-1 block">${binData.binLocation || 'Location Not Specified'}</strong>
                        <span class="text-sm text-gray-600">${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E</span>
                    </div>
                `;
                marker.bindPopup(popupContent).openPopup();

                // Add zoom control
                L.control.zoom({
                    position: 'bottomright'
                }).addTo(mapInstance.current);

                // Add scale control
                L.control.scale({
                    metric: true,
                    imperial: false,
                    position: 'bottomleft'
                }).addTo(mapInstance.current);
            } else {
                mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
            }
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [coordinates]);

    useEffect(() => {
        if (mapInstance.current) {
            mapInstance.current.eachLayer((layer) => {
                if (layer instanceof L.TileLayer) {
                    mapInstance.current.removeLayer(layer);
                }
            });

            // Create new tile layer with error handling
            const layer = createTileLayer(mapStyle);
            layer.addTo(mapInstance.current);
        }
    }, [mapStyle]);

    return (
        <div className="space-y-4">
            {/* Location header card */}
            <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-blue-50 p-3">
                            <FaMapMarkerAlt className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h6 className="text-lg font-semibold text-gray-900">
                                {binData.binLocation || 'Location Not Specified'}
                            </h6>
                            {coordinates && (
                                <p className="text-sm text-gray-600">
                                    {coordinates.lat.toFixed(6)}°N, {coordinates.lng.toFixed(6)}°E
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        <FaCompass className="h-4 w-4" />
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>

                {showDetails && (
                    <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Location Type</p>
                            <p className="text-sm text-gray-600">
                                {binData.locationType || 'Not Specified'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Last Updated</p>
                            <p className="text-sm text-gray-600">
                                {binData.lastUpdated || 'Not Available'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Layer Switcher with grouped options */}
            <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="space-y-3">
                    <span className="text-sm font-medium text-gray-700">Map Style:</span>
                    <div className="grid gap-4">
                        {Object.entries(layerGroups).map(([groupName, layers]) => (
                            <div key={groupName} className="space-y-2">
                                <div className="text-xs font-medium text-gray-500">{groupName}</div>
                                <div className="flex flex-wrap gap-2">
                                    {layers.map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setMapStyle(key)}
                                            className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap
                                                ${mapStyle === key
                                                    ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {layerNames[key]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-gray-100">
                {mapError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-lg bg-red-50 p-4 text-red-500">
                            {mapError}
                        </div>
                    </div>
                )}

                {coordinates ? (
                    <div ref={mapRef} className="h-full w-full" />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-4 text-blue-500">
                            <FaSearchLocation className="h-6 w-6" />
                            <span>Coordinates not available for this location</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                    💡 Tip: Try different Google Maps views - Road for navigation, Satellite for aerial imagery, or Hybrid for labeled satellite view.
                </p>
            </div>
        </div>
    );
};

export default BinLocation;