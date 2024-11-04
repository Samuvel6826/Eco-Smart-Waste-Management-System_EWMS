import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/pages/errorHandlers/ErrorBoundary';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './styles/App.css';

// Components
import PreLoader from './components/common/preloader/PreLoader';
import { Toaster } from 'react-hot-toast';
import ScrollToTopButton from './components/common/ScrollTopBtn';

// Context Providers
import { AuthProvider } from "./components/contexts/AuthContext";
import { BinsProvider } from './components/contexts/BinsContext';
import { UsersProvider } from './components/contexts/UsersContext';

// Lazy-loaded components
const Login = lazy(() => import('./components/authentication/Login'));
const ProtectedRoute = lazy(() => import('./components/authentication/ProtectedRoute'));
const ErrorFallback = lazy(() => import('./components/pages/errorHandlers/ErrorFallback'));
const NotAuthorized = lazy(() => import('./components/pages/errorHandlers/NotAuthorized'));
const Navbar = lazy(() => import('./components/common/Navbar'));
const Dashboard = lazy(() => import('./components/pages/users/dashboard/Dashboard'));
const CreateUser = lazy(() => import('./components/pages/users/createUser/CreateUser'));
const UserProfile = lazy(() => import('./components/pages/users/userProfile/UserProfile'));
const IotAutomationControl = lazy(() => import('./components/pages/iotRemote/IotAutomationControl'));
const Bins = lazy(() => import('./components/pages/bins/Bins'));
const SupervisorBins = lazy(() => import('./components/pages/bins/SupervisorBins'));
const CreateBin = lazy(() => import('./components/pages/bins/CreateBin'));
const BinSettings = lazy(() => import('./components/pages/bins/binSettings/BinSettings'));
const Contact = lazy(() => import('./components/pages/contact/Contact'));

function AppLayout() {
  useEffect(() => {
    AOS.init({ duration: 750, once: true });
  }, []);

  return (
    <>
      <Navbar />
      <ScrollToTopButton />
      <Routes>
        <Route path='/dashboard' element={
          <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path='/create-user' element={
          <ProtectedRoute requiredRoles={['Admin']}>
            <CreateUser />
          </ProtectedRoute>
        } />
        <Route path='/user-profile/:id' element={
          <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Supervisor']}>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path='/users/bins' element={
          <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
            <Bins />
          </ProtectedRoute>
        } />
        <Route path='/users/supervisor-bins' element={
          <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Supervisor']}>
            <SupervisorBins />
          </ProtectedRoute>
        } />
        <Route path='/users/edit-bin/:locationId/:binId' element={
          <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
            <BinSettings />
          </ProtectedRoute>
        } />
        <Route path='/users/create-bin/:locationId' element={
          <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
            <CreateBin />
          </ProtectedRoute>
        } />
        <Route path='/iot-remote' element={
          <ProtectedRoute>
            <IotAutomationControl />
          </ProtectedRoute>
        } />
        <Route path='/contact' element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        } />
        <Route path='*' element={<Navigate to='/dashboard' />} />
      </Routes>
    </>
  );
}

function App() {
  return (

    <Router>
      <AuthProvider>
        <UsersProvider>
          <BinsProvider>
            <ErrorBoundary>
              <main id='App'>
                <Suspense fallback={<PreLoader />}>
                  <Toaster
                    position="top-right"
                    containerStyle={{
                      position: 'fixed',
                      zIndex: 10000,
                    }}
                    toastOptions={{
                      duration: 3000,
                      style: {
                        background: '#333',
                        color: '#fff',
                        maxWidth: '500px',
                      },
                    }}
                  />
                  <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path="/error" element={<ErrorFallback />} />
                    <Route path="/not-authorized" element={<NotAuthorized />} />
                    <Route path="/*" element={<AppLayout />} />
                  </Routes>
                </Suspense>
              </main>
            </ErrorBoundary>
          </BinsProvider>
        </UsersProvider>
      </AuthProvider>
    </Router>

  );
}

export default App;