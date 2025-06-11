import { extendTheme } from '@chakra-ui/react';

// Custom theme for the Empire Builder game
export const theme = extendTheme({
  colors: {
    brand: {
      50: '#f8f5e6',
      100: '#e8e0c1',
      200: '#d9c99b',
      300: '#c9b375',
      400: '#ba9c50',
      500: '#a18336',
      600: '#7d6629',
      700: '#5a491d',
      800: '#362c11',
      900: '#120f05',
    },
    stone: {
      50: '#f5f5f0',
      100: '#e0dcd0',
      200: '#cbc4b0',
      300: '#b6ac90',
      400: '#a19470',
      500: '#877a56',
      600: '#695f43',
      700: '#4b4430',
      800: '#2d291c',
      900: '#0f0e09',
    },
  },
  fonts: {
    heading: '"Cinzel", serif',
    body: '"Crimson Text", serif',
  },
  styles: {
    global: () => ({
      'html, body': {
        bg: 'url("/assets/images/parchment-bg.jpg")',
        bgSize: 'cover',
        bgAttachment: 'fixed',
        color: 'gray.800',
        minHeight: '100vh',
      },
      '::selection': {
        bg: 'brand.500',
        color: 'white',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'none',
        textTransform: 'uppercase',
        letterSpacing: 'wider',
        transition: 'all 0.2s',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
      },
      variants: {
        solid: {
          bg: 'brand.600',
          color: 'white',
          border: '2px solid',
          borderColor: 'brand.700',
          _hover: {
            bg: 'brand.700',
          },
        },
        outline: {
          border: '2px solid',
          borderColor: 'brand.600',
          color: 'brand.700',
          _hover: {
            bg: 'brand.50',
          },
        },
        ghost: {
          color: 'brand.700',
          _hover: {
            bg: 'rgba(161, 131, 80, 0.1)',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
  },
});

export default theme;
