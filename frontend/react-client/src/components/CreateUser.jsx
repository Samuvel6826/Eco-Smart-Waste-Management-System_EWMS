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
import { useNavigate } from 'react-router-dom';
import { useUsersContext } from '../contexts/UsersContext';
import { toast } from 'react-hot-toast';

const validationSchema = Yup.object().shape({
    employeeId: Yup.string().required('Employee ID is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
    role: Yup.string().required('Role is required'),
    phoneNumber: Yup.string(),
    profilePic: Yup.string().url('Must be a valid URL'),
    userDesc: Yup.string(),
});

const roleOptions = ['Admin', 'Manager', 'Supervisor', 'Technician'];

function CreateUser() {
    const navigate = useNavigate();
    const [employeeId, setEmployeeId] = useState(''); // This will hold the new employee ID
    const { users, fetchUsers, loading, error, createUser } = useUsersContext();

    useEffect(() => {
        // Fetch users if not already fetched
        if (!users || users.length === 0) {
            fetchUsers();
        }
    }, [users, fetchUsers]);

    // Effect to generate new employee ID based on existing users
    useEffect(() => {
        const fetchLatestEmployeeId = () => {
            if (users && users.length > 0) {
                const maxEmployeeId = users
                    .filter(user => user && user.employeeId) // Ensure user is valid
                    .map(user => {
                        const id = user.employeeId.replace(/\D/g, ''); // Extract numeric part
                        return parseInt(id, 10);
                    })
                    .reduce((max, current) => Math.max(max, current), 0);

                const newEmployeeNumber = String(maxEmployeeId + 1).padStart(3, '0');
                setEmployeeId(`EMP${newEmployeeNumber}`);
            } else {
                setEmployeeId('EMP001'); // Default ID if no users exist
                console.log('No existing users found. Defaulting to EMP001.');
            }
        };
        fetchLatestEmployeeId();
    }, [users]);

    const formik = useFormik({
        initialValues: {
            employeeId: employeeId, // Set initial value for employeeId
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: '',
            phoneNumber: '',
            profilePic: '',
            userDesc: '',
        },
        validationSchema,
        enableReinitialize: true, // This allows the form to reset when initialValues change
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setSubmitting(true);
                const createdUser = await createUser(values);
                if (createdUser) {
                    toast.success('User created successfully!');
                    resetForm(); // Reset the form fields after successful submission
                    setEmployeeId(''); // Clear the employeeId for next entry
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error in onSubmit:', error);
                toast.error('Failed to create user. Please try again.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Sync employeeId with formik field value
    useEffect(() => {
        formik.setFieldValue('employeeId', employeeId);
    }, [employeeId]);

    // Show loading spinner if data is loading
    if (loading) {
        return (
            <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Show error message if there's an error
    if (error) {
        return (
            <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">Error: {error}</Typography>
            </Container>
        );
    }

    // Render form
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
                            readOnly: true,
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

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        variant="outlined"
                        name="password"
                        type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
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