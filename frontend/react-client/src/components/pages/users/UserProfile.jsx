import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { storage, storageRef, uploadBytes, getDownloadURL } from '../../../../firebase.config';

const roleOptions = ['Admin', 'Manager', 'Supervisor', 'Technician'];

const validationSchema = Yup.object().shape({
    employeeId: Yup.string().required('Employee ID is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
    phoneNumber: Yup.string().matches(/^[0-9]+$/, "Must be only digits").min(10, "Must be at least 10 digits"),
    profilePic: Yup.string().url('Must be a valid URL'),
    userDesc: Yup.string().max(500, 'Description must be 500 characters or less'),
});

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getUserByEmployeeId, editUser, loading, error: contextError } = useUsersContext();
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const fetchedProfile = await getUserByEmployeeId(id || authUser?.employeeId);
                setProfile(fetchedProfile);
                toast.success('Profile loaded successfully');
            } catch (error) {
                toast.error('Failed to fetch user profile');
            }
        };
        fetchProfile();
    }, [id, authUser, getUserByEmployeeId]);

    const handleImageUpload = useCallback(async (file) => {
        if (!file) return null;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return null;
        }

        try {
            const fileRef = storageRef(storage, `profile-pics/${profile.employeeId}-${profile.firstName}-${profile.lastName}`);
            const snapshot = await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            toast.success('Profile picture uploaded successfully');
            return downloadURL;
        } catch (error) {
            toast.error(`Failed to upload image: ${error.message}`);
            return null;
        }
    }, [profile]);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            let updatedValues = { ...values };
            delete updatedValues.newProfilePic;

            if (values.newProfilePic) {
                const imageUrl = await handleImageUpload(values.newProfilePic);
                if (imageUrl) {
                    updatedValues.profilePic = imageUrl;
                }
            }

            await editUser(updatedValues.employeeId, updatedValues);
            setProfile(updatedValues);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(`Failed to update profile: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !profile) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (contextError) {
        return <div className="text-center text-red-500">Error: {contextError}</div>;
    }

    return (
        <div className="mx-auto mt-8 max-w-4xl rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
                <img
                    src={profile.profilePic}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="mx-auto mb-4 h-40 w-40 rounded-full border-4 border-blue-500 object-cover"
                />
                <h2 className="text-3xl font-bold">{`${profile.firstName} ${profile.lastName}`}</h2>
                <p className="text-lg text-gray-600">{profile.role}</p>
            </div>

            <Formik
                initialValues={{ ...profile, newProfilePic: null }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                    <Form className="space-y-6">
                        <FormField name="employeeId" label="Employee ID" readOnly />
                        <FormField name="firstName" label="First Name" readOnly={!isEditing} />
                        <FormField name="lastName" label="Last Name" readOnly={!isEditing} />
                        <FormField name="email" label="Email" type="email" readOnly={!isEditing} />
                        <FormField name="role" label="Role" as="select" readOnly={!isEditing}>
                            {roleOptions.map((role) => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </FormField>
                        <FormField name="phoneNumber" label="Phone Number" readOnly={!isEditing} />
                        <FormField name="userDesc" label="User Description" as="textarea" rows="4" readOnly={!isEditing} />

                        <div>
                            <label htmlFor="newProfilePic" className="block text-sm font-medium text-gray-700">Profile Picture</label>
                            {isEditing ? (
                                <input
                                    id="newProfilePic"
                                    name="newProfilePic"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        setFieldValue("newProfilePic", event.currentTarget.files[0]);
                                    }}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                />
                            ) : (
                                <div className="mt-1 rounded-md bg-gray-100 p-2">{profile.profilePic}</div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="flex space-x-4">
                                <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                                Edit Profile
                            </button>
                        )}
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

export default UserProfile;