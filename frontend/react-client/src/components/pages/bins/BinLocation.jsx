import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaCompass, FaSearchLocation } from 'react-icons/fa';
import { Typography, Button, Card, CardBody, Alert } from "@material-tailwind/react";

export const BinLocation = ({ binData }) => {
    const [isMapLoading, setIsMapLoading] = useState(true);
    const [mapError, setMapError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const hasValidCoordinates = binData?.geoLocation?.latitude && binData?.geoLocation?.longitude;

    // Generate the Google Maps URL based on coordinates
    const getGoogleMapsEmbedUrl = () => {
        if (!hasValidCoordinates) return '';
        const { latitude, longitude } = binData.geoLocation;
        return `https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d7898.414636338594!2d${longitude}!3d${latitude}!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zOMKwMTAnNTQuNyJOIDc3wrAxNCc0Ny4zIkU!5e0!3m2!1sen!2sin!4v1715710048191!5m2!1sen!2sin`;
    };

    useEffect(() => {
        // Reset error state when binData changes
        setMapError(null);
    }, [binData]);

    const handleMapLoad = () => {
        setIsMapLoading(false);
        setMapError(null);
    };

    const handleMapError = () => {
        setIsMapLoading(false);
        setMapError('Failed to load the map. Please check your internet connection.');
    };

    if (!binData) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Alert
                    variant="ghost"
                    className="bg-red-50 text-red-500"
                    icon={<FaSearchLocation className="h-6 w-6" />}
                >
                    No location data available
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Location Information Card */}
            <Card className="overflow-hidden">
                <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="rounded-full bg-blue-50 p-3">
                                <FaMapMarkerAlt className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <Typography variant="h6" color="blue-gray">
                                    {binData.binLocation || 'Location Not Specified'}
                                </Typography>
                                {hasValidCoordinates && (
                                    <Typography className="text-sm text-gray-600">
                                        {binData.geoLocation.latitude}°N, {binData.geoLocation.longitude}°E
                                    </Typography>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="outlined"
                            className="flex items-center gap-2"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            <FaCompass className="h-4 w-4" />
                            {showDetails ? 'Hide Details' : 'Show Details'}
                        </Button>
                    </div>

                    {/* Additional Details Section */}
                    {showDetails && (
                        <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Typography variant="small" className="font-medium text-gray-700">
                                    Location Type
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                    {binData.locationType || 'Not Specified'}
                                </Typography>
                            </div>
                            <div className="space-y-2">
                                <Typography variant="small" className="font-medium text-gray-700">
                                    Last Updated
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                    {binData.lastUpdated || 'Not Available'}
                                </Typography>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Map Section */}
            <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-gray-100">
                {isMapLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                    </div>
                )}

                {mapError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Alert
                            variant="ghost"
                            className="bg-red-50 text-red-500"
                        >
                            {mapError}
                        </Alert>
                    </div>
                )}

                {hasValidCoordinates ? (
                    <iframe
                        src={getGoogleMapsEmbedUrl()}
                        className="h-full w-full"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Bin Location Map"
                        onLoad={handleMapLoad}
                        onError={handleMapError}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Alert
                            variant="ghost"
                            className="bg-blue-50 text-blue-500"
                            icon={<FaMapMarkerAlt className="h-6 w-6" />}
                        >
                            Coordinates not available for this location
                        </Alert>
                    </div>
                )}
            </div>

            {/* Additional Information Footer */}
            <div className="rounded-lg bg-blue-50 p-4">
                <Typography variant="small" className="text-blue-900">
                    💡 Tip: Click on the map ( View Larger Map ) to open in Google Maps for directions and more details.
                </Typography>
            </div>
        </div>
    );
};