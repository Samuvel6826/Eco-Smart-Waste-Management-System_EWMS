import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useUsersContext } from '../../../contexts/UsersContext';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { ROLE_OPTIONS, GENDER_OPTIONS } from '../helpers/constants/userConstants';
import { getAvatarUrl, FormField } from '../helpers/utils/userUtils';
import AddressSection from '../helpers/sub/AddressSection';
import PersonalInfoSection from '../helpers/sub/PersonalInfoSection';
import { createUserValidationSchema } from '../helpers/validation/userValidation';
import 'react-phone-input-2/lib/style.css';

// Hooks imports
import { useEmployeeId } from '../helpers/hooks/useEmployeeId';
import { useFormSubmit } from '../helpers/hooks/useFormSubmit';
import { useInitialFormValues } from '../helpers/hooks/useInitialFormValues';

const CreateUser = () => {
    const navigate = useNavigate();
    const { createUser, users, fetchUsers, loading, error: contextError } = useUsersContext();
    const { user } = useAuth();
    const [countryId, setCountryId] = useState(0);
    const [stateId, setStateId] = useState(0);

    useEffect(() => {
        fetchUsers();
        if (contextError) {
            toast.error(`Error: ${contextError}`);
        }
    }, [fetchUsers, contextError]);

    const generateEmployeeId = useEmployeeId(users);
    const handleSubmit = useFormSubmit(createUser, navigate);

    const initialValues = {
        ...useInitialFormValues(generateEmployeeId, user),
        address: {
            country: '',
            state: '',
            city: '',
            district: '',
            streetAddress: '',
            pinCode: ''
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="mx-auto mt-8 max-w-4xl rounded-lg bg-white p-8 shadow-lg">
            <Formik
                initialValues={initialValues}
                validationSchema={createUserValidationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, isSubmitting, setFieldValue, values }) => (
                    <Form className="space-y-6">
                        <div className="mb-6 text-center">
                            <img
                                src={values.previewUrl || values.profilePic || getAvatarUrl(values.gender, values.firstName, values.lastName)}
                                alt="Profile Preview"
                                className="mx-auto mb-4 h-40 w-40 rounded-full border-4 border-blue-500 object-cover"
                            />
                            <h2 className="text-3xl font-bold">Create New User</h2>
                        </div>

                        <PersonalInfoSection
                            values={values}
                            isEditing={true}
                            GENDER_OPTIONS={GENDER_OPTIONS}
                            ROLE_OPTIONS={ROLE_OPTIONS}
                        />

                        <FormField
                            name="password"
                            label="Password"
                            type="password"
                            required
                        />

                        <AddressSection
                            countryId={countryId}
                            setCountryId={setCountryId}
                            stateId={stateId}
                            setStateId={setStateId}
                            setFieldValue={setFieldValue}
                            values={values}
                            isEditing={true}
                        />

                        <FormField
                            name="userDescription"
                            label="User Description"
                            as="textarea"
                            rows="4"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                    const file = event.currentTarget.files[0];
                                    if (file) {
                                        setFieldValue("newProfilePic", file);
                                        const reader = new FileReader();
                                        reader.onloadend = () => setFieldValue("previewUrl", reader.result);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                            />
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

                        {errors.submit && (
                            <div className="text-center text-red-500">{errors.submit}</div>
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CreateUser;