import React, { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaCompass, FaSearchLocation, FaBatteryThreeQuarters, FaTrash, FaLock } from 'react-icons/fa';
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
        detailed: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',  // CyclOSM for detailed outdoor maps
        hikeBike: 'https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',  // Hike & Bike Map
        openStreetMap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',  // OpenStreetMap
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',  // Esri Satellite
        googleRoad: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',  // Google Road Map
        googleSatellite: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',  // Google Satellite
        googleHybrid: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',    // Google Hybrid
        stadiaSatellite: 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg'  // Stadia Satellite
    };

    const tileAttributions = {
        detailed: '© CyclOSM & OpenStreetMap contributors',
        openStreetMap: '© OpenStreetMap contributors',
        satellite: 'Tiles © Esri',
        googleRoad: '© Google Maps',
        googleSatellite: '© Google Maps',
        googleHybrid: '© Google Maps',
    };

    const layerNames = {
        detailed: 'CyclOSM',
        openStreetMap: 'OpenStreetMap',
        satellite: 'Esri Satellite',
        googleRoad: 'Google Roads',
        googleSatellite: 'Google Satellite',
        googleHybrid: 'Google Hybrid',
    };

    const maxZoomLevels = {
        detailed: 20,
        openStreetMap: 20,
        satellite: 18,
        googleRoad: 20,
        googleSatellite: 20,
        googleHybrid: 20,
    };

    const layerGroups = {
        'OpenStreetMap': ['openStreetMap', 'detailed'],
        'Satellite': ['satellite'],
        'Google Maps': ['googleRoad', 'googleSatellite', 'googleHybrid']
    };

    // Helper functions for styling
    const getBatteryColor = (level) => {
        if (level >= 70) return 'text-green-500';
        if (level >= 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getFillLevelColor = (percentage) => {
        if (percentage >= 80) return 'text-red-500';
        if (percentage >= 50) return 'text-yellow-500';
        return 'text-green-500';
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

    // Create custom popup HTML with the bin details
    const createPopupContent = (lat, lng) => {
        return `
            <div class="min-w-[200px] space-y-2 text-sm">
                <div class="border-b pb-2 font-bold text-gray-900">
                    ${binData.binLocation || 'Location Not Specified'}
                </div>
                
                <div class="space-y-1">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-600">Battery</span>
                        <span class="${getBatteryColor(binData.batteryLevel)}">
                            ${binData.batteryLevel || 0}%
                        </span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-gray-600">Fill Level</span>
                        <span class="${getFillLevelColor(binData.filledBinPercentage)}">
                            ${binData.filledBinPercentage || 0}%
                        </span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-gray-600">Lid Status</span>
                        <span class="${binData.binLidStatus === 'Closed' ? 'text-green-500' : 'text-yellow-500'}">
                            ${binData.binLidStatus || 'Unknown'}
                        </span>
                    </div>
                </div>

                <div class="border-t pt-2 text-xs text-gray-500">
                    ${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E
                </div>
            </div>
        `;
    };

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
            timeout: 5000
        });

        layer.on('loading', () => {
            setMapError(null);
            hasLoadedTiles = false;

            clearTimeout(tileLoadingTimeout);
            tileLoadingTimeout = setTimeout(() => {
                if (!hasLoadedTiles && style.startsWith('google')) {
                    setMapError('Some map tiles may not be visible. You can continue using the map or try a different layer.');
                }
            }, 7000);
        });

        layer.on('tileload', () => {
            hasLoadedTiles = true;
            clearTimeout(tileLoadingTimeout);
            setMapError(null);
        });

        layer.on('tileerror', (error) => {
            console.warn('Tile loading issue:', error);
            if (style.startsWith('google')) {
                setMapError('Some Google Maps tiles may not be visible. You can continue using the map or try a different layer.');
            } else {
                setMapError('Some map tiles failed to load. You can continue using the map or try a different layer.');
            }
        });

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

                const layer = createTileLayer(mapStyle);
                layer.addTo(mapInstance.current);

                const marker = L.marker([lat, lng], {
                    riseOnHover: true
                }).addTo(mapInstance.current);

                const popupContent = createPopupContent(lat, lng);
                marker.bindPopup(popupContent, {
                    maxWidth: 300,
                    className: 'custom-popup'
                }).openPopup();

                L.control.zoom({
                    position: 'bottomright'
                }).addTo(mapInstance.current);

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
                    <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FaBatteryThreeQuarters className="h-4 w-4 text-gray-500" />
                                <p className="text-sm font-medium text-gray-700">Battery Level</p>
                            </div>
                            <p className={`text-sm ${getBatteryColor(binData.batteryLevel)}`}>
                                {binData.batteryLevel || 0}%
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FaTrash className="h-4 w-4 text-gray-500" />
                                <p className="text-sm font-medium text-gray-700">Fill Level</p>
                            </div>
                            <p className={`text-sm ${getFillLevelColor(binData.filledBinPercentage)}`}>
                                {binData.filledBinPercentage || 0}%
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FaLock className="h-4 w-4 text-gray-500" />
                                <p className="text-sm font-medium text-gray-700">Lid Status</p>
                            </div>
                            <p className={`text-sm ${binData.binLidStatus === 'Closed' ? 'text-green-500' : 'text-yellow-500'}`}>
                                {binData.binLidStatus || 'Unknown'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Layer Switcher */}
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

            {/* Map Container (continued) */}
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