import React, { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import {
    TextField,
    Button,
    Container,
    Typography,
    CircularProgress,
    MenuItem,
    Box,
    Autocomplete,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { useBinsContext } from '../contexts/BinsContext';
import Navbar from './common/Navbar';

const filter = createFilterOptions();

const CreateBin = () => {
    const { createBin, fetchBins, locations, bins } = useBinsContext();
    const [isLoading, setIsLoading] = useState(false);
    const [generatedBinId, setGeneratedBinId] = useState('');
    const navigate = useNavigate();
    const { locationId } = useParams();

    const [totalBinsCount, setTotalBinsCount] = useState(0);

    useEffect(() => {
        fetchBins(); // Fetch bins from context
    }, [fetchBins]);

    useEffect(() => {
        if (locationId) {
            const decodedLocationId = decodeURIComponent(locationId);
            const existingBinsForLocation = bins[decodedLocationId] || {};
            const existingBinsCount = Object.keys(existingBinsForLocation).length;
            setTotalBinsCount(existingBinsCount);
            handleLocationChange(null, decodedLocationId);
        }
    }, [locationId, bins]);

    const handleLocationChange = (event, newValue) => {
        let actualLocation = '';
        let updatedBinCount = 0;

        // Check if newValue is null or empty
        if (!newValue) {
            // If it's null, we can set the actualLocation to an empty string
            actualLocation = '';
            updatedBinCount = 0; // Reset bin count if no location is selected
        } else if (typeof newValue === 'object' && newValue.inputValue) {
            // Handle new custom location input
            actualLocation = newValue.inputValue; // Set to the actual input value
            console.log(`New Location Added: ${actualLocation}`); // Log the new location
            toast.success(`Location "${actualLocation}" added successfully!`);
            updatedBinCount = 0; // Reset bin count for new location
        } else {
            // Handle existing locations
            actualLocation = newValue; // For existing options, set actualLocation to the selected option
            const existingBinsForLocation = bins[actualLocation] || {};
            updatedBinCount = Object.keys(existingBinsForLocation).length; // Count existing bins for the selected location
        }

        // Update the bin count and bin ID based on the new/selected location
        const newBinId = `Bin-${updatedBinCount + 1}`; // Generate new bin ID based on the updated count
        setGeneratedBinId(newBinId);
        setTotalBinsCount(updatedBinCount); // Update the state after generating the new ID

        // Set the actual value in the formik field
        formik.setFieldValue('binLocation', actualLocation);
    };

    const validationSchema = Yup.object().shape({
        binLocation: Yup.string().required('Bin Location is required'),
        binType: Yup.string().required('Bin Type is required'),
    });

    const formik = useFormik({
        initialValues: {
            binLocation: locationId ? decodeURIComponent(locationId) : '',
            binType: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                const binData = {
                    id: generatedBinId,
                    binLocation: values.binLocation,
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
                toast.error('Error creating bin. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
    });

    const binTypes = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'E-waste'];

    return (
        <>
            <Navbar title="Create Bin" />
            <Container maxWidth="sm">
                <Box mt={4} p={4} bgcolor="background.paper" borderRadius={2} boxShadow={3}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Create New Bin
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Bin ID"
                                    value={generatedBinId || ''}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            </div>
                            <div>
                                <Autocomplete
                                    value={formik.values.binLocation}
                                    onChange={handleLocationChange}
                                    filterOptions={(options, params) => {
                                        const filtered = filter(options, params);
                                        const { inputValue } = params;

                                        // Suggest the "Add {inputValue}" option only if it doesn't exist already
                                        const isExisting = options.some((option) => option === inputValue);
                                        if (inputValue !== '' && !isExisting) {
                                            filtered.push({
                                                inputValue,
                                                title: `Add "${inputValue}"`, // This is the custom option shown in the dropdown
                                            });
                                        }
                                        return filtered;
                                    }}
                                    options={locations}
                                    getOptionLabel={(option) => {
                                        // Handle custom option and normal options
                                        if (typeof option === 'string') {
                                            return option;
                                        }
                                        return option.title;
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Bin Location"
                                            error={formik.touched.binLocation && Boolean(formik.errors.binLocation)}
                                            helperText={formik.touched.binLocation && formik.errors.binLocation}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.inputValue || option}>
                                            {typeof option === 'string' ? option : option.title}
                                        </li>
                                    )}
                                    freeSolo // Allows custom input
                                />
                            </div>
                            <div>
                                <TextField
                                    fullWidth
                                    select
                                    label="Bin Type"
                                    name="binType"
                                    value={formik.values.binType}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.binType && Boolean(formik.errors.binType)}
                                    helperText={formik.touched.binType && formik.errors.binType}
                                >
                                    {binTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                            <div>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    fullWidth
                                    disabled={isLoading || !formik.isValid}
                                    sx={{ mt: 2, py: 1.5 }}
                                >
                                    {isLoading ? <CircularProgress size={24} /> : 'Create Bin'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Box>
            </Container>
        </>
    );
};

export default CreateBin;