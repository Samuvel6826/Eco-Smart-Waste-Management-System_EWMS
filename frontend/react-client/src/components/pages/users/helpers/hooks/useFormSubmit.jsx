// src/components/users/create/hooks/useFormSubmit.js
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import { handleImageUpload } from '../utils/userUtils';
import { storage, storageRef, uploadBytes, getDownloadURL } from '../../../../../../firebase.config';

export const useFormSubmit = (createUser, navigate) => {
    return async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            const requiredFields = ['email', 'password', 'firstName', 'lastName'];
            const missingFields = requiredFields.filter(field => !values[field]);

            if (missingFields.length) {
                const errors = missingFields.reduce((acc, field) => ({
                    ...acc,
                    [field]: 'This field is required'
                }), {});
                setErrors(errors);
                toast.error(`Missing required fields: ${missingFields.join(', ')}`);
                return;
            }

            const finalValues = {
                ...values,
                dateOfBirth: values.dateOfBirth
                    ? dayjs(values.dateOfBirth).format('YYYY-MM-DD')
                    : ''
            };

            delete finalValues.newProfilePic;
            delete finalValues.previewUrl;

            if (values.newProfilePic) {
                const imageUrl = await handleImageUpload(
                    values.newProfilePic,
                    values.employeeId,
                    values.firstName,
                    values.lastName,
                    storage,
                    storageRef,
                    uploadBytes,
                    getDownloadURL,
                    toast
                );
                if (imageUrl) finalValues.profilePic = imageUrl;
            }

            await createUser(finalValues);
            toast.success('User created successfully!');
            resetForm();
            navigate('/dashboard');

        } catch (error) {
            console.error('Error in form submission:', error);
            const errorMessage = error.message?.toLowerCase();
            if (errorMessage?.includes('email')) {
                setErrors({ email: 'This email is already registered' });
                toast.error('This email is already registered');
            } else {
                toast.error(error.message || 'Failed to create user. Please try again.');
                setErrors({ submit: error.message || 'Failed to create user' });
            }
        } finally {
            setSubmitting(false);
        }
    };
};