import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
    Box,
    Button,
    Container,
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
        Manager: { email: 'jenitharajan029@gmail.com', password: '1' },
        Supervisor: { email: 'jayaprasanna991@gmail.com', password: '1' },
        Technician: { email: 'praveengabap@gmail.com', password: '1' },
    };

    const handleLogin = async (values) => {
        try {
            setIsLoading(true);
            const decodedUser = await login(values.email, values.password);
            toast.success('Login successful!');
            navigate(decodedUser.role === 'Admin' ? '/dashboard' : '/users/bins');
        } catch (error) {
            console.error("Login error: ", error);
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = (role, setFieldValue) => {
        setFieldValue('email', demoCredentials[role].email);
        setFieldValue('password', demoCredentials[role].password);
    };

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
                }}
            />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={10} square>
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        padding: '20px',
                        boxShadow: 4,
                    }}
                >
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        PIONEER KUMARASWAMY COLLEGE
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" align="center">
                        Affiliated to Manonmaniam Sundaranar University, Tirunelveli
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" align="center">
                        Reaccredited with B<sup>++</sup> grade by NAAC
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" align="center" gutterBottom>
                        Vetturnimadam, Nagercoil - 3.
                    </Typography>
                    <Box sx={{ mt: 2, width: '100%' }}>
                        <Formik
                            initialValues={{ email: '', password: '' }}
                            validationSchema={LoginSchema}
                            onSubmit={handleLogin}
                        >
                            {({ errors, touched, setFieldValue }) => (
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
                                        error={touched.email && errors.email}
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
                                        error={touched.password && errors.password}
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
                                        }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Logging in...' : 'Login'}
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