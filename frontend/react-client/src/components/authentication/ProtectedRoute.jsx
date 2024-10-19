import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PreLoader from '../common/preloader/PreLoader';

const ProtectedRoute = ({ children, requiredRoles }) => {
    const { user, loading, error } = useAuth();

    if (loading) {
        return <PreLoader />;
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

    // Check if the user's role is among the required roles
    if (requiredRoles && !requiredRoles.includes(user.role)) {
        return <Navigate to="/not-authorized" />;  // Redirect to a not-authorized page if role does not match
    }

    // If authenticated and authorized, render the children components
    return children;
};

export default ProtectedRoute;