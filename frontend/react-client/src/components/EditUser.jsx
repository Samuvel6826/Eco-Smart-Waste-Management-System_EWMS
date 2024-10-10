import React, { useEffect } from 'react';
import { withFormik } from 'formik';
import * as Yup from 'yup';
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
    Box,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsersContext } from '../contexts/UsersContext';
import { toast } from 'react-hot-toast';
import Navbar from './common/Navbar';

const roleOptions = ['Admin', 'Manager', 'Supervisor', 'Technician'];

const EditUserForm = ({
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue
}) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { users, fetchUsers, loading, error: contextError } = useUsersContext();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (users && users.length > 0) {
            const user = users.find(u => u.employeeId === id);
            if (user) {
                Object.keys(user).forEach(key => {
                    setFieldValue(key, user[key] || '');
                });
            } else {
                toast.error('User not found!');
                navigate('/dashboard');
            }
        }
    }, [users, id, setFieldValue, navigate]);

    if (loading) {
        return (
            <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (contextError) {
        return (
            <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">Error: {contextError}</Typography>
            </Container>
        );
    }

    return (
        <div>
            <Navbar title={'Edit User'} />
            <Container maxWidth="sm">
                <Typography variant="h4" align="center" margin="1rem 0">
                    Edit User
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Employee ID"
                        name="employeeId"
                        value={values.employeeId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.employeeId && Boolean(errors.employeeId)}
                        helperText={touched.employeeId && errors.employeeId}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="First Name"
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.firstName && Boolean(errors.firstName)}
                        helperText={touched.firstName && errors.firstName}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Last Name"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.lastName && Boolean(errors.lastName)}
                        helperText={touched.lastName && errors.lastName}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                            labelId="role-label"
                            name="role"
                            value={values.role}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.role && Boolean(errors.role)}
                        >
                            {roleOptions.map((role) => (
                                <MenuItem key={role} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                        {touched.role && errors.role && <Typography color="error">{errors.role}</Typography>}
                    </FormControl>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Phone Number"
                        name="phoneNumber"
                        value={values.phoneNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                        helperText={touched.phoneNumber && errors.phoneNumber}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Profile Picture URL"
                        name="profilePic"
                        value={values.profilePic}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.profilePic && Boolean(errors.profilePic)}
                        helperText={touched.profilePic && errors.profilePic}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="User Description"
                        name="userDesc"
                        multiline
                        rows={4}
                        value={values.userDesc}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.userDesc && Boolean(errors.userDesc)}
                        helperText={touched.userDesc && errors.userDesc}
                    />
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Update User'}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </div>
    );
};

const EditUserEnhanced = withFormik({
    mapPropsToValues: () => ({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        phoneNumber: '',
        profilePic: '',
        userDesc: '',
    }),
    validationSchema: Yup.object().shape({
        employeeId: Yup.string().required('Employee ID is required'),
        firstName: Yup.string().required('First Name is required'),
        lastName: Yup.string().required('Last Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        role: Yup.string().required('Role is required'),
        phoneNumber: Yup.string(),
        profilePic: Yup.string().url('Must be a valid URL'),
        userDesc: Yup.string(),
    }),
    handleSubmit: (values, { setSubmitting, props }) => {
        const { editUser } = props;
        editUser(values.employeeId, values)
            .then(() => {
                toast.success('User updated successfully!');
                props.navigate('/dashboard');
            })
            .catch((error) => {
                console.error('Error in handleSubmit:', error);
                toast.error('Failed to update user. Please try again.');
            })
            .finally(() => {
                setSubmitting(false);
            });
    },
    displayName: 'EditUserForm',
})(EditUserForm);

const EditUser = () => {
    const navigate = useNavigate();
    const { editUser } = useUsersContext();

    return <EditUserEnhanced editUser={editUser} navigate={navigate} />;
};

export default EditUser;