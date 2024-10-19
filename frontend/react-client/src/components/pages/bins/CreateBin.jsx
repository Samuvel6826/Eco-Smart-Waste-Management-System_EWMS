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
import { useBinsContext } from '../../../contexts/BinsContext';

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
            actualLocation = '';
            updatedBinCount = 0;
        } else if (typeof newValue === 'object' && newValue.inputValue) {
            actualLocation = newValue.inputValue;
            console.log(`New Location Added: ${actualLocation}`);
            toast.success(`Location "${actualLocation}" added successfully!`);
            updatedBinCount = 0;
        } else {
            actualLocation = newValue;
            const existingBinsForLocation = bins[actualLocation] || {};
            updatedBinCount = Object.keys(existingBinsForLocation).length;
        }

        const newBinId = `Bin-${updatedBinCount + 1}`;
        setGeneratedBinId(newBinId);
        setTotalBinsCount(updatedBinCount);

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
                                        const filtered = filter(options || [], params);
                                        const { inputValue } = params;

                                        const isExisting = options && options.some((option) => option === inputValue);
                                        if (inputValue !== '' && !isExisting) {
                                            filtered.push({
                                                inputValue,
                                                title: `Add "${inputValue}"`,
                                            });
                                        }
                                        return filtered;
                                    }}
                                    options={locations || []}
                                    getOptionLabel={(option) => {
                                        if (typeof option === 'string') {
                                            return option;
                                        }
                                        return option.title || '';
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
                                    freeSolo
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