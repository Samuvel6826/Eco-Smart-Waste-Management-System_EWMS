// UserAuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { decodeToken, isTokenExpired } from "../components/authentication/authUtils"; // Ensure the path is correct

const UserAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Login function
    const logIn = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_SERVER_HOST_URL}/login`, { email, password });
            const { token } = response.data;

            sessionStorage.setItem("token", token);

            // Decode the token to get user info
            const decodedUser = decodeToken(token);
            setUser(decodedUser); // Set the user in context
            setError(null);
        } catch (error) {
            console.error("Login error: ", error.response?.data?.message || error.message);
            setError(error.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logOut = () => {
        sessionStorage.removeItem("token");
        setUser(null); // Reset user state on logout
        setError(null);
    };

    // Check for token on mount
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (token) {
            if (isTokenExpired(token)) {
                logOut(); // If token is expired, log out
            } else {
                const decodedUser = decodeToken(token);
                setUser(decodedUser); // Set user based on the token
            }
        } else {
            logOut(); // If no token, log out
        }
        setLoading(false); // Stop loading state
    }, []);

    // Memoize the context value to avoid unnecessary re-renders
    const contextValue = useMemo(() => ({
        user,
        setUser,
        logIn,
        logOut,
        loading,
        error,
    }), [user, loading, error]);

    return (
        <UserAuthContext.Provider value={contextValue}>
            {children}
        </UserAuthContext.Provider>
    );
}

// Custom hook to use the UserAuthContext
export const useUserAuth = () => {
    const context = useContext(UserAuthContext);
    if (!context) {
        throw new Error("useUserAuth must be used within a UserAuthContextProvider");
    }
    return context;
};