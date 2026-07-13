import { createTheme, alpha, type Shadows, type ThemeOptions } from '@mui/material/styles';
import { ClientConfig } from '@/common/hooks/useClientConfig';
import theme from './theme';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      purple: string;
      emerald: string;
      whatsapp: string;
    }
  }
  interface PaletteOptions {
    custom?: {
      purple: string;
      emerald: string;
      whatsapp: string;
    }
  }
}

/**
 * Crea un tema MUI dinamico basato sulla ClientConfig
 * Se la config non è disponibile, usa i valori di default (theme.ts)
 */
export function createDynamicTheme(clientConfig?: ClientConfig) {
  // Colori da ClientConfig o default
  const primaryColor = clientConfig?.primaryColor || '#00bfff';
  const secondaryColor = clientConfig?.secondaryColor || '#1a2332';

  // Funzione helper per generare rgba da hex
  const hexToRgba = (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const darkPalette = {
    primary: {
      main: primaryColor,
      light: hexToRgba(primaryColor, 0.8), // più chiaro
      dark: hexToRgba(primaryColor, 0.6), // più scuro
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryColor,
      light: hexToRgba(secondaryColor, 0.8),
      dark: hexToRgba(secondaryColor, 0.6),
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#66bb6a',
      dark: '#388e3c',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f44336',
      light: '#ef5350',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0d1a28',
      paper: '#1a2332',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: 'rgba(176, 176, 176, 0.5)',
    },
    custom: {
      purple: '#9155FD',
      emerald: '#10B981',
      whatsapp: '#25D366',
    },
    divider: hexToRgba(primaryColor, 0.12),
    action: {
      active: primaryColor,
      hover: hexToRgba(primaryColor, 0.08),
      selected: hexToRgba(primaryColor, 0.16),
      disabled: 'rgba(176, 176, 176, 0.38)',
      disabledBackground: 'rgba(176, 176, 176, 0.12)',
    },
  };

  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'dark',
      ...darkPalette,
    },
    typography: {
      fontFamily: [
        'Outfit',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.125rem',
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: '0',
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '0',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 700,
        lineHeight: 1.25,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 700,
        lineHeight: 1.3,
      },
      h5: {
        fontSize: '1.0625rem',
        fontWeight: 600,
        lineHeight: 1.35,
      },
      h6: {
        fontSize: '0.9375rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '0.9375rem',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0',
      },
      body2: {
        fontSize: '0.8125rem',
        fontWeight: 400,
        lineHeight: 1.45,
        letterSpacing: '0',
      },
      button: {
        fontSize: '0.8125rem',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0',
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.6875rem',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0',
      },
      overline: {
        fontSize: '0.6875rem',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 8,
    },
    components: {
      ...theme.components,
      MuiButton: {
        defaultProps: {
          disableElevation: false,
        },
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 16px',
            fontSize: '0.8125rem',
            minHeight: 38,
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0px)',
            },
          },
          contained: {
            backgroundColor: primaryColor,
            color: '#0a1a26',
            '&:hover': {
              backgroundColor: hexToRgba(primaryColor, 0.9),
              boxShadow: `0px 8px 24px ${hexToRgba(primaryColor, 0.3)}`,
            },
            '&:disabled': {
              backgroundColor: 'rgba(176, 176, 176, 0.38)',
              color: 'rgba(176, 176, 176, 0.5)',
            },
          },
          outlined: {
            borderColor: primaryColor,
            color: primaryColor,
            '&:hover': {
              backgroundColor: hexToRgba(primaryColor, 0.08),
              borderColor: hexToRgba(primaryColor, 0.9),
            },
            '&:disabled': {
              borderColor: 'rgba(176, 176, 176, 0.38)',
              color: 'rgba(176, 176, 176, 0.5)',
            },
          },
          text: {
            color: primaryColor,
            '&:hover': {
              backgroundColor: hexToRgba(primaryColor, 0.08),
            },
            '&:disabled': {
              color: 'rgba(176, 176, 176, 0.5)',
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            '&.Mui-focused': {
              color: primaryColor,
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            '&.Mui-checked': {
              color: primaryColor,
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            '&.Mui-checked': {
              color: primaryColor,
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: primaryColor,
              '& + .MuiSwitch-track': {
                backgroundColor: hexToRgba(primaryColor, 0.3),
              },
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            color: primaryColor,
          },
          track: {
            backgroundColor: primaryColor,
          },
          rail: {
            backgroundColor: hexToRgba(primaryColor, 0.12),
          },
          thumb: {
            backgroundColor: primaryColor,
            boxShadow: `0px 2px 8px ${hexToRgba(primaryColor, 0.3)}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: hexToRgba(secondaryColor, 0.35),
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 12,
            border: `1px solid ${hexToRgba(primaryColor, 0.15)}`,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: `0 8px 32px 0 ${hexToRgba(primaryColor, 0.12)}`,
              borderColor: hexToRgba(primaryColor, 0.4),
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            border: `1px solid ${hexToRgba(primaryColor, 0.2)}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            boxShadow: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& th': {
              color: primaryColor,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            color: primaryColor,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: primaryColor,
            },
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            '& .MuiPaginationItem-root': {
              '&.Mui-selected': {
                backgroundColor: primaryColor,
                '&:hover': {
                  backgroundColor: hexToRgba(primaryColor, 0.8),
                },
              },
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}
