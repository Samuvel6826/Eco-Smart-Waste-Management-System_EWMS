// validation/userValidation.js
import * as Yup from 'yup';

export const createUserValidationSchema = Yup.object().shape({
    employeeId: Yup.string().required('Employee ID is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
    role: Yup.string().required('Role is required'),
    phoneNumber: Yup.string().matches(/^\+?[0-9\s-]+$/, "Invalid phone number format"),
    dateOfBirth: Yup.date()
        .required('Date of Birth is required')
        .max(new Date(), "Date of Birth cannot be in the future"),
    gender: Yup.string().required('Gender is required'),

    // Define the address as a nested object
    address: Yup.object().shape({
        pinCode: Yup.string().matches(/^[0-9]{6}$/, 'Pin Code must be 6 digits'),
        country: Yup.string(),
        state: Yup.string(),
        city: Yup.string(),
        streetAddress: Yup.string(),
        district: Yup.string()
    }),

});

export const userProfileValidationSchema = Yup.object().shape({
    employeeId: Yup.string().required('Employee ID is required'),
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
    phoneNumber: Yup.string().matches(/^\+?[0-9\s-]+$/, "Invalid phone number format"),
    dateOfBirth: Yup.date()
        .required('Date of Birth is required')
        .max(new Date(), "Date of Birth cannot be in the future"),
    gender: Yup.string().required('Gender is required'),

    // Define the address as a nested object
    address: Yup.object().shape({
        pinCode: Yup.string().matches(/^[0-9]{6}$/, 'Pin Code must be 6 digits'),
        country: Yup.string(),
        state: Yup.string(),
        city: Yup.string(),
        streetAddress: Yup.string(),
        district: Yup.string()
    }),
});