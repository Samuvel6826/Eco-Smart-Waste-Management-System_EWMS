import { Navigate } from "react-router-dom";
import { useUserAuth } from "../../contexts/UserAuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading, error } = useUserAuth();

    // Debugging: Check the user object
    // console.log("Check user in ProtectedRoute: ", user);

    // If loading, show a loading indicator
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="spinner-border inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-blue-600" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    // If there is an error, display an error message or redirect accordingly
    if (error) {
        return <Navigate to="/error" />; // Change this to show an error message if needed
    }

    // If user is not authenticated, redirect to the login page
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Render children if user is authenticated
    return children;
};

export default ProtectedRoute;