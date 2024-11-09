import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useBinsHook } from '../../contexts/providers/hooks/useBinsHook';

// Helper function to capitalize the first letter of each word
const capitalizeWords = (str) => {
    return str ? str.replace(/\b\w/g, l => l.toUpperCase()) : '';
};

const CreateBin = () => {
    const { createBin, fetchBins, bins } = useBinsHook();
    const [isLoading, setIsLoading] = useState(false);
    const [generatedBinId, setGeneratedBinId] = useState('');
    const navigate = useNavigate();
    const { locationId } = useParams();
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [totalBinsCount, setTotalBinsCount] = useState(0);
    const [locations, setLocations] = useState([]);

    const binTypes = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'E-waste'];

    // Initialize locations from bins object
    useEffect(() => {
        const initializeLocations = async () => {
            try {
                await fetchBins();
                if (bins) {
                    const locationsList = Object.keys(bins);
                    const capitalizedLocs = locationsList.map(capitalizeWords);
                    setLocations(capitalizedLocs);
                    setFilteredLocations(capitalizedLocs);
                    console.log('Initialized locations:', capitalizedLocs);
                }
            } catch (error) {
                console.error('Error fetching bins:', error);
                toast.error('Error loading locations. Please try again.');
            }
        };
        initializeLocations();
    }, [fetchBins, bins]);

    const handleLocationChange = (selectedLocation) => {
        if (!selectedLocation) return;

        const actualLocation = capitalizeWords(selectedLocation);
        const existingBinsForLocation = bins[actualLocation] || {};
        const existingBinsCount = Object.keys(existingBinsForLocation).length;

        const newBinId = `Bin-${existingBinsCount + 1}`;
        setGeneratedBinId(newBinId);
        setTotalBinsCount(existingBinsCount);

        formik.setFieldValue('binLocation', actualLocation);
        formik.setFieldValue('binId', newBinId);
        setShowLocationDropdown(false);
    };

    useEffect(() => {
        if (locationId && bins) {
            const decodedLocationId = capitalizeWords(decodeURIComponent(locationId));
            const existingBinsForLocation = bins[decodedLocationId] || {};
            const existingBinsCount = Object.keys(existingBinsForLocation).length;
            setTotalBinsCount(existingBinsCount);
            handleLocationChange(decodedLocationId);
        }
    }, [locationId, bins]);

    const validationSchema = Yup.object().shape({
        binId: Yup.string().required('Bin ID is required'),
        binLocation: Yup.string().required('Bin Location is required'),
        binType: Yup.string().required('Bin Type is required'),
    });

    const formik = useFormik({
        initialValues: {
            binId: '',
            binLocation: locationId ? capitalizeWords(decodeURIComponent(locationId)) : '',
            binType: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                const binData = {
                    id: values.binId,
                    binLocation: capitalizeWords(values.binLocation),
                    binType: values.binType,
                    geoLocation: {
                        latitude: "latitude",
                        longitude: "longitude",
                    },
                };
                await createBin(binData);
                toast.success('Bin created successfully!');
                setTotalBinsCount(totalBinsCount + 1);
                navigate('/users/bins');
            } catch (error) {
                console.error('Error creating bin:', error);
                toast.error(error.response?.data?.message || 'Error creating bin. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
    });

    const handleLocationInputClick = () => {
        setShowLocationDropdown(!showLocationDropdown);
        setFilteredLocations(locations);
    };

    const handleLocationFilter = (e) => {
        const value = e.target.value;
        formik.setFieldValue('binLocation', value);

        if (value.trim()) {
            const filtered = locations.filter(location =>
                location.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredLocations(filtered);
        } else {
            setFilteredLocations(locations);
        }
        setShowLocationDropdown(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.location-dropdown-container')) {
                setShowLocationDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className="container mx-auto max-w-2xl">
            <div className="mt-8 rounded-lg bg-white p-6 shadow-lg">
                <h1 className="mb-6 text-center text-3xl font-bold">Create New Bin</h1>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            id="binId"
                            name="binId"
                            className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 
                                ${formik.touched.binId && formik.errors.binId ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Bin ID"
                            value={formik.values.binId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.binId && formik.errors.binId && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.binId}</p>
                        )}
                    </div>

                    <div className="location-dropdown-container relative">
                        <div className="relative">
                            <input
                                type="text"
                                id="binLocation"
                                name="binLocation"
                                className={`w-full rounded-lg border px-4 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500
                                    ${formik.touched.binLocation && formik.errors.binLocation ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Select Bin Location"
                                value={formik.values.binLocation}
                                onChange={handleLocationFilter}
                                onClick={handleLocationInputClick}
                                autoComplete="off"
                            />
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {showLocationDropdown && (
                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                                {filteredLocations && filteredLocations.length > 0 ? (
                                    filteredLocations.map((location, index) => (
                                        <div
                                            key={index}
                                            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                                            onClick={() => handleLocationChange(location)}
                                        >
                                            {location}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-gray-500">No locations found</div>
                                )}
                            </div>
                        )}

                        {formik.touched.binLocation && formik.errors.binLocation && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.binLocation}</p>
                        )}
                    </div>

                    <div className="relative">
                        <select
                            id="binType"
                            name="binType"
                            className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500
                                ${formik.touched.binType && formik.errors.binType ? 'border-red-500' : 'border-gray-300'}`}
                            value={formik.values.binType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        >
                            <option value="">Select Bin Type</option>
                            {binTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        {formik.touched.binType && formik.errors.binType && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.binType}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !formik.isValid}
                        className={`w-full rounded-lg px-4 py-3 font-medium text-white
                            ${isLoading || !formik.isValid
                                ? 'cursor-not-allowed bg-blue-300'
                                : 'bg-blue-600 transition-colors hover:bg-blue-700'}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
                            </div>
                        ) : (
                            'Create Bin'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateBin;