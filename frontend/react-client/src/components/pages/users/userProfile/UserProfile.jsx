import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { toast } from 'react-hot-toast';
import { storage, storageRef, uploadBytes, getDownloadURL } from '../../../../../firebase.config';
import dayjs from 'dayjs';
import { useUsersContext } from '../../../contexts/UsersContext';
import { useAuth } from '../../../contexts/AuthContext';

import ProfileHeader from '../helpers/sub/ProfileHeader';
import PersonalInfoSection from '../helpers/sub/PersonalInfoSection';
import AddressSection from '../helpers/sub/AddressSection';
import ActionButtons from '../helpers/sub/ActionButtons';
import AdditionalInfo from '../helpers/sub/AdditionalInfo';
import { userProfileValidationSchema } from '../helpers/validation/userValidation';
import { ROLE_OPTIONS, GENDER_OPTIONS } from '../helpers/constants/userConstants';
import { FormField, CustomErrorMessage } from '../helpers/utils/userUtils';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getUserByEmployeeId, editUser, loading } = useUsersContext();
    const { user: authUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [initialValues, setInitialValues] = useState({
        firstName: '',
        lastName: '',
        employeeId: '',
        dateOfBirth: '',
        gender: '',
        role: '',
        address: {
            country: '',
            state: '',
            city: '',
            streetAddress: '',
            pinCode: '',
            district: ''
        },
        userDescription: '',
        profilePic: '',
        phoneNumber: '',
        email: '',
        age: '',
        newProfilePic: undefined,
        previewUrl: undefined,
        createdBy: '',
        createdAt: null,
        updatedBy: '',
        updatedAt: null,
        lastLoginBy: '',            // New field
        lastLoginAt: null,            // New field
        lastPasswordChangedBy: '',  // New field
        lastPasswordChangedAt: null  // New field
    });

    const fetchProfile = useCallback(async () => {
        try {
            const fetchedProfile = await getUserByEmployeeId(id || authUser?.employeeId);

            if (!fetchedProfile) {
                toast.error('User profile not found');
                return;
            }

            // Format and clean the data
            const formattedProfile = {
                firstName: fetchedProfile.firstName || '',
                lastName: fetchedProfile.lastName || '',
                employeeId: fetchedProfile.employeeId || '',
                dateOfBirth: fetchedProfile.dateOfBirth ?
                    dayjs(fetchedProfile.dateOfBirth).format('YYYY-MM-DD') : '',
                gender: fetchedProfile.gender || '',
                role: fetchedProfile.role || '',
                userDescription: fetchedProfile.userDescription || '',
                profilePic: fetchedProfile.profilePic || '',
                phoneNumber: fetchedProfile.phoneNumber || '',
                email: fetchedProfile.email || '',
                age: fetchedProfile.age?.toString() || '',
                address: {
                    country: fetchedProfile.address?.country || '',
                    state: fetchedProfile.address?.state || '',
                    city: fetchedProfile.address?.city || '',
                    streetAddress: fetchedProfile.address?.streetAddress || '',
                    pinCode: fetchedProfile.address?.pinCode?.toString() || '',
                    district: fetchedProfile.address?.district || ''
                },
                // Add these fields from fetched profile
                createdBy: fetchedProfile.createdBy || 'N/A',
                createdAt: fetchedProfile.createdAt || null,
                updatedBy: fetchedProfile.updatedBy || 'N/A',
                updatedAt: fetchedProfile.updatedAt || null,
                lastLoginBy: fetchedProfile.lastLoginBy || 'N/A',                 // New field
                lastLoginAt: fetchedProfile.lastLoginAt || null,                 // New field
                lastPasswordChangedBy: fetchedProfile.lastPasswordChangedBy || 'N/A', // New field
                lastPasswordChangedAt: fetchedProfile.lastPasswordChangedAt || null, // New field
                newProfilePic: undefined,
                previewUrl: undefined
            };

            setInitialValues(formattedProfile);
            setSelectedCountry(formattedProfile.address.country);
            setSelectedState(formattedProfile.address.state);

        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to fetch user profile');
        }
    }, [id, authUser?.employeeId, getUserByEmployeeId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleImageUpload = async (file, employeeId, firstName, lastName) => {
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return null;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size exceeds 2MB limit');
            return null;
        }

        try {
            const fileRef = storageRef(storage, `profile-pics/${employeeId}-${firstName}-${lastName}`);
            const snapshot = await uploadBytes(fileRef, file);
            return await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Failed to upload image');
            return null;
        }
    };

    const handleSubmit = async (values, { setSubmitting, validateForm }) => {
        try {
            const errors = await validateForm(values);
            if (Object.keys(errors).length > 0) {
                const errorMessages = Object.entries(errors)
                    .map(([field, error]) => {
                        const fieldName = field
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase());
                        return `${fieldName}: ${error}`;
                    })
                    .join('\n');

                toast.error(errorMessages);
                return;
            }

            setSubmitting(true);

            // Clean and prepare values for submission
            const finalValues = {
                ...values,
                address: {
                    ...values.address,
                    pinCode: values.address.pinCode ? parseInt(values.address.pinCode, 10) : null
                },
                dateOfBirth: values.dateOfBirth || null,
                age: values.age ? parseInt(values.age, 10) : null,
                updatedBy: `${authUser?.role || 'Unknown'} ${authUser?.firstName || ''} ${authUser?.lastName || ''} ${authUser?.employeeId || 'Unknown'}`.trim()
            };

            if (values.newProfilePic) {
                const imageUrl = await handleImageUpload(
                    values.newProfilePic,
                    values.employeeId,
                    values.firstName,
                    values.lastName
                );
                if (imageUrl) finalValues.profilePic = imageUrl;
            }

            // Remove temporary form fields
            delete finalValues.newProfilePic;
            delete finalValues.previewUrl;

            await editUser(finalValues.employeeId, finalValues);
            await fetchProfile();
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-lg font-medium text-gray-700">Loading...</div>
            </div>
        );
    }

    return (
        <div className="mx-auto mt-8 max-w-4xl rounded-lg bg-white p-8 shadow-lg">
            <Formik
                initialValues={initialValues}
                validationSchema={userProfileValidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ values, isSubmitting, setFieldValue, touched, errors }) => (
                    <Form className="space-y-6" noValidate>
                        <ProfileHeader
                            values={values}
                            isEditing={isEditing}
                        />

                        <PersonalInfoSection
                            values={values}
                            isEditing={isEditing}
                            setFieldValue={setFieldValue}
                            GENDER_OPTIONS={GENDER_OPTIONS}
                            ROLE_OPTIONS={ROLE_OPTIONS}
                            touched={touched}
                            errors={errors}
                        />

                        <AddressSection
                            isEditing={isEditing}
                            selectedCountry={selectedCountry}
                            selectedState={selectedState}
                            setSelectedCountry={setSelectedCountry}
                            setSelectedState={setSelectedState}
                            setFieldValue={setFieldValue}
                            values={values}
                            touched={touched}
                            errors={errors}
                        />

                        <div className="space-y-2">
                            <FormField
                                name="userDescription"
                                label="User Description"
                                as="textarea"
                                rows="4"
                                readOnly={!isEditing}
                                touched={touched.userDescription}
                                error={errors.userDescription}
                            />
                        </div>

                        {isEditing && (
                            <div className="space-y-2">
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
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        <ActionButtons
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            isSubmitting={isSubmitting}
                            navigate={navigate}
                        />

                        <AdditionalInfo values={values} />
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default UserProfile;