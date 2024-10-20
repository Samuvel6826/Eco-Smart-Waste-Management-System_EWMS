import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import PreLoader from '../common/preloader/PreLoader';
import {
    Box,
    Button,
    CssBaseline,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import pkcLogo from "../../assets/pkc-logo.jpeg";

// Validation schema for login
const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const demoCredentials = {
        Admin: { email: 'samuvel6826@gmail.com', password: '1' },
        Manager: { email: 'sakthiss2613@gmail.com', password: '1' },
        Supervisor: { email: 'jayaprasanna991@gmail.com', password: '1' },
        Technician: { email: 'praveengabap@gmail.com', password: '1' },
    };

    const roleRoutes = {
        Admin: '/dashboard',
        Manager: '/dashboard',
        Supervisor: '/users/supervisor-bins',
        Technician: '/dashboard',
    };

    const handleLogin = async (values, { setSubmitting }) => {
        try {
            setIsLoading(true);
            const decodedUser = await login(values.email, values.password);
            toast.success('Login successful!');
            const route = roleRoutes[decodedUser.role] || '/users/bins';
            navigate(route);
        } catch (error) {
            console.error("Login error: ", error);
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
            setSubmitting(false);
        }
    };

    const handleDemoLogin = (role, setFieldValue) => {
        setFieldValue('email', demoCredentials[role].email);
        setFieldValue('password', demoCredentials[role].password);
    };

    if (isLoading) {
        return <PreLoader />;
    }

    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <CssBaseline />
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundImage: 'url(https://res.cloudinary.com/dgsucveh2/image/upload/v1706749935/photo_2024-02-01_06.41.54_nsfqx6.jpg)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => t.palette.grey[50],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.9,
                    transition: 'opacity 0.5s ease-in-out',
                    '&:hover': {
                        opacity: 1,
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            />
            <Grid
                item
                xs={12}
                sm={8}
                md={5}
                component={Paper}
                elevation={10}
                square
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        my: 0,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        padding: '20px',
                        boxShadow: 4,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            boxShadow: 8,
                        },
                        maxWidth: '500px',
                        width: '100%',
                    }}
                >
                    <img src={pkcLogo} alt="Pioneer Kumaraswamy College" style={{ width: '35%', marginBottom: '1rem' }} />
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        PIONEER KUMARASWAMY COLLEGE
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" align="center">
                        Affiliated to Manonmaniam Sundaranar University, Tirunelveli
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" align="center">
                        Reaccredited with B<sup>++</sup> grade by NAAC
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
                        Vetturnimadam, Nagercoil - 3.
                    </Typography>
                    <Box sx={{ mt: 2, width: '100%' }}>
                        <Formik
                            initialValues={{ email: '', password: '' }}
                            validationSchema={LoginSchema}
                            onSubmit={handleLogin}
                        >
                            {({ errors, touched, setFieldValue, isSubmitting }) => (
                                <Form>
                                    <Field
                                        as={TextField}
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        error={touched.email && !!errors.email}
                                        helperText={touched.email && errors.email}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Email />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Field
                                        as={TextField}
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        autoComplete="current-password"
                                        error={touched.password && !!errors.password}
                                        helperText={touched.password && errors.password}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="demo-account-label">Demo Account</InputLabel>
                                        <Select
                                            labelId="demo-account-label"
                                            id="demo-account"
                                            value={selectedRole}
                                            label="Demo Account"
                                            onChange={(e) => {
                                                const role = e.target.value;
                                                setSelectedRole(role);
                                                handleDemoLogin(role, setFieldValue);
                                            }}
                                        >
                                            <MenuItem value="" disabled>Select a demo role</MenuItem>
                                            {Object.keys(demoCredentials).map((role) => (
                                                <MenuItem key={role} value={role}>{role}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{
                                            mt: 3,
                                            mb: 2,
                                            borderRadius: '30px',
                                            backgroundColor: '#3f51b5',
                                            '&:hover': {
                                                backgroundColor: '#303f9f',
                                            },
                                            transition: 'all 0.3s ease-in-out',
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        Login
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}

export default Login;