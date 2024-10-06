// authUtils.jsx
import { jwtDecode } from 'jwt-decode'; // Make sure you have this library installed

export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Token decoding error: ", error);
        return null;
    }
};

export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true; // If there's no expiration time, consider it expired
    const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
    return decoded.exp < currentTime; // Check if token is expired
};