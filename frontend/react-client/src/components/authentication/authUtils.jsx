// authUtils.js

import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Decodes JWT token
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Token decoding error: ", error);
        return null;
    }
};

/**
 * Checks if JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
    return decoded.exp < currentTime;
};

/**
 * Gets formatted date and time in Indian timezone
 * @returns {string} Formatted date time string like "23 MAR 2024, 02:30:45 PM"
 */
export const getFormattedDateNTime = () => {
    return dayjs()
        .tz('Asia/Kolkata')
        .format('DD MMM YYYY, hh:mm:ss A')
        .toUpperCase();
};

/**
 * Gets user details from session storage
 * @returns {Object|null} User object if found in session, null otherwise
 */
export const getUserFromSession = () => {
    try {
        const userStr = sessionStorage.getItem('user');
        if (!userStr) return null;

        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error getting user from session:', error);
        return null;
    }
};

/**
 * Checks if user is currently logged in
 * @returns {boolean} True if both token and user exist in session and token is not expired
 */
export const isLoggedIn = () => {
    const token = sessionStorage.getItem('token');
    const user = getUserFromSession();

    if (!token || !user) return false;
    return !isTokenExpired(token);
};

/**
 * Gets the authentication token from session storage
 * @returns {string|null} Auth token if exists, null otherwise
 */
export const getAuthToken = () => {
    return sessionStorage.getItem('token');
};

/**
 * Validates token and returns decoded user data
 * @returns {Object|null} Decoded user data if token is valid, null otherwise
 */
export const validateToken = () => {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) {
        return null;
    }
    return decodeToken(token);
};

/**
 * Sets authentication token and axios default header
 * @param {string} token - JWT token to set
 */
export const setAuthToken = (token) => {
    if (token) {
        sessionStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        sessionStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    }
};