// src/components/users/create/hooks/useInitialFormValues.js
export const useInitialFormValues = (generateEmployeeId, user) => {
    return {
        employeeId: generateEmployeeId(),
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        phoneNumber: '',
        profilePic: '',
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
        newProfilePic: undefined,
        previewUrl: '',
        createdBy: `${user?.role || 'Unknown'} ${user?.firstName || ''} ${user?.lastName || ''} ${user?.employeeId || 'Unknown'}`
    };
};