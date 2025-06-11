import { extendTheme } from '@chakra-ui/react';
import { cardTheme, buttonTheme } from './styles';

export const theme = extendTheme({
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
        bg: 'gray.900',
        color: 'white',
      },
    },
  },
  components: {
    Card: cardTheme,
    Button: buttonTheme,
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e6f0ff',
      100: '#b3d1ff',
      200: '#80b3ff',
      300: '#4d94ff',
      400: '#1a75ff',
      500: '#005ce6',
      600: '#0048b3',
      700: '#003580',
      800: '#00214d',
      900: '#000d1a',
    },
  },
  fonts: {
    heading: '"Poppins", sans-serif',
    body: '"Inter", sans-serif',
  },
});
