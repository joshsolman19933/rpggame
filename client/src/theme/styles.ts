import { StyleConfig, defineStyle, defineStyleConfig } from '@chakra-ui/react';

// Közös kártya stílus
export const cardStyle = {
  bg: 'gray.800',
  borderRadius: 'lg',
  p: 6,
  boxShadow: 'lg',
  border: '1px solid',
  borderColor: 'gray.700',
  _hover: {
    transform: 'translateY(-2px)',
    boxShadow: 'xl',
  },
  transition: 'all 0.2s',
};

// Központosított tartalom stílusa
export const centeredContent = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  p: 6,
};

// Erőforrás megjelenítő stílus
export const resourceStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  px: 3,
  py: 2,
  borderRadius: 'full',
  bg: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  _hover: { bg: 'rgba(255, 255, 255, 0.1)' },
  transition: 'all 0.2s',
};

// Gomb stílusok
export const buttonStyles = {
  baseStyle: {
    fontWeight: 'bold',
    borderRadius: 'full',
    _focus: {
      boxShadow: 'none',
    },
  },
  variants: {
    solid: {
      bg: 'blue.500',
      color: 'white',
      _hover: {
        bg: 'blue.600',
        _disabled: {
          bg: 'blue.500',
        },
      },
    },
    outline: {
      border: '2px solid',
      borderColor: 'currentColor',
      _hover: {
        bg: 'whiteAlpha.100',
      },
    },
  },
};

// Kártya komponens testreszabása
export const cardTheme = defineStyleConfig({
  baseStyle: {
    container: {
      ...cardStyle,
    },
    header: {
      pb: 2,
      mb: 4,
      borderBottom: '1px solid',
      borderColor: 'gray.700',
    },
    body: {
      py: 2,
    },
    footer: {
      pt: 4,
      mt: 4,
      borderTop: '1px solid',
      borderColor: 'gray.700',
    },
  },
});

export const buttonTheme = defineStyleConfig(buttonStyles);
