import React from 'react';
import { Field, ErrorMessage as FormikErrorMessage } from 'formik';
import { toast } from 'react-hot-toast';

export const getAvatarUrl = (gender, firstName, lastName) => {
    const baseUrl = 'https://avatar.iran.liara.run';
    if (!firstName && !lastName) return `${baseUrl}/public/47`;

    let avatarType = 'username';
    if (gender) {
        avatarType = {
            male: 'public/boy',
            female: 'public/girl'
        }[gender.toLowerCase()] || 'username';
    }

    return firstName || lastName
        ? `${baseUrl}/${avatarType === 'username'
            ? `username?username=${firstName}+${lastName}`
            : `${avatarType}?username=${firstName}+${lastName}`}`
        : `${baseUrl}/${avatarType}`;
};

export const handleImageUpload = async (file, employeeId, firstName, lastName, storage, storageRef, uploadBytes, getDownloadURL, toast) => {
    if (!file || !file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return null;
    }

    if (file.size > 2 * 1024 * 1024) {
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
};

export const CustomErrorMessage = ({ name }) => (
    <Field name={name}>
        {({ form }) => {
            const error = form.errors[name];
            const touched = form.touched[name];
            return touched && error ? (
                <div className="mt-1 flex items-center gap-2">
                    <svg
                        className="h-4 w-4 text-red-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12" y2="16" />
                    </svg>
                    <span className="text-sm text-red-500">{error}</span>
                </div>
            ) : null;
        }}
    </Field>
);

export const FormField = ({
    name,
    label,
    as: Component = 'input',
    readOnly,
    type = 'text',
    required,
    showError = true,
    helperText,
    loading,
    maxLength,
    placeholder,
    error,
    touched,
    ...props
}) => (
    <Field name={name}>
        {({ field, form: { touched, errors, isSubmitting } }) => {
            const isError = touched[name] && errors[name];

            // Ensure the value is never null
            const fieldValue = field.value === null ? '' : field.value;

            const inputProps = {
                ...field,
                ...props,
                value: fieldValue,
                id: name,
                type,
                readOnly,
                disabled: loading || isSubmitting || readOnly,
                maxLength,
                placeholder: placeholder || `Enter ${label}`,
                className: `
                    w-full px-4 py-2 rounded-md border
                    ${isError
                        ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }
                    ${readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                    ${loading || isSubmitting ? 'opacity-70' : ''}
                    outline-none transition duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                `
            };

            return (
                <div className="mb-4">
                    <label
                        htmlFor={name}
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                    </label>

                    <div className="relative">
                        {Component === 'textarea' ? (
                            <textarea {...inputProps} rows={4} value={fieldValue} />
                        ) : Component === 'select' ? (
                            <select {...inputProps}>
                                {props.children}
                            </select>
                        ) : (
                            <input {...inputProps} />
                        )}

                        {loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                            </div>
                        )}
                    </div>

                    {helperText && !isError && (
                        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                    )}

                    {showError && <CustomErrorMessage name={name} />}

                    {Component === 'textarea' && maxLength && (
                        <div className="mt-1 text-right text-xs text-gray-400">
                            {fieldValue?.length || 0}/{maxLength}
                        </div>
                    )}
                </div>
            );
        }}
    </Field>
);

export default FormField;