import React, { Suspense, lazy, useEffect } from 'react';
import './styles/App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import PreLoader from './components/common/preloader/PreLoader';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTopButton from './components/common/ScrollTopBtn';
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { BinsProvider } from './contexts/BinsContext'; // Adjust the path as necessary
import { UsersProvider } from './contexts/UsersContext'; // Adjust the path as necessary

// Lazy-load components
const Login = lazy(() => import('./components/authentication/Login'));
const ErrorPage = lazy(() => import('./components/pages/errorHandlers/ErrorPage'));
const NotAuthorized = lazy(() => import('./components/pages/errorHandlers/NotAuthorized'));
const Navbar = lazy(() => import('./components/common/Navbar'));
const Dashboard = lazy(() => import('./components/pages/users/dashboard/Dashboard'));
const CreateUser = lazy(() => import('./components/pages/users/CreateUser'));
const IotAutomationControl = lazy(() => import('./components/pages/iotRemote/IotAutomationControl'));
const UserProfile = lazy(() => import('./components/pages/users/UserProfile')); // Renamed for clarity
const Bins = lazy(() => import('./components/pages/bins/Bins'));
const SupervisorBins = lazy(() => import('./components/pages/bins/SupervisorBins'));
const CreateBin = lazy(() => import('./components/pages/bins/CreateBin'));
const EditBin = lazy(() => import('./components/pages/bins/EditBin'));

function App() {
  // Initialize AOS for animations
  useEffect(() => {
    AOS.init({ duration: 750 });
  }, []);

  // Get the current location
  const location = useLocation();

  return (

    <AuthProvider>
      <UsersProvider>
        <BinsProvider>
          <main id='App'>
            <Suspense fallback={<PreLoader />}>

              {/* Conditionally render Navbar based on the current route */}
              {location.pathname !== '/login' && <Navbar />}

              {/* Scroll To Top Button for better UX */}
              <ScrollToTopButton />

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: { background: '#333', color: '#fff', maxWidth: '500px' }
                }}
              />

              {/* Define routes within ErrorBoundary for error handling */}
              <ErrorBoundary>
                <Routes>
                  {/* Route for the login page */}
                  <Route path='/login' element={<Login />} />
                  <Route path="/error" element={<ErrorPage />} />
                  <Route path="/not-authorized" element={<NotAuthorized />} />

                  {/* Protected Routes */}
                  <Route
                    path='/dashboard'
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Route for creating a new user */}
                  <Route
                    path='/create-user'
                    element={
                      <ProtectedRoute requiredRoles={['Admin']}>
                        <CreateUser />
                      </ProtectedRoute>
                    }
                  />

                  {/* Route for user profile, dynamic ID provided */}
                  <Route
                    path='/user-profile/:id'
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Supervisor']}>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Route for managing bins related to users */}
                  <Route
                    path='/users/bins'
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                        <Bins />
                      </ProtectedRoute>
                    }
                  />

                  {/* Route for managing Supervisor bins related to users */}
                  <Route
                    path='/users/supervisor-bins'
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Supervisor']}>
                        <SupervisorBins />
                      </ProtectedRoute>
                    }
                  />

                  {/* Route for editing a bin, dynamic ID provided */}
                  <Route
                    path='/users/edit-bin/:locationId/:binId'
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                        <EditBin />
                      </ProtectedRoute>
                    }
                  />

                  {/* Route for creating a new bin */}
                  <Route
                    path='/users/create-bin/:locationId'
                    element={
                      <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                        <CreateBin />
                      </ProtectedRoute>
                    }
                  />

                  {/* Default route to navigate to the login page if the provided route is not matched */}
                  <Route path='*' element={<Navigate to='/login' />} />

                  {/* Route for IoT Remote Control */}
                  <Route path='/iot-remote' element={<IotAutomationControl />} />
                </Routes>
              </ErrorBoundary>
            </Suspense>
          </main>
        </BinsProvider>
      </UsersProvider>
    </AuthProvider>

  );
}

export default App;