import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthHook } from '../contexts/AuthContext';
import { useResendEmailsHook } from '../contexts/ResendEmailsContext';
import { usePushNotificationsHook } from '../contexts/PushNotificationsContext';
import PreLoader from '../common/preloader/PreLoader';
import pkcLogo from '../../assets/pkc-logo.jpeg';

// Validation schema
const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthHook();
    const { sendPushNotificationOnLogin } = usePushNotificationsHook();
    const { sendEmail } = useResendEmailsHook();

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

            const currentUserId = `${result.userData?.role || 'Unknown'}_${result.userData?.employeeId || 'Unknown'}_${result.userData?.firstName || ''}_${result.userData?.lastName || ''}`.trim();

            if (result.success) {
                // Send login notification email
                // await sendEmail(
                //     'ewms.support@resend.dev',
                //     values.email,
                //     'Login Successful',
                //     '<p>Congratulations! You have successfully logged in to the EWMS application.</p>'
                // );

                // Register device token
                await sendPushNotificationOnLogin({
                    title: 'EWMS Push Notification',
                    body: 'Login successful!',
                    notificationType: 'success',
                    userId: currentUserId,
                });

                const route = roleRoutes[result.userData.role] || '/users/bins';
                navigate(route);
                toast.success(`Welcome, ${result.userData.role}`);
            } else {
                toast.error(result.error || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error: ', error);
            toast.error('Login failed. Please try again later.');
        } finally {
            setIsLoading(false);
            setSubmitting(false);
        }
    };

    const handleDemoLogin = (role, setFieldValue) => {
        setFieldValue('email', demoCredentials[role].email);
        setFieldValue('password', demoCredentials[role].password);
        setSelectedRole(role);
        toast.success(`Demo credentials for ${role} applied.`);
    };

    if (isLoading) {
        return <PreLoader />;
    }

    return (
        <div className="flex h-screen">
            {/* Left section with background image */}
            <div
                className="hidden bg-cover bg-center md:flex md:w-1/2"
                style={{
                    backgroundImage: 'url(https://res.cloudinary.com/dgsucveh2/image/upload/v1706749935/photo_2024-02-01_06.41.54_nsfqx6.jpg)',
                    opacity: 0.9,
                }}
            ></div>

            {/* Login Form */}
            <div className="flex w-full items-center justify-center md:w-1/2">
                <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
                    {/* Logo and Header */}
                    <img src={pkcLogo} alt="Pioneer Kumaraswamy College" className="mx-auto mb-4 w-1/3" />
                    <h1 className="text-center text-2xl font-semibold text-gray-800">PIONEER KUMARASWAMY COLLEGE</h1>
                    <p className="text-center text-gray-600">Affiliated to Manonmaniam Sundaranar University</p>
                    <p className="mb-6 text-center text-gray-600">Nagercoil, Tamil Nadu</p>

                    {/* Formik Form */}
                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={LoginSchema}
                        onSubmit={handleLogin}
                    >
                        {({ errors, touched, setFieldValue, isSubmitting }) => (
                            <Form>
                                {/* Email Field */}
                                <div className="mb-4">
                                    <label htmlFor="email" className="block font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <Field
                                        type="email"
                                        name="email"
                                        id="email"
                                        className={`w-full rounded border p-2 ${touched.email && errors.email
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                            } focus:border-blue-500 focus:ring`}
                                        autoComplete="email"
                                    />
                                    {touched.email && errors.email && (
                                        <p className="text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="mb-4">
                                    <label htmlFor="password" className="block font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            id="password"
                                            className={`w-full rounded border p-2 ${touched.password && errors.password
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                                } focus:border-blue-500 focus:ring`}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-2 text-gray-500 hover:text-gray-800"
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    {touched.password && errors.password && (
                                        <p className="text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>

                                {/* Demo Account Selector */}
                                <div className="mb-4">
                                    <label htmlFor="demo-account" className="block font-medium text-gray-700">
                                        Demo Account
                                    </label>
                                    <Field
                                        as="select"
                                        name="demo-account"
                                        id="demo-account"
                                        value={selectedRole}
                                        onChange={(e) => {
                                            const role = e.target.value;
                                            handleDemoLogin(role, setFieldValue);
                                        }}
                                        className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring"
                                    >
                                        <option value="" disabled>
                                            Select a demo role
                                        </option>
                                        {Object.keys(demoCredentials).map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </Field>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className={`w-full rounded bg-blue-500 p-2 text-white transition duration-200 hover:bg-blue-600 ${isSubmitting && 'cursor-not-allowed opacity-50'
                                        }`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Logging in...' : 'Login'}
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