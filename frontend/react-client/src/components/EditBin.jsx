import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { database, ref, get, update } from '../firebase.config';
import { TextField, Button, Container, Typography, CircularProgress, MenuItem } from '@mui/material';
import Navbar from './common/Navbar';

const EditBin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const navigate = useNavigate();
    const { locationId, binId } = useParams();

    const initialValues = {
        location: '',
        geoLocation: '',
        distance: 0,
        binColor: ''
    };

    const validationSchema = Yup.object().shape({
        location: Yup.string().required('Bin Location is required'),
        geoLocation: Yup.string(),
        distance: Yup.number().required('Distance is required'),
        binColor: Yup.string().required('Bin Color is required'),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            console.log('Submitting values:', values);
            try {
                setIsLoading(true);
                const binRef = ref(database, `Trash-Bins/${locationId}/${binId}`);
                await update(binRef, values);
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
        const getData = async () => {
            try {
                const binRef = ref(database, `Trash-Bins/${locationId}/${binId}`);
                const snapshot = await get(binRef);
                if (snapshot.exists()) {
                    const binData = snapshot.val();
                    formik.setValues({
                        location: binData.location || '',
                        geoLocation: binData.geoLocation || '',
                        distance: binData.distance || 0,
                        binColor: binData.binColor || '',
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

        getData();
    }, [locationId, binId]);

    if (!initialLoadDone) {
        return <CircularProgress />;
    }

    return (
        <>
            <div>
                <Navbar title={'Edit Bin'} />
                <Typography variant="h4" align="center" margin="1rem 0">
                    Edit Bin
                </Typography>

                <Container maxWidth="sm">
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Location"
                            variant="outlined"
                            name="location"
                            value={formik.values.location}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.location && Boolean(formik.errors.location)}
                            helperText={formik.touched.location && formik.errors.location}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            label="GeoLocation"
                            variant="outlined"
                            name="geoLocation"
                            value={formik.values.geoLocation}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.geoLocation && Boolean(formik.errors.geoLocation)}
                            helperText={formik.touched.geoLocation && formik.errors.geoLocation}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Distance"
                            type="number"
                            variant="outlined"
                            name="distance"
                            value={formik.values.distance}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.distance && Boolean(formik.errors.distance)}
                            helperText={formik.touched.distance && formik.errors.distance}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
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

                        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                style={{ width: '35%' }}
                                disabled={isLoading}
                            >
                                {isLoading ? <CircularProgress size={24} /> : 'Submit'}
                            </Button>
                        </div>
                    </form>
                </Container>
            </div>
        </>
    );
};

export default EditBin;