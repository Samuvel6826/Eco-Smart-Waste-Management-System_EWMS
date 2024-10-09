import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading, error } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="spinner-border inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-blue-600" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    // If an error occurred during authentication, show error message
    if (error) {
        console.error("Error in authentication: ", error);
        return <Navigate to="/error" />;
    }

    // If user is not authenticated, redirect to the login page
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If authenticated, render the children components
    return children;
};

export default ProtectedRoute;