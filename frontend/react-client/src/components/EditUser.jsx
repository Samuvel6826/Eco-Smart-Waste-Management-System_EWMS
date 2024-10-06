import React, { useEffect, useState, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';
import { useUserContext } from '../contexts/UserContext';
import axios from 'axios';
import Navbar from './common/Navbar';

// Validation schema
const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    phoneNumber: Yup.string().matches(/^\d{10}$/, 'Phone number must be 10 digits'),
    role: Yup.string().required('Role is required'),
    assignedBinLocations: Yup.array().of(Yup.string()).min(1, 'At least one bin location is required'),
    profilePic: Yup.string().url('Must be a valid URL').required('Profile picture URL is required'),
});

function EditUser() {
    const { logout, user } = useUserAuth();
    const { fetchUsers } = useUserContext();
    const navigate = useNavigate();
    const { id } = useParams();

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user data
    const fetchUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_SERVER_HOST_URL}/${id}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            });
            const userData = response.data.data;
            formik.setValues({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber || '',
                role: userData.role,
                assignedBinLocations: userData.assignedBinLocations || [],
                profilePic: userData.profilePic || '',
                employeeId: userData.employeeId || id,
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch user data. Please try again.',
                severity: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            role: '',
            assignedBinLocations: [],
            profilePic: '',
            employeeId: id,
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                const response = await axios.put(
                    `${import.meta.env.VITE_SERVER_HOST_URL}/${id}`,
                    values,
                    {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.status === 200) {
                    setSnackbar({
                        open: true,
                        message: 'User updated successfully!',
                        severity: 'success',
                    });
                    fetchUsers();
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error updating user:', error);
                setSnackbar({
                    open: true,
                    message: 'Error updating user. Please try again.',
                    severity: 'error',
                });
            } finally {
                setIsLoading(false);
            }
        },
    });

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Box className="min-h-screen bg-gray-100">
            <Navbar />
            <Box className="container mx-auto py-10">
                <Box className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg">
                    <Typography variant="h4" className="mb-4 text-center font-bold text-gray-800">
                        Edit User Information
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            id="employeeId"
                            name="employeeId"
                            label="Employee ID"
                            value={formik.values.employeeId}
                            margin="normal"
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            fullWidth
                            id="firstName"
                            name="firstName"
                            label="First Name"
                            value={formik.values.firstName}
                            onChange={formik.handleChange}
                            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                            helperText={formik.touched.firstName && formik.errors.firstName}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            id="lastName"
                            name="lastName"
                            label="Last Name"
                            value={formik.values.lastName}
                            onChange={formik.handleChange}
                            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                            helperText={formik.touched.lastName && formik.errors.lastName}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            id="phoneNumber"
                            name="phoneNumber"
                            label="Phone Number"
                            value={formik.values.phoneNumber}
                            onChange={formik.handleChange}
                            error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                            helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select
                                labelId="role-label"
                                id="role"
                                name="role"
                                value={formik.values.role}
                                onChange={formik.handleChange}
                                error={formik.touched.role && Boolean(formik.errors.role)}
                            >
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Manager">Manager</MenuItem>
                                <MenuItem value="Supervisor">Supervisor</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            id="assignedBinLocations"
                            name="assignedBinLocations"
                            label="Assigned Bin Locations"
                            value={formik.values.assignedBinLocations.join(', ')}
                            margin="normal"
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <Box className="mb-6">
                            <Typography variant="subtitle1" className="mb-1 font-medium text-gray-700">
                                Profile Picture
                            </Typography>
                            {formik.values.profilePic && (
                                <Box mt={2} mb={2}>
                                    <img
                                        src={formik.values.profilePic}
                                        alt="Profile Preview"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                </Box>
                            )}
                            <TextField
                                fullWidth
                                id="profilePic"
                                name="profilePic"
                                label="Profile Picture URL"
                                value={formik.values.profilePic}
                                onChange={formik.handleChange}
                                error={formik.touched.profilePic && Boolean(formik.errors.profilePic)}
                                helperText={formik.touched.profilePic && formik.errors.profilePic}
                                margin="normal"
                            />
                        </Box>
                        <Box className="mt-6 flex justify-center">
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={formik.isSubmitting || isLoading}
                                className="mr-4"
                            >
                                {formik.isSubmitting || isLoading ? <CircularProgress size={24} /> : 'Update User'}
                            </Button>
                            <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default EditUser;