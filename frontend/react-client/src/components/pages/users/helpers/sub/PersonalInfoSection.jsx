import React, { useEffect } from 'react';
import { DatePicker } from 'antd';
import PhoneInput from 'react-phone-input-2';
import dayjs from 'dayjs';
import { useFormikContext } from 'formik';
import { toast } from 'react-hot-toast';
import { FormField, CustomErrorMessage } from '../utils/userUtils';

const PersonalInfoSection = ({ values, isEditing, GENDER_OPTIONS, ROLE_OPTIONS }) => {
    const { setFieldValue, errors, touched, submitCount, isSubmitting } = useFormikContext();

    // Show toast message only when form is submitted
    useEffect(() => {
        // Only show on actual form submission (not initial render)
        if (submitCount > 0 && !isSubmitting) {
            const errorFields = Object.keys(errors);
            if (errorFields.length > 0) {
                // Get human-readable field names from errors object
                const missingFields = errorFields.map(field => {
                    const readableField = field
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase());
                    return readableField;
                });

                // Create error message
                const CustomErrorMessage = missingFields.length === 1
                    ? `Please fill in the ${missingFields[0]} field`
                    : `Please fill in the following fields: ${missingFields.join(', ')}`;

                toast.error(CustomErrorMessage);
            }
        }
    }, [submitCount]); // Only depend on submitCount

    const handleDateChange = (date) => {
        try {
            const jsDate = date ? date.toDate() : null;
            setFieldValue('dateOfBirth', jsDate);
            if (jsDate) {
                const age = dayjs().diff(dayjs(jsDate), 'year');
                setFieldValue('age', age);
            }
        } catch (error) {
            toast.error('Please enter a valid date');
        }
    };

    const handlePhoneChange = (phone) => {
        setFieldValue('phoneNumber', phone);
    };

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
                <FormField
                    label="Employee ID"
                    name="employeeId"
                    type="text"
                    required
                    readOnly
                />
            </div>

            <div>
                <FormField
                    label="First Name"
                    name="firstName"
                    type="text"
                    required
                    readOnly={!isEditing}
                />
            </div>

            <div>
                <FormField
                    label="Last Name"
                    name="lastName"
                    type="text"
                    required
                    readOnly={!isEditing}
                />
            </div>

            <div>
                <FormField
                    label="Email"
                    name="email"
                    type="email"
                    required
                    readOnly={!isEditing}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                    <span className="ml-1 text-red-500">*</span>
                </label>
                <DatePicker
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                    value={values.dateOfBirth ? dayjs(values.dateOfBirth) : null}
                    onChange={handleDateChange}
                    disabled={!isEditing}
                    disabledDate={(current) => current && current > dayjs().toDate()}
                />
                <CustomErrorMessage name="dateOfBirth" />
            </div>

            <div>
                <FormField
                    label="Age"
                    name="age"
                    type="number"
                    readOnly
                />
            </div>

            <div>
                <FormField
                    label="Gender"
                    name="gender"
                    as="select"
                    required
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                >
                    <option value="">Select Gender</option>
                    {GENDER_OPTIONS.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                    ))}
                </FormField>
            </div>

            <div>
                <FormField
                    label="Role"
                    name="role"
                    as="select"
                    required
                    disabled={!isEditing}
                >
                    <option value="">Select a role</option>
                    {ROLE_OPTIONS.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </FormField>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                    <span className="ml-1 text-red-500">*</span>
                </label>
                <PhoneInput
                    country="in"
                    value={values.phoneNumber}
                    onChange={handlePhoneChange}
                    inputClass="!w-full"
                    containerClass="mt-1"
                    disabled={!isEditing}
                />
                <CustomErrorMessage name="phoneNumber" />
            </div>

            {values.assignedBinLocations && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Assigned Bin Locations</h3>
                    {values.assignedBinLocations?.length ? (
                        <div className="rounded-lg border p-4 text-sm text-gray-600 shadow-sm">
                            {values.assignedBinLocations.join(', ')}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No bin locations assigned</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PersonalInfoSection;