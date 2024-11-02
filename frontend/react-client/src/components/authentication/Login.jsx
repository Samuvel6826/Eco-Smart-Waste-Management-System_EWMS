import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import PreLoader from '../common/preloader/PreLoader';
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
            const result = await login(values.email, values.password);

            if (result.success) {
                toast.success('Login successful!');
                const route = roleRoutes[result.userData.role] || '/users/bins';
                navigate(route);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error("Login error: ", error);
            toast.error('Login failed. Please try again.');
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
        <div className="flex h-screen">
            <div className="hidden bg-cover bg-center md:flex md:w-1/2" style={{
                backgroundImage: 'url(https://res.cloudinary.com/dgsucveh2/image/upload/v1706749935/photo_2024-02-01_06.41.54_nsfqx6.jpg)',
                opacity: 0.9,
            }}>
            </div>
            <div className="flex w-full items-center justify-center md:w-1/2">
                <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
                    <img src={pkcLogo} alt="Pioneer Kumaraswamy College" className="mx-auto mb-4 w-1/3" />
                    <h1 className="text-center text-2xl font-semibold">PIONEER KUMARASWAMY COLLEGE</h1>
                    <p className="text-center text-gray-500">Affiliated to Manonmaniam Sundaranar University, Tirunelveli</p>
                    <p className="text-center text-gray-500">Reaccredited with B<sup>++</sup> grade by NAAC</p>
                    <p className="mb-6 text-center text-gray-500">Vetturnimadam, Nagercoil - 3.</p>
                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={LoginSchema}
                        onSubmit={handleLogin}
                    >
                        {({ errors, touched, setFieldValue, isSubmitting }) => (
                            <Form>
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-gray-700">Email Address</label>
                                    <Field
                                        type="email"
                                        name="email"
                                        id="email"
                                        className={`w-full p-2 border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        autoComplete="email"
                                        autoFocus
                                    />
                                    {touched.email && errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-gray-700">Password</label>
                                    <div className="relative">
                                        <Field
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            id="password"
                                            className={`w-full p-2 border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'} rounded`}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-2 top-2 text-gray-500"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    {touched.password && errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="demo-account" className="block text-gray-700">Demo Account</label>
                                    <Field
                                        as="select"
                                        name="demo-account"
                                        id="demo-account"
                                        value={selectedRole}
                                        onChange={(e) => {
                                            const role = e.target.value;
                                            setSelectedRole(role);
                                            handleDemoLogin(role, setFieldValue);
                                        }}
                                        className="w-full rounded border border-gray-300 p-2"
                                    >
                                        <option value="" disabled>Select a demo role</option>
                                        {Object.keys(demoCredentials).map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </Field>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full rounded bg-blue-500 p-2 text-white transition duration-200 hover:bg-blue-700"
                                    disabled={isSubmitting}
                                >
                                    Login
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}

export default Login;