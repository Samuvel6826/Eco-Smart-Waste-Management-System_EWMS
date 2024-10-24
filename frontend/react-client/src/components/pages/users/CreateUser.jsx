import React, { useEffect, useCallback } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useUsersContext } from '../../contexts/UsersContext';
import { toast } from 'react-hot-toast';
import { storage, storageRef, uploadBytes, getDownloadURL } from '../../../../firebase.config';

const roleOptions = ['Admin', 'Manager', 'Supervisor', 'Technician'];

const validationSchema = Yup.object().shape({
    employeeId: Yup.string().required('Employee ID is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
    role: Yup.string().required('Role is required'),
    phoneNumber: Yup.string().matches(/^[0-9]+$/, "Must be only digits").min(10, "Must be at least 10 digits"),
    profilePic: Yup.string().url('Must be a valid URL'),
    userDesc: Yup.string().max(500, 'Description must be 500 characters or less'),
});

const CreateUser = () => {
    const navigate = useNavigate();
    const { createUser, users, fetchUsers, loading, error: contextError } = useUsersContext();

    useEffect(() => {
        fetchUsers();
        // Show error toast if there's a context error
        if (contextError) {
            toast.error(`Error: ${contextError}`);
        }
    }, [fetchUsers, contextError]);

    const generateEmployeeId = (users) => {
        if (users && users.length > 0) {
            const maxEmployeeId = users
                .filter(user => user && user.employeeId)
                .map(user => {
                    const id = user.employeeId.replace(/\D/g, '');
                    return parseInt(id, 10);
                })
                .reduce((max, current) => Math.max(max, current), 0);

            return `EMP${String(maxEmployeeId + 1).padStart(3, '0')}`;
        }
        return 'EMP001';
    };

    const handleImageUpload = useCallback(async (file, employeeId, firstName, lastName) => {
        if (!file) return null;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return null;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File size exceeds 2MB limit');
            return null;
        }

        try {
            const fileRef = storageRef(storage, `profile-pics/${employeeId}-${firstName}-${lastName}`);
            const snapshot = await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            toast.success('Profile picture uploaded successfully');
            return downloadURL;
        } catch (error) {
            toast.error(`Failed to upload image: ${error.message}`);
            return null;
        }
    }, []);

    const initialValues = {
        employeeId: generateEmployeeId(users),
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        phoneNumber: '',
        profilePic: '',
        userDesc: '',
        newProfilePic: null,
        previewUrl: null // Added to handle image preview
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            let finalValues = { ...values };
            delete finalValues.newProfilePic;
            delete finalValues.previewUrl;

            if (values.newProfilePic) {
                const imageUrl = await handleImageUpload(
                    values.newProfilePic,
                    values.employeeId,
                    values.firstName,
                    values.lastName
                );
                if (imageUrl) {
                    finalValues.profilePic = imageUrl;
                }
            }

            await createUser(finalValues);
            toast.success('User created successfully!');
            resetForm();
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to create user. Please try again.');
            console.error('Error creating user:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="mx-auto mt-8 max-w-4xl rounded-lg bg-white p-8 shadow-lg">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched, isSubmitting, setFieldValue, values }) => (
                    <Form className="space-y-6">
                        <div className="mb-6 text-center">
                            <img
                                src={values.previewUrl || values.profilePic || `https://avatar.iran.liara.run/username?username=${values.firstName}+${values.lastName}`}
                                alt="Profile Preview"
                                className="mx-auto mb-4 h-40 w-40 rounded-full border-4 border-blue-500 object-cover"
                            />
                            <h2 className="text-3xl font-bold">Create New User</h2>
                        </div>

                        <FormField name="employeeId" label="Employee ID" readOnly />
                        <FormField name="firstName" label="First Name" />
                        <FormField name="lastName" label="Last Name" />
                        <FormField name="email" label="Email" type="email" />
                        <FormField name="password" label="Password" type="password" />
                        <FormField name="role" label="Role" as="select">
                            <option value="">Select a role</option>
                            {roleOptions.map((role) => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </FormField>
                        <FormField name="phoneNumber" label="Phone Number" />
                        <FormField name="userDesc" label="User Description" as="textarea" rows="4" />

                        <div>
                            <label htmlFor="newProfilePic" className="block text-sm font-medium text-gray-700">
                                Profile Picture
                            </label>
                            <input
                                id="newProfilePic"
                                name="newProfilePic"
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                    const file = event.currentTarget.files[0];
                                    setFieldValue("newProfilePic", file);

                                    // Create preview URL for the uploaded image
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFieldValue("previewUrl", reader.result);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                            />
                            {touched.profilePic && errors.profilePic && (
                                <div className="mt-1 text-sm text-red-500">{errors.profilePic}</div>
                            )}
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                type="submit"
                                className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create User'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="rounded bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

const FormField = ({ name, label, as, readOnly, children, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <Field
            name={name}
            as={as}
            readOnly={readOnly}
            className={`mt-1 block w-full rounded-md border ${readOnly ? 'bg-gray-100' : 'border-gray-300'} p-2 shadow-sm`}
            {...props}
        >
            {children}
        </Field>
        <ErrorMessage name={name} />
    </div>
);

const ErrorMessage = ({ name }) => (
    <Field name={name}>
        {({ form }) => {
            const error = form.errors[name];
            const touched = form.touched[name];
            return touched && error ? <div className="mt-1 text-sm text-red-500">{error}</div> : null;
        }}
    </Field>
);

export default CreateUser;