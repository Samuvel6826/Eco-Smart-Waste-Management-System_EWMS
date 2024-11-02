// src/components/pages/users/hooks/useInitialFormValues.jsx

import { getFormattedDateNTime } from '../../../../authentication/authUtils';

export const useInitialFormValues = (generateEmployeeId, user) => {
    return {
        employeeId: generateEmployeeId(),
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        phoneNumber: '',
        userDescription: '',
        dateOfBirth: '',
        age: '',
        gender: '',
        address: {
            country: '',
            state: '',
            city: '',
            streetAddress: '',
            pinCode: ''
        },
        profilePic: '',
        newProfilePic: undefined,
        previewUrl: '',
        createdAt: getFormattedDateNTime(),
        createdBy: `${user?.role || 'Unknown'} ${user?.firstName || ''} ${user?.lastName || ''} ${user?.employeeId || 'Unknown'}`
    };
};