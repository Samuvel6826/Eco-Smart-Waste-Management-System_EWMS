import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';

const roleOptions = ['Admin', 'Manager', 'Supervisor', 'Technician'];

const validationSchema = Yup.object().shape({
    employeeId: Yup.string().required('Employee ID is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
    phoneNumber: Yup.string(),
    profilePic: Yup.string().url('Must be a valid URL'),
    userDesc: Yup.string(),
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
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to fetch user profile');
            }
        };
        fetchProfile();
    }, [id, authUser, getUserByEmployeeId]);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await editUser(values.employeeId, values);
            setProfile(values);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile. Please try again.');
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
                    className="mx-auto mb-4 h-40 w-40 rounded-full border-4 border-blue-500"
                />
                <h2 className="text-3xl font-bold">{`${profile.firstName} ${profile.lastName}`}</h2>
                <p className="text-lg text-gray-600">{profile.role}</p>
            </div>

            <Formik
                initialValues={profile}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ errors, touched, isSubmitting, values }) => (
                    <Form className="space-y-6">
                        <div>
                            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
                            <Field name="employeeId" type="text" className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2 shadow-sm" readOnly />
                        </div>

                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                            <Field name="firstName" type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" readOnly={!isEditing} />
                            {touched.firstName && errors.firstName && <div className="mt-1 text-sm text-red-500">{errors.firstName}</div>}
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                            <Field name="lastName" type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" readOnly={!isEditing} />
                            {touched.lastName && errors.lastName && <div className="mt-1 text-sm text-red-500">{errors.lastName}</div>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <Field name="email" type="email" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" readOnly={!isEditing} />
                            {touched.email && errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                            {isEditing ? (
                                <Field as="select" name="role" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm">
                                    {roleOptions.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </Field>
                            ) : (
                                <div className="mt-1 rounded-md bg-gray-100 p-2">{values.role}</div>
                            )}
                            {touched.role && errors.role && <div className="mt-1 text-sm text-red-500">{errors.role}</div>}
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <Field name="phoneNumber" type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" readOnly={!isEditing} />
                            {touched.phoneNumber && errors.phoneNumber && <div className="mt-1 text-sm text-red-500">{errors.phoneNumber}</div>}
                        </div>

                        <div>
                            <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
                            <Field name="profilePic" type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" readOnly={!isEditing} />
                            {touched.profilePic && errors.profilePic && <div className="mt-1 text-sm text-red-500">{errors.profilePic}</div>}
                        </div>

                        <div>
                            <label htmlFor="userDesc" className="block text-sm font-medium text-gray-700">User Description</label>
                            <Field name="userDesc" as="textarea" rows="4" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" readOnly={!isEditing} />
                            {touched.userDesc && errors.userDesc && <div className="mt-1 text-sm text-red-500">{errors.userDesc}</div>}
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

export default UserProfile;