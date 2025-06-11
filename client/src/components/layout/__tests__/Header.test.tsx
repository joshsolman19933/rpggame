import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../../../contexts/AuthContext';
import Header from '../Header';
import theme from '../../../theme';

// Mock the AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../../contexts/AuthContext'),
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    logout: jest.fn(),
  }),
}));

describe('Header Component', () => {
  const renderHeader = (isAuthenticated = false) => {
    return render(
      <ChakraProvider theme={theme}>
        <Router>
          <AuthProvider>
            <Header />
          </AuthProvider>
        </Router>
      </ChakraProvider>
    );
  };

  it('renders the logo and navigation links', () => {
    renderHeader();
    
    // Check if logo is rendered
    expect(screen.getByText('Birodalmi Kalandok')).toBeInTheDocument();
    
    // Check if navigation links are rendered for unauthenticated users
    expect(screen.getByText('Főoldal')).toBeInTheDocument();
    expect(screen.getByText('Dokumentáció')).toBeInTheDocument();
    
    // Check if auth buttons are rendered
    expect(screen.getByText('Bejelentkezés')).toBeInTheDocument();
    expect(screen.getByText('Regisztráció')).toBeInTheDocument();
  });

  it('toggles color mode when the theme toggle button is clicked', () => {
    renderHeader();
    
    const toggleButton = screen.getByLabelText('Toggle color mode');
    fireEvent.click(toggleButton);
    
    // You might need to add more specific assertions based on your theme implementation
    expect(toggleButton).toBeInTheDocument();
  });

  it('shows user menu when user is authenticated', () => {
    // Mock the AuthContext to return an authenticated user
    jest.spyOn(require('../../../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      isAuthenticated: true,
      user: { username: 'TestUser', email: 'test@example.com' },
      logout: jest.fn(),
    }));

    renderHeader(true);
    
    // Check if user menu is rendered
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    
    // Check if notifications button is rendered
    expect(screen.getByLabelText('Értesítések')).toBeInTheDocument();
  });
});
