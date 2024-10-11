import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, CircularProgress, MenuItem, Autocomplete, Tooltip } from '@mui/material';
import { useBinsContext } from '../contexts/BinsContext';
import Navbar from './common/Navbar';

const CreateBin = () => {
    const { locations, bins, createBin } = useBinsContext();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validationSchema = Yup.object().shape({
        id: Yup.string().required('Bin ID is required'),
        binLocation: Yup.string().required('Bin Location is required'),
        binType: Yup.string().required('Bin Type is required')
    });

    const formik = useFormik({
        initialValues: {
            id: '',
            binLocation: '',
            binType: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                const binData = {
                    id: `Bin-${values.id}`,
                    binLocation: values.binLocation,
                    binType: values.binType
                };
                await createBin(binData);
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

    const handleLocationChange = (event, newValue) => {
        formik.setFieldValue('binLocation', newValue);

        if (newValue && bins[newValue]) {
            const existingBins = bins[newValue];
            const existingIds = Object.values(existingBins).map(bin => Number(bin.id.replace('Bin-', '')));
            const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
            const suggestedId = maxId + 1;
            formik.setFieldValue('id', String(suggestedId));
        } else {
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
                            <TextField
                                fullWidth
                                label="Bin ID"
                                variant="outlined"
                                name="id"
                                value={formik.values.id}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.id && Boolean(formik.errors.id)}
                                helperText={formik.touched.id && formik.errors.id}
                            />
                        </div>
                        <div className="mb-4">
                            <Autocomplete
                                options={locations}
                                freeSolo
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        label="Bin Location"
                                        variant="outlined"
                                        error={formik.touched.binLocation && Boolean(formik.errors.binLocation)}
                                        helperText={formik.touched.binLocation && formik.errors.binLocation}
                                    />
                                )}
                                value={formik.values.binLocation}
                                onChange={handleLocationChange}
                                onInputChange={(event, newInputValue) => {
                                    formik.setFieldValue('binLocation', newInputValue);
                                }}
                            />
                        </div>
                        <div className="mb-4">
                            <TextField
                                fullWidth
                                select
                                label="Bin Type"
                                variant="outlined"
                                name="binType"
                                value={formik.values.binType}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.binType && Boolean(formik.errors.binType)}
                                helperText={formik.touched.binType && formik.errors.binType}
                            >
                                {['Plastic', 'Paper', 'Glass', 'Metal'].map((type) => (
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