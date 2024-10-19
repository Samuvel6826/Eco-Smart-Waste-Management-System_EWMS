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
import { useNavigate } from 'react-router-dom';
import { useUsersContext } from '../../../contexts/UsersContext';
import { toast } from 'react-hot-toast';

const roleOptions = ['Admin', 'Manager', 'Supervisor', 'Technician'];

const CreateUserForm = ({
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue
}) => {
    const { users, fetchUsers, loading, error: contextError } = useUsersContext();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (users && users.length > 0) {
            const maxEmployeeId = users
                .filter(user => user && user.employeeId)
                .map(user => {
                    const id = user.employeeId.replace(/\D/g, '');
                    return parseInt(id, 10);
                })
                .reduce((max, current) => Math.max(max, current), 0);

            const newEmployeeNumber = String(maxEmployeeId + 1).padStart(3, '0');
            setFieldValue('employeeId', `EMP${newEmployeeNumber}`);
        } else {
            setFieldValue('employeeId', 'EMP001');
        }
    }, [users, setFieldValue]);

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
            <Container maxWidth="sm">
                <Typography variant="h4" align="center" margin="1rem 0">
                    Create User
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
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
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
                            {isSubmitting ? <CircularProgress size={24} /> : 'Create User'}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </div>
    );
};

const CreateUserEnhanced = withFormik({
    mapPropsToValues: () => ({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
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
        password: Yup.string().required('Password is required'),
        role: Yup.string().required('Role is required'),
        phoneNumber: Yup.string(),
        profilePic: Yup.string().url('Must be a valid URL'),
        userDesc: Yup.string(),
    }),
    handleSubmit: (values, { setSubmitting, resetForm, props }) => {
        const { createUser } = props;
        createUser(values)
            .then(() => {
                toast.success('User created successfully!');
                resetForm();
                props.navigate('/dashboard');
            })
            .catch((error) => {
                console.error('Error in handleSubmit:', error);
                toast.error('Failed to create user. Please try again.');
            })
            .finally(() => {
                setSubmitting(false);
            });
    },
    displayName: 'CreateUserForm',
})(CreateUserForm);

const CreateUser = () => {
    const navigate = useNavigate();
    const { createUser } = useUsersContext();

    return <CreateUserEnhanced createUser={createUser} navigate={navigate} />;
};

export default CreateUser;