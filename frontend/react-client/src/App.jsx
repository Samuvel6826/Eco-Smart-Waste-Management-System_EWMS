import React, { Suspense, lazy, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate, Outlet } from 'react-router-dom';
import ErrorBoundary from './components/errorHandlers/ErrorBoundary';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './styles/App.css';

// Keep all your imports the same...
// Components
import PreLoader from './components/common/preloader/PreLoader';
import { Toaster } from 'react-hot-toast';
import ScrollToTopButton from './components/common/ScrollTopBtn';

// Context Providers
import { AuthProvider } from "./components/contexts/providers/AuthProvider";
import { NotificationsProvider } from './components/contexts/providers/NotificationsProvider';
import { ResendEmailsProvider } from './components/contexts/providers/ResendEmailsProvider';
import { BinsProvider } from './components/contexts/providers/BinsProvider';
import { UsersProvider } from './components/contexts/providers/UsersProvider';

// Lazy-loaded components
const Login = lazy(() => import('./components/authentication/Login'));
const ProtectedRoute = lazy(() => import('./components/authentication/ProtectedRoute'));
const ErrorFallback = lazy(() => import('./components/errorHandlers/ErrorFallback'));
const NotAuthorized = lazy(() => import('./components/errorHandlers/NotAuthorized'));
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
const Footer = lazy(() => import('./components/pages/footer/Footer'));

// Root Layout Component remains unchanged
const RootLayout = () => {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <ResendEmailsProvider>
          <UsersProvider>
            <BinsProvider>
              <ErrorBoundary>
                <main id='App'>
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
                  <Suspense fallback={<PreLoader />}>
                    <Outlet />
                  </Suspense>
                </main>
              </ErrorBoundary>
            </BinsProvider>
          </UsersProvider>
        </ResendEmailsProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
};

// Fixed router configuration
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route path='/login' element={<Login />} />
      <Route path="/error" element={<ErrorFallback />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route
        element={
          <>
            <Navbar />
            <ScrollToTopButton />
            <Outlet />
            <Footer />
          </>
        }
      >
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="*" element={<Dashboard />} />
        </Route>

        <Route
          path='/create-user'
          element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <CreateUser />
            </ProtectedRoute>
          }
        />

        <Route
          path='/user-profile/:id'
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Supervisor']}>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route path='/users'>
          <Route
            path="bins"
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                <Bins />
              </ProtectedRoute>
            }
          />
          <Route
            path="supervisor-bins"
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager', 'Supervisor']}>
                <SupervisorBins />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit-bin/:locationId/:binId"
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                <BinSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-bin/:locationId"
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                <CreateBin />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path='/iot-remote'
          element={
            <ProtectedRoute>
              <IotAutomationControl />
            </ProtectedRoute>
          }
        />

        <Route
          path='/contact'
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />

        <Route path='*' element={<Navigate to='/dashboard' />} />
      </Route>
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_normalizeFormMethod: true,
      v7_fetcherPersist: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  useEffect(() => {
    AOS.init({ duration: 750, once: true });
  }, []);

  return <RouterProvider router={router} />;
}

export default App;