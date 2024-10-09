import React, { Suspense, lazy, useEffect } from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import PreLoader from './components/common/PreLoader';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTopButton from './components/common/ScrollTopBtn';
import ProtectedRoute from "./components/authentication/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { BinsProvider } from './contexts/BinsContext'; // Adjust the path as necessary
import { UsersProvider } from './contexts/UsersContext'; // Adjust the path as necessary

// Lazy-load components
const Login = lazy(() => import('./components/authentication/Login'));
const CreateUser = lazy(() => import('./components/CreateUser'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const EditUser = lazy(() => import('./components/EditUser')); // Renamed for clarity
const Bins = lazy(() => import('./components/Bins'));
const CreateBin = lazy(() => import('./components/CreateBin'));
const EditBin = lazy(() => import('./components/EditBin'));
const ChangePassword = lazy(() => import('./components/ChangePassword'));

function App() {
  // Initialize AOS for animations
  useEffect(() => {
    AOS.init({ duration: 750 });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <UsersProvider>
          <BinsProvider>
            <main id='App'>
              <Suspense fallback={<PreLoader />}>
                {/* Scroll To Top Button for better UX */}
                <ScrollToTopButton />

                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: { background: '#333', color: '#fff' }
                  }}
                />

                {/* Define routes within ErrorBoundary for error handling */}
                <ErrorBoundary>
                  <Routes>
                    {/* Route for the login page */}
                    <Route path='/login' element={<Login />} />

                    {/* Protected Routes */}
                    <Route
                      path='/dashboard'
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Route for creating a new user */}
                    <Route path='/create-user' element={<CreateUser />} />

                    {/* Route for editing a user, dynamic ID provided */}
                    <Route
                      path='/edit-user/:id'
                      element={
                        <ProtectedRoute>
                          <EditUser /> {/* Changed to EditUser */}
                        </ProtectedRoute>
                      }
                    />

                    {/* Route for managing bins related to users */}
                    <Route
                      path='/users/bins'
                      element={
                        <ProtectedRoute>
                          <Bins />
                        </ProtectedRoute>
                      }
                    />

                    {/* Route for editing a bin, dynamic ID provided */}
                    <Route
                      path='/users/edit-bin/:locationId/:binId'
                      element={
                        <ProtectedRoute>
                          <EditBin />
                        </ProtectedRoute>
                      }
                    />

                    {/* Route for creating a new bin */}
                    <Route
                      path='/users/create-bin/:locationId'
                      element={
                        <ProtectedRoute>
                          <CreateBin />
                        </ProtectedRoute>
                      }
                    />

                    {/* Route for changing user password, dynamic ID provided */}
                    <Route
                      path='/users/change-password/:id'
                      element={
                        <ProtectedRoute>
                          <ChangePassword />
                        </ProtectedRoute>
                      }
                    />

                    {/* Default route to navigate to the login page if the provided route is not matched */}
                    <Route path='*' element={<Navigate to='/login' />} />
                  </Routes>
                </ErrorBoundary>
              </Suspense>
            </main>
          </BinsProvider>
        </UsersProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;