import React, { Suspense, lazy, useEffect, useState, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { Box, Skeleton, Flex, IconButton, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Outlet, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

// Lazy load components
const DashboardHeader = lazy(() => import('./components/DashboardHeader'));
const SidePanel = lazy(() => import('./components/SidePanel'));
const ChatPanel = lazy(() => import('./components/ChatPanel'));
const NavigationMenu = lazy(() => import('./components/NavigationMenu'));

// Higher Order Component for Suspense with fallback
const withSuspense = (Component: React.ComponentType) => (props: any) => (
  <Suspense fallback={
    <Flex justify="center" align="center" h="100%" w="100%">
      <Skeleton height="40px" width="100%" />
    </Flex>
  }>
    <Component {...props} />
  </Suspense>
);

// Wrap components with Suspense
const SidePanelWithSuspense = withSuspense(SidePanel);
const ChatPanelWithSuspense = withSuspense(ChatPanel);
const NavigationMenuWithSuspense = withSuspense(NavigationMenu);
const DashboardHeaderWithSuspense = withSuspense(DashboardHeader);

// Error boundary component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error is intentionally not used in production
    // eslint-disable-next-line no-console
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={4} textAlign="center">
          <Box as="span" color="red.500" mb={4} display="block">Hiba történt az alkalmazás betöltése során</Box>
          <Box 
            as="button" 
            bg="red.500" 
            color="white" 
            p={2} 
            borderRadius="md"
            _hover={{ bg: 'red.600' }}
            onClick={() => window.location.reload()}
          >
            Újratöltés
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}

interface DashboardProps {
  children?: React.ReactNode;
}

// Keyframes for subtle animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isOpen: isMobileMenuOpen, onToggle: toggleMobileMenu } = useDisclosure();
  const location = useLocation();
  
  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  }, [location]);

  // Handle scroll for header shadow with throttling
  const handleScroll = useCallback(() => {
    const isScrolled = window.scrollY > 10;
    if (isScrolled !== scrolled) {
      setScrolled(isScrolled);
    }
  }, [scrolled]);
  
  // Close mobile menu when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const navElement = document.querySelector('nav');
    const menuButton = document.querySelector('[aria-label="Toggle menu"]');
    
    if (isMobileMenuOpen && navElement && menuButton) {
      const isClickInside = navElement.contains(target) || menuButton.contains(target);
      if (!isClickInside) {
        toggleMobileMenu();
      }
    }
  }, [isMobileMenuOpen, toggleMobileMenu]);

  // Add event listeners
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleScroll, handleClickOutside]);

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const headerHeight = useBreakpointValue({ base: '60px', md: '70px' });
  const mainContentPadding = useBreakpointValue({ base: 3, md: 6 });
  
  // Dark theme colors with improved contrast
  const bgGradient = 'linear(to-br, #0f0f13 0%, #1a1c23 100%)';

  // Track mount state for animations
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isMobileMenuOpen]);

  // Responsive sidebar state
  const sidebarWidth = useBreakpointValue({ base: '250px', lg: '220px' }) || '250px';

  return (
    <Box 
      minH="100vh" 
      bg={bgGradient}
      color="white"
      position="relative"
      overflowX="hidden"
      display="flex"
      flexDirection="column"
      opacity={isMounted ? 1 : 0}
      transition="opacity 0.3s ease-in-out"
      pt={{ base: '60px', md: '70px' }}
    >
      <ErrorBoundary>
        <Box
          as="header"
          position="fixed"
          top={0}
          left={0}
          right={0}
          height={headerHeight}
          bg="rgba(15, 15, 20, 0.95)"
          backdropFilter="blur(10px)"
          zIndex={20}
          borderBottomWidth="1px"
          borderBottomColor={scrolled ? 'rgba(255,255,255,0.1)' : 'transparent'}
          transition="all 0.3s ease"
          boxShadow={scrolled ? '0 4px 20px rgba(0,0,0,0.2)' : 'none'}
        >
          <DashboardHeaderWithSuspense />
          {isMobile && (
            <IconButton
              aria-label="Toggle menu"
              icon={isMobileMenuOpen ? <FiX /> : <FiMenu />}
              onClick={toggleMobileMenu}
              position="absolute"
              right={4}
              top="50%"
              transform="translateY(-50%)"
              zIndex={21}
              variant="ghost"
              color="white"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            />
          )}
        </Box>
      </ErrorBoundary>
    
      {/* Background Image with Overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgImage="url('/assets/images/dashboard-bg.jpg')"
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgAttachment="fixed"
        zIndex={0}
        _after={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1,
        }}
      />

      {/* Main Content Wrapper */}
      <Box 
        position="relative" 
        zIndex={2}
        flex="1"
        display="flex"
        width="100%"
        overflow="hidden"
        height={{ base: 'auto', md: `calc(100vh - ${headerHeight})` }}
        mt={{ base: headerHeight, md: 0 }}
      >
        {/* Navigation Menu - Left Sidebar */}
        <ErrorBoundary>
          <Box
            as="nav"
            w={{ base: '250px', lg: '220px' }}
            bg="rgba(20, 22, 30, 0.98)"
            borderRightWidth="1px"
            borderRightColor="rgba(255, 255, 255, 0.1)"
            flexShrink={0}
            zIndex={15}
            position={{
              base: 'fixed',
              md: 'relative'
            }}
            left={{
              base: isMobileMenuOpen ? 0 : '-250px',
              md: 0
            }}
            top={{
              base: headerHeight,
              md: 0
            }}
            bottom={0}
            overflowY="auto"
            transition="transform 0.3s ease-in-out, left 0.3s ease-in-out"
            sx={{
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': { 
                bg: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 'full' 
              },
              '&::-webkit-scrollbar-track': { bg: 'transparent' }
            }}
            boxShadow={{
              base: isMobileMenuOpen ? '4px 0 20px rgba(0,0,0,0.3)' : 'none',
              md: 'none'
            }}
          >
            <NavigationMenuWithSuspense />
          </Box>
          {isMobileMenuOpen && (
            <Box
              position="fixed"
              top={headerHeight}
              left={0}
              right={0}
              bottom={0}
              bg="rgba(0,0,0,0.5)"
              zIndex={14}
              onClick={toggleMobileMenu}
              backdropFilter="blur(2px)"
            />
          )}
        </ErrorBoundary>

        {/* Main Content Area */}
        <Box 
          flex="1"
          display="flex"
          position="relative"
          overflow="hidden"
        >
          {/* Main Content - Center */}
          <Box 
            as="main"
            flex="1" 
            minW={0}
            p={mainContentPadding}
            position="relative"
            overflowY="auto"
            zIndex={1}
            sx={{
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { 
                bg: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 'full',
                '&:hover': {
                  bg: 'rgba(255, 255, 255, 0.3)'
                }
              },
              '&::-webkit-scrollbar-track': { bg: 'transparent' },
              scrollBehavior: 'smooth',
              scrollPaddingTop: '20px',
              WebkitOverflowScrolling: 'touch'
            }}
            _focusVisible={{
              outline: '2px solid',
              outlineColor: 'blue.400',
              outlineOffset: '2px',
              borderRadius: 'md'
            }}
          >
            <ErrorBoundary>
              <Box 
                bg="rgba(23, 25, 35, 0.9)" 
                borderRadius="lg" 
                p={{ base: 4, md: 6 }}
                boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                minH={{ base: 'auto', md: 'calc(100vh - 140px)' }}
                animation={`${fadeIn} 0.3s ease-out`}
                position="relative"
                zIndex={1}
                border="1px solid"
                borderColor="whiteAlpha.100"
                transition="all 0.2s ease"
                _hover={{
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
                }}
              >
                {children || <Outlet />}
              </Box>
            </ErrorBoundary>
          </Box>
        </Box>

        {/* Right Sidebar - SidePanel and ChatPanel */}
        <ErrorBoundary>
          <Box
            display="flex"
            flexDirection="column"
            w={{ base: '100%', md: '350px' }}
            flexShrink={0}
            bg="rgba(26, 32, 44, 0.95)"
            borderLeftWidth="1px"
            borderLeftColor="rgba(255, 255, 255, 0.1)"
            overflow="hidden"
            position={{ base: 'fixed', md: 'relative' }}
            bottom={{ base: 0, md: 'auto' }}
            right={{ base: 0, md: 'auto' }}
            top={{ base: 'auto', md: 0 }}
            h={{ base: '400px', md: '100%' }}
            zIndex={10}
            transition="all 0.3s ease"
          >
            {/* SidePanel - Top of right sidebar */}
            <Box 
              flexShrink={0}
              borderBottomWidth="1px"
              borderBottomColor="rgba(255, 255, 255, 0.1)"
              overflowY="auto"
              maxH={{ base: '200px', md: '50%' }}
              sx={{
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { bg: 'rgba(255, 255, 255, 0.2)', borderRadius: 'full' },
                '&::-webkit-scrollbar-track': { bg: 'transparent' }
              }}
            >
              <SidePanelWithSuspense />
            </Box>
            
            {/* ChatPanel - Bottom of right sidebar */}
            <Box 
              flex="1"
              overflowY="auto"
              sx={{
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { bg: 'rgba(255, 255, 255, 0.2)', borderRadius: 'full' },
                '&::-webkit-scrollbar-track': { bg: 'transparent' }
              }}
            >
              <ChatPanelWithSuspense />
            </Box>
          </Box>
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

export default Dashboard;
