import React, { useState, useEffect } from 'react';
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
import { useBinsContext } from '../../contexts/BinsContext';

const filter = createFilterOptions();

// Helper function to capitalize the first letter of each word
const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, l => l.toUpperCase());
};

const CreateBin = () => {
    const { createBin, fetchBins, locations, bins } = useBinsContext();
    const [isLoading, setIsLoading] = useState(false);
    const [generatedBinId, setGeneratedBinId] = useState('');
    const navigate = useNavigate();
    const { locationId } = useParams();

    const [totalBinsCount, setTotalBinsCount] = useState(0);
    const [capitalizedLocations, setCapitalizedLocations] = useState([]);

    useEffect(() => {
        fetchBins();
    }, [fetchBins]);

    useEffect(() => {
        if (locations && locations.length > 0) {
            setCapitalizedLocations(locations.map(capitalizeWords));
        }
    }, [locations]);

    useEffect(() => {
        if (locationId) {
            const decodedLocationId = capitalizeWords(decodeURIComponent(locationId));
            const existingBinsForLocation = bins[decodedLocationId] || {};
            const existingBinsCount = Object.keys(existingBinsForLocation).length;
            setTotalBinsCount(existingBinsCount);
            handleLocationChange(null, decodedLocationId);
        }
    }, [locationId, bins]);

    const handleLocationChange = (event, newValue) => {
        let actualLocation = '';
        let updatedBinCount = 0;

        if (!newValue) {
            actualLocation = '';
            updatedBinCount = 0;
        } else if (typeof newValue === 'string') {
            actualLocation = capitalizeWords(newValue);
            const existingBinsForLocation = bins[actualLocation] || {};
            updatedBinCount = Object.keys(existingBinsForLocation).length;
        } else if (newValue.inputValue) {
            actualLocation = capitalizeWords(newValue.inputValue);
            console.log(`New Location: ${actualLocation}`);
            toast.success(`Location "${actualLocation}" added.`);
            updatedBinCount = 0;
        }

        const newBinId = `Bin-${updatedBinCount + 1}`;
        setGeneratedBinId(newBinId);
        setTotalBinsCount(updatedBinCount);

        formik.setFieldValue('binLocation', actualLocation);
        formik.setFieldValue('binId', newBinId);
    };

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

    const binTypes = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'E-waste'];

    return (
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
                                name="binId"
                                value={formik.values.binId}
                                onChange={formik.handleChange}
                                error={formik.touched.binId && Boolean(formik.errors.binId)}
                                helperText={formik.touched.binId && formik.errors.binId}
                            />
                        </div>
                        <div>
                            <Autocomplete
                                value={formik.values.binLocation}
                                onChange={handleLocationChange}
                                filterOptions={(options, params) => {
                                    const filtered = filter(options, params);
                                    const { inputValue } = params;
                                    const capitalizedInput = capitalizeWords(inputValue);

                                    const isExisting = options.some((option) => option === capitalizedInput);
                                    if (inputValue !== '' && !isExisting) {
                                        filtered.push({
                                            inputValue: capitalizedInput,
                                            title: `Add "${capitalizedInput}"`,
                                        });
                                    }
                                    return filtered;
                                }}
                                options={capitalizedLocations}
                                getOptionLabel={(option) => {
                                    if (typeof option === 'string') {
                                        return capitalizeWords(option);
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
                                        {typeof option === 'string' ? capitalizeWords(option) : option.title}
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
    );
};

export default CreateBin;