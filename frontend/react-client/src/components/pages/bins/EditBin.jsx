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
import { useBinsContext } from '../../../contexts/BinsContext';

const filter = createFilterOptions();

const EditBin = () => {
    const { editBin, fetchBins, locations, getBinByLocationAndId } = useBinsContext();
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const navigate = useNavigate();
    const { locationId, binId } = useParams();

    useEffect(() => {
        fetchBins();
    }, [fetchBins]);

    const handleLocationChange = (event, newValue) => {
        let actualLocation = '';

        if (!newValue) {
            actualLocation = '';
        } else if (typeof newValue === 'object' && newValue.inputValue) {
            actualLocation = newValue.inputValue;
            console.log(`New Location Added: ${actualLocation}`);
            toast.success(`Location "${actualLocation}" added successfully!`);
        } else {
            actualLocation = newValue;
        }

        formik.setFieldValue('binLocation', actualLocation);
    };

    const validationSchema = Yup.object().shape({
        binLocation: Yup.string().required('Bin Location is required'),
        binType: Yup.string().required('Bin Type is required'),
    });

    const formik = useFormik({
        initialValues: {
            binLocation: '',
            binType: '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                const binData = {
                    id: binId,
                    binLocation: values.binLocation,
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
                console.error('Error updating bin:', error);
                toast.error('Error updating bin. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
    });

    useEffect(() => {
        const loadBinData = async () => {
            try {
                const binData = getBinByLocationAndId(locationId, binId);
                if (binData) {
                    formik.setValues({
                        binLocation: binData.binLocation || '',
                        binType: binData.binType || '',
                    });
                } else {
                    toast.error('No data found for this bin');
                }
            } catch (error) {
                console.error('Error fetching bin data:', error);
                toast.error('Error fetching bin data. Please try again.');
            } finally {
                setInitialLoadDone(true);
            }
        };

        loadBinData();
    }, [locationId, binId, getBinByLocationAndId]);

    const binTypes = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'E-waste'];

    if (!initialLoadDone) {
        return <CircularProgress />;
    }

    return (
        <>
            <Container maxWidth="sm">
                <Box mt={4} p={4} bgcolor="background.paper" borderRadius={2} boxShadow={3}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Edit Bin
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Bin ID"
                                    value={binId || ''}
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
                                        const isExisting = options.some((option) => option === inputValue);
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
                                        if (option.inputValue) {
                                            return option.inputValue;
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
                                            {option.title || option}
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
                                    {isLoading ? <CircularProgress size={24} /> : 'Update Bin'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Box>
            </Container>
        </>
    );
};

export default EditBin;