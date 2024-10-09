import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext'; // Ensure the path is correct

// Define the validation schema for the login form using Yup
const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

// Reusable component for input fields
const InputField = ({ label, name, type, placeholder }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor={name}>
            {label}
        </label>
        <Field
            type={type}
            name={name}
            placeholder={placeholder}
            className="block w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <ErrorMessage name={name} component="div" className="text-sm text-red-500" />
    </div>
);

// Reusable component for demo login buttons
const DemoLoginButton = ({ role, isLoading, onClick, children, color }) => (
    <button
        type="button"
        className={`rounded px-4 py-2 text-white ${color} hover:${color}-600`}
        onClick={onClick}
        disabled={isLoading}
    >
        {children}
    </button>
);

function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Use login method from context

    // Function to handle the login process
    const handleLogin = async (values) => {
        try {
            setIsLoading(true);
            const decodedUser = await login(values.email, values.password); // Use the login method
            toast.success('Login successful!');
            navigate(decodedUser.role === 'Admin' ? '/dashboard' : '/users/bins');
        } catch (error) {
            console.error("Login error: ", error);
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Demo account login handler
    const handleDemoLogin = (role, setFieldValue) => {
        const demoCredentials = {
            Admin: { email: 'samuvel6826@gmail.com', password: '1' },
            Manager: { email: 'jenitharajan029@gmail.com', password: '1' },
            Supervisor: { email: 'jayaprasanna991@gmail.com', password: '1' },
        };
        // Set the form fields with demo credentials
        setFieldValue('email', demoCredentials[role].email);
        setFieldValue('password', demoCredentials[role].password);
    };

    return (
        <div id="loginCTN" className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
            <div id="loginBorder" className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
                <div id="loginImgCTN" className="mb-4 flex justify-center">
                    <img
                        src="https://res.cloudinary.com/dgsucveh2/image/upload/v1706749935/photo_2024-02-01_06.41.54_nsfqx6.jpg"
                        alt="Kumaraswamy Statue"
                        className="h-32 w-32 rounded-full"
                    />
                </div>

                <div id="loginFormCTN" className="text-center">
                    {/* Header and college information */}
                    <h1 className="text-2xl font-bold">PIONEER KUMARASWAMY COLLEGE</h1>
                    <h5>(Affiliated to Manonmaniam Sundaranar University, Tirunelveli)</h5>
                    <h3>Reaccredited with B<sup>++</sup> grade by NAAC</h3>
                    <h4>Vetturnimadam, Nagercoil - 3.</h4>
                    <br />

                    {/* Login form */}
                    <h1 className="mb-4 text-xl font-semibold">Login Here!</h1>
                    <Formik
                        initialValues={{
                            email: '',
                            password: '',
                        }}
                        validationSchema={LoginSchema}
                        onSubmit={handleLogin}
                    >
                        {({ setFieldValue }) => ( // Destructure setFieldValue from Formik props
                            <Form>
                                {/* Input fields */}
                                <InputField label="Email" name="email" type="email" placeholder="Enter email" />
                                <InputField label="Password" name="password" type="password" placeholder="Password" />

                                {/* Login button with loading spinner */}
                                <button
                                    type="submit"
                                    className={`w-full p-2 rounded text-white mb-4 ${isLoading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </button>

                                {/* Demo Account Buttons */}
                                <div className="flex justify-between">
                                    <DemoLoginButton
                                        role="Admin"
                                        isLoading={isLoading}
                                        onClick={() => handleDemoLogin('Admin', setFieldValue)}
                                        color="bg-green-500"
                                    >
                                        Admin Demo Login
                                    </DemoLoginButton>
                                    <DemoLoginButton
                                        role="Manager"
                                        isLoading={isLoading}
                                        onClick={() => handleDemoLogin('Manager', setFieldValue)}
                                        color="bg-purple-500"
                                    >
                                        Manager Demo Login
                                    </DemoLoginButton>
                                    <DemoLoginButton
                                        role="Supervisor"
                                        isLoading={isLoading}
                                        onClick={() => handleDemoLogin('Supervisor', setFieldValue)}
                                        color="bg-purple-500"
                                    >
                                        Supervisor Demo Login
                                    </DemoLoginButton>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}

export default Login;