import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { database, ref, set } from '../firebase.config';
import { TextField, Button, Container, Typography, CircularProgress, MenuItem, Autocomplete, Tooltip } from '@mui/material';
import { useBinContext } from '../contexts/BinContext';
import Navbar from './common/Navbar';

const CreateBin = () => {
    const { locations, bins } = useBinContext();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Form validation schema
    const validationSchema = Yup.object().shape({
        id: Yup.number().positive('ID must be positive').integer('ID must be an integer').required('ID is required'),
        location: Yup.string().required('Bin Location is required'),
        binColor: Yup.string().required('Bin Color is required'),
        geoLocation: Yup.string().required('GeoLocation is required'),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            id: '', // Start with an empty string to avoid NaN
            location: '',
            binColor: '',
            geoLocation: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                // Reference path for the new bin
                const binRef = ref(database, `Trash-Bins/${values.location}/Bin-${values.id}`);
                await set(binRef, values);

                toast.success('Bin created successfully!');
                navigate('/users/bins');
            } catch (error) {
                console.error('Error creating bin:', error);
                toast.error('Error creating bin. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
    });

    // Handle location change in Autocomplete
    const handleLocationChange = (event, newValue) => {
        formik.setFieldValue('location', newValue);

        if (newValue && bins[newValue]) {
            const existingBins = bins[newValue];
            const existingIds = Object.values(existingBins).map(bin => Number(bin.id)); // Ensure IDs are treated as numbers
            const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0; // Find the maximum ID
            const suggestedId = maxId + 1; // Suggest next ID

            // Set suggestedId as a string to prevent NaN
            formik.setFieldValue('id', String(suggestedId)); // Ensure it's a string
        } else {
            // No existing bins, set default ID to '1'
            formik.setFieldValue('id', '1');
        }
    };

    return (
        <>
            <Navbar title={'Create Bin'} />
            <Container className="mx-auto max-w-md p-4">
                <div className="mt-4 rounded-lg bg-white p-4 shadow-lg">
                    <Typography variant="h4" align="center" gutterBottom>
                        Create New Bin
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-4">
                            <Autocomplete
                                options={locations}
                                freeSolo
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        label="Location"
                                        variant="outlined"
                                        error={formik.touched.location && Boolean(formik.errors.location)}
                                        helperText={formik.touched.location && formik.errors.location}
                                    />
                                )}
                                value={formik.values.location}
                                onChange={handleLocationChange}
                                onInputChange={(event, newInputValue) => {
                                    formik.setFieldValue('location', newInputValue);
                                }}
                            />
                        </div>
                        <div className="mb-4">
                            <Tooltip title="Enter a unique Bin ID" arrow>
                                <TextField
                                    fullWidth
                                    label="Bin ID"
                                    variant="outlined"
                                    name="id"
                                    type="number"
                                    value={formik.values.id}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Validate numeric input and set the ID correctly
                                        if (value === '' || /^[0-9\b]+$/.test(value)) {
                                            formik.setFieldValue('id', value);
                                        }
                                    }}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.id && Boolean(formik.errors.id)}
                                    helperText={formik.touched.id && formik.errors.id}
                                />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Tooltip title="Provide the geographical location" arrow>
                                <TextField
                                    fullWidth
                                    label="GeoLocation"
                                    variant="outlined"
                                    name="geoLocation"
                                    value={formik.values.geoLocation}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.geoLocation && Boolean(formik.errors.geoLocation)}
                                    helperText={formik.touched.geoLocation && formik.errors.geoLocation}
                                />
                            </Tooltip>
                        </div>
                        <div className="mb-4">
                            <Tooltip title="Select the color of the bin" arrow>
                                <TextField
                                    fullWidth
                                    select
                                    label="Bin Color"
                                    variant="outlined"
                                    name="binColor"
                                    value={formik.values.binColor}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.binColor && Boolean(formik.errors.binColor)}
                                    helperText={formik.touched.binColor && formik.errors.binColor}
                                >
                                    {['Green', 'Blue', 'Yellow', 'Red'].map((color) => (
                                        <MenuItem key={color} value={color}>
                                            {color}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Tooltip>
                        </div>
                        <div>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                fullWidth
                                disabled={isLoading || !formik.isValid}
                                className="py-2"
                            >
                                {isLoading ? <CircularProgress size={24} /> : 'Create Bin'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Container>
        </>
    );
};

export default CreateBin;