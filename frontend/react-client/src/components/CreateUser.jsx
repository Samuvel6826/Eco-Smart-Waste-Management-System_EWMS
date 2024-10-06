import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Navbar from './common/Navbar';
import { Button, TextField, Container, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserContext } from '../contexts/UserContext'; // Import UserContext

// Validation schema using Yup
const validationSchema = Yup.object().shape({
    employeeId: Yup.string().required('Employee ID is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
    profilePic: Yup.string().url('Must be a valid URL'),
});

// Role options available for selection
const roleOptions = ['Admin', 'Manager', 'Supervisor'];

function CreateUser() {
    const navigate = useNavigate();
    const [employeeId, setEmployeeId] = useState('');
    const { users, fetchUsers, loading, error } = useUserContext(); // Use UserContext values

    useEffect(() => {
        if (!users.length) {
            fetchUsers();
        }
    }, [users, fetchUsers]);

    useEffect(() => {
        const fetchLatestEmployeeId = () => {
            // console.log('Existing users:', users); // Log existing users for debugging

            // Check if users exist and contain data
            if (users && users.length > 0) {
                // Extract and find the maximum employee ID from the user data
                const maxEmployeeId = users
                    .map(user => {
                        const id = user.employeeId.replace('EMP', ''); // Remove 'EMP' prefix
                        return /^\d+$/.test(id) ? parseInt(id, 10) : null; // Convert to integer if valid
                    })
                    .filter(id => id !== null) // Filter out any null values
                    .sort((a, b) => b - a)[0]; // Sort in descending order to get the highest value

                // console.log('Max Employee ID:', maxEmployeeId); // Log the max employee ID found

                // Increment and pad with leading zeros for the new employee ID
                const newEmployeeNumber = maxEmployeeId !== undefined ? String(maxEmployeeId + 1).padStart(3, '0') : '001';
                setEmployeeId(`EMP-${newEmployeeNumber}`);
            } else {
                // Default ID when no users exist
                setEmployeeId('EMP-001');
                console.log('No existing users found, defaulting to EMP-001');
            }
        };

        fetchLatestEmployeeId();
    }, [users]); // Runs when the 'users' state changes

    // Formik hook for managing form state and submission
    const formik = useFormik({
        initialValues: {
            employeeId: employeeId,
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            profilePic: '',
        },
        validationSchema: validationSchema,
        enableReinitialize: true, // Allow Formik to update initial values when employeeId is set
        onSubmit: async (values, { setSubmitting }) => {
            try {
                setSubmitting(true);
                const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}`, values);
                if (res.status === 200) {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error in onSubmit:', error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Show loader until employeeId is generated
    if (!employeeId) {
        return (
            <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <div>
            <Navbar title={'Create User'} />
            <Typography variant="h4" align="center" margin="1rem 0">
                Create User
            </Typography>
            <Container maxWidth="sm" style={{ backgroundColor: '#f5f5f5', padding: '2rem', borderRadius: '8px' }}>
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Employee ID"
                        variant="outlined"
                        name="employeeId"
                        value={formik.values.employeeId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                        helperText={formik.touched.employeeId && formik.errors.employeeId}
                        InputProps={{
                            readOnly: true, // Make this field read-only
                        }}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="First Name"
                        variant="outlined"
                        name="firstName"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                        helperText={formik.touched.firstName && formik.errors.firstName}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Last Name"
                        variant="outlined"
                        name="lastName"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                        helperText={formik.touched.lastName && formik.errors.lastName}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email ID"
                        variant="outlined"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />

                    <FormControl fullWidth margin="normal" variant="outlined" error={formik.touched.role && Boolean(formik.errors.role)}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role"
                            value={formik.values.role}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            label="Role"
                        >
                            {roleOptions.map((role) => (
                                <MenuItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                        {formik.touched.role && formik.errors.role && (
                            <div className="error" style={{ color: 'red', marginTop: '0.5rem' }}>
                                {formik.errors.role}
                            </div>
                        )}
                    </FormControl>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Profile Picture URL"
                        variant="outlined"
                        name="profilePic"
                        value={formik.values.profilePic}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.profilePic && Boolean(formik.errors.profilePic)}
                        helperText={formik.touched.profilePic && formik.errors.profilePic}
                    />

                    <div className="text-center">
                        <Button variant="contained" color="primary" type="submit" style={{ width: '35%', marginTop: '1rem' }}>
                            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
                        </Button>
                    </div>
                </form>
            </Container>
        </div>
    );
}

export default CreateUser;