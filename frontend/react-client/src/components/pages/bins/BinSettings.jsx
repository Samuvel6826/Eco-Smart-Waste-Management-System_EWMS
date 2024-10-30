import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useBinsContext } from '../../contexts/BinsContext';

// Helper function to capitalize the first letter of each word
const capitalizeWords = (str) => {
    return str ? str.replace(/\b\w/g, l => l.toUpperCase()) : '';
};

const BinSettings = () => {
    const { editBin, fetchBins, bins } = useBinsContext();
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const navigate = useNavigate();
    const { locationId, binId } = useParams();
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [locations, setLocations] = useState([]);

    const binTypes = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'E-waste'];

    useEffect(() => {
        const initializeLocations = async () => {
            try {
                await fetchBins();
                if (bins) {
                    const locationsList = Object.keys(bins);
                    const capitalizedLocs = locationsList.map(capitalizeWords);
                    setLocations(capitalizedLocs);
                    setFilteredLocations(capitalizedLocs);
                }
            } catch (error) {
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
        const suggestedBinId = `Bin-${existingBinsCount + 1}`;

        formik.setFieldValue('binLocation', actualLocation);
        formik.setFieldValue('binId', suggestedBinId);
        setShowLocationDropdown(false);
    };

    const validationSchema = Yup.object().shape({
        binId: Yup.string().required('Bin ID is required'),
        binLocation: Yup.string().required('Bin Location is required'),
        binType: Yup.string().required('Bin Type is required'),
    });

    const formik = useFormik({
        initialValues: {
            binId: binId || '',
            binLocation: locationId ? capitalizeWords(decodeURIComponent(locationId)) : '',
            binType: '',
        },
        validationSchema,
        enableReinitialize: true,
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
                await editBin(locationId, binId, binData);
                toast.success('Bin updated successfully!');
                navigate('/users/bins');
            } catch (error) {
                toast.error('Error updating bin. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
    });

    useEffect(() => {
        const loadBinData = async () => {
            try {
                if (bins && locationId && binId) {
                    const binData = bins[locationId]?.[binId];
                    if (binData) {
                        formik.setValues({
                            binId: binId || '',
                            binLocation: binData.binLocation || '',
                            binType: binData.binType || '',
                        });
                    } else {
                        toast.error('No data found for this bin');
                    }
                }
            } catch (error) {
                toast.error('Error fetching bin data. Please try again.');
            } finally {
                setInitialLoadDone(true);
            }
        };

        loadBinData();
    }, [locationId, binId, bins]);

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

    if (!initialLoadDone) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl p-4">
            <div className="mt-8 rounded-lg bg-gray-100 p-8 shadow-md">
                <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Bin Set</h1>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            id="binId"
                            name="binId"
                            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 
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
                        <input
                            type="text"
                            id="binLocation"
                            name="binLocation"
                            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 
                                ${formik.touched.binLocation && formik.errors.binLocation ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Select Bin Location"
                            value={formik.values.binLocation}
                            onChange={handleLocationFilter}
                            onClick={handleLocationInputClick}
                            autoComplete="off"
                        />
                        {showLocationDropdown && (
                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-md">
                                {filteredLocations.length > 0 ? (
                                    filteredLocations.map((location, index) => (
                                        <div
                                            key={index}
                                            className="cursor-pointer px-4 py-2 hover:bg-blue-100"
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
                    </div>

                    <div className="relative">
                        <select
                            id="binType"
                            name="binType"
                            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 
                                ${formik.touched.binType && formik.errors.binType ? 'border-red-500' : 'border-gray-300'}`}
                            value={formik.values.binType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        >
                            <option value="">Select Bin Type</option>
                            {binTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {formik.touched.binType && formik.errors.binType && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.binType}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !formik.isValid}
                        className={`w-full rounded-lg px-4 py-3 font-medium text-white transition 
                            ${isLoading || !formik.isValid ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
                            </div>
                        ) : (
                            'Update Bin'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BinSettings;