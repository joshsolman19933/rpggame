import { ChakraProvider, Box, useColorModeValue } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Theme and context
import { theme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Header from './components/layout/Header';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DocumentationPage = lazy(() => import('./pages/DocumentationPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DashboardHome = lazy(() => import('./pages/Dashboard/DashboardHome'));
const ResearchPage = lazy(() => import('./pages/Dashboard/ResearchPage'));
const MapPage = lazy(() => import('./pages/Dashboard/MapPage'));

// Lazy loaded components
const LazyVillageView = lazy(() => import('./game/village/VillageView'));
const LazyAdminPage = lazy(() => import('./pages/AdminPage'));

// Create a client for React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Védett útvonal komponens
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
              <Routes>
                <Route path="/dashboard/*" element={null} />
                <Route path="*" element={<Header />} />
              </Routes>
              <Box as="main" pt={{ base: '60px', md: '70px' }}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/docs" element={<DocumentationPage />} />
                    
                    {/* Protected routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<DashboardHome />} />
                      <Route path="research" element={<ResearchPage />} />
                      <Route path="map" element={<MapPage />} />
                    </Route>

                    <Route
                      path="/village"
                      element={
                        <ProtectedRoute>
                          <LazyVillageView />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <LazyAdminPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 - Not Found */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
