import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Navbar from './common/Navbar';
import {
    Button,
    TextField,
    Container,
    Typography,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsersContext } from '../contexts/UsersContext';
import { toast } from 'react-hot-toast';

// Validation schema for form fields
const validationSchema = Yup.object().shape({
    employeeId: Yup.string().required('Employee ID is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
    phoneNumber: Yup.string(),
    profilePic: Yup.string().url('Must be a valid URL'),
    userDesc: Yup.string(),
});

// Available role options for user selection
const roleOptions = ['Admin', 'Manager', 'Supervisor', 'Technician'];

function EditUser() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get user ID from URL parameters
    const { users, loading, error, editUser } = useUsersContext(); // Extract context values

    // Initial values for the form
    const [initialValues, setInitialValues] = useState({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        phoneNumber: '',
        profilePic: '',
        userDesc: '',
    });

    // Fetch user data based on user ID from URL
    useEffect(() => {
        const fetchUserData = async () => {
            // Commented out console logs for debugging
            // console.log('Users:', users); 
            // console.log('User ID from URL:', id);

            // Find the user in the users array
            const user = users.find((u) => u.employeeId === id);
            // console.log('Found User:', user);

            if (user) {
                // Set the initial values for the form
                setInitialValues({
                    employeeId: user.employeeId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    phoneNumber: user.phoneNumber || '',
                    profilePic: user.profilePic || '',
                    userDesc: user.userDesc || '',
                });
            } else {
                // Show an error message and redirect if user not found
                toast.error('User not found!');
                navigate('/dashboard'); // Redirect to dashboard if user not found
            }
        };

        fetchUserData();
    }, [users, id, navigate]);

    // Formik hook for managing form state and validation
    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true, // Reinitialize form with new values
        onSubmit: async (values, { setSubmitting }) => {
            try {
                setSubmitting(true);
                await editUser(id, values); // Update user with new values
                toast.success('User updated successfully!');
                navigate('/dashboard'); // Redirect after successful update
            } catch (error) {
                console.error('Error in onSubmit:', error);
                toast.error('Failed to update user. Please try again.'); // Show error message
            } finally {
                setSubmitting(false); // Reset submitting state
            }
        },
    });

    // Show loading spinner while data is being fetched
    if (loading) {
        return (
            <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Show error message if there's an error fetching data
    if (error) {
        return (
            <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">Error: {error}</Typography>
            </Container>
        );
    }

    return (
        <div>
            <Navbar title={'Edit User'} /> {/* Navigation bar with title */}
            <Typography variant="h4" align="center" margin="1rem 0">
                Edit User
            </Typography>
            <Container maxWidth="sm" style={{ backgroundColor: '#f5f5f5', padding: '2rem', borderRadius: '8px' }}>
                <form onSubmit={formik.handleSubmit}>
                    {/* Form fields for user details */}
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
                        label="Email"
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
                                    {role}
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
                        label="Phone Number"
                        variant="outlined"
                        name="phoneNumber"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                        helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                    />

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

                    <TextField
                        fullWidth
                        margin="normal"
                        label="User Description"
                        variant="outlined"
                        name="userDesc"
                        value={formik.values.userDesc}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.userDesc && Boolean(formik.errors.userDesc)}
                        helperText={formik.touched.userDesc && formik.errors.userDesc}
                    />

                    {/* Submit button */}
                    <div className="text-center">
                        <Button variant="contained" color="primary" type="submit" style={{ width: '35%', marginTop: '1rem' }}>
                            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Update'}
                        </Button>
                    </div>
                </form>
            </Container>
        </div>
    );
}

export default EditUser;