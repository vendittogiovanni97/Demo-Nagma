import { createTheme, type Shadows, type ThemeOptions } from '@mui/material/styles';

const darkPalette = {
  primary: {
    main: '#00bfff',
    light: '#33d4ff',
    dark: '#0095cc',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#1a2332',
    light: '#2a3545',
    dark: '#0f1620',
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
    default: '#0a1a26',
    paper: '#1a2332',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
    disabled: 'rgba(176, 176, 176, 0.5)',
  },
  divider: 'rgba(0, 191, 255, 0.12)',
  action: {
    active: '#00bfff',
    hover: 'rgba(0, 191, 255, 0.08)',
    selected: 'rgba(0, 191, 255, 0.16)',
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
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.15)',
    '0px 8px 16px rgba(0, 0, 0, 0.2)',
    '0px 12px 24px rgba(0, 0, 0, 0.25)',
    '0px 16px 32px rgba(0, 0, 0, 0.3)',
    '0px 20px 40px rgba(0, 0, 0, 0.35)',
    '0px 24px 48px rgba(0, 0, 0, 0.4)',
    '0px 28px 56px rgba(0, 0, 0, 0.45)',
    '0px 32px 64px rgba(0, 0, 0, 0.5)',
    '0px 4px 6px rgba(0, 191, 255, 0.1)',
    '0px 8px 12px rgba(0, 191, 255, 0.12)',
    '0px 12px 16px rgba(0, 191, 255, 0.14)',
    '0px 16px 24px rgba(0, 191, 255, 0.16)',
    '0px 20px 32px rgba(0, 191, 255, 0.18)',
    '0px 24px 40px rgba(0, 191, 255, 0.2)',
    '0px 28px 48px rgba(0, 191, 255, 0.22)',
    '0px 32px 56px rgba(0, 191, 255, 0.24)',
    '0px 36px 64px rgba(0, 191, 255, 0.26)',
    '0px 40px 72px rgba(0, 191, 255, 0.28)',
    '0px 44px 80px rgba(0, 191, 255, 0.3)',
    '0px 48px 88px rgba(0, 191, 255, 0.32)',
    '0px 52px 96px rgba(0, 191, 255, 0.34)',
    '0px 56px 104px rgba(0, 191, 255, 0.36)',
    '0px 60px 112px rgba(0, 191, 255, 0.38)',
    '0px 64px 120px rgba(0, 191, 255, 0.4)',
    '0px 68px 128px rgba(0, 191, 255, 0.42)',
  ] as unknown as Shadows,
  breakpoints: {
    values: {
      xs: 0,
      sm: 400,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  components: {
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
          backgroundColor: '#00bfff',
          color: '#0a1a26',
          '&:hover': {
            backgroundColor: '#33d4ff',
            boxShadow: '0px 8px 24px rgba(0, 191, 255, 0.3)',
          },
          '&:disabled': {
            backgroundColor: 'rgba(176, 176, 176, 0.38)',
            color: 'rgba(176, 176, 176, 0.5)',
          },
        },
        outlined: {
          borderColor: '#00bfff',
          color: '#00bfff',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.08)',
            borderColor: '#33d4ff',
          },
          '&:disabled': {
            borderColor: 'rgba(176, 176, 176, 0.38)',
            color: 'rgba(176, 176, 176, 0.5)',
          },
        },
        text: {
          color: '#00bfff',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.08)',
          },
          '&:disabled': {
            color: 'rgba(176, 176, 176, 0.5)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            minHeight: 42,
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(0, 191, 255, 0.2)',
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 191, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00bfff',
              borderWidth: 2,
            },
            '&.Mui-error fieldset': {
              borderColor: '#f44336',
            },
          },
          '& .MuiInputBase-input': {
            color: '#ffffff',
            '&::placeholder': {
              color: 'rgba(176, 176, 176, 0.7)',
              opacity: 1,
            },
            '&:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 1000px #1a2332 inset',
              WebkitTextFillColor: '#ffffff',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#ffffff',
          fontSize: '0.875rem',
          '&.Mui-disabled': {
            color: 'rgba(176, 176, 176, 0.5)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a2332',
          borderRadius: 12,
          border: '1px solid rgba(0, 191, 255, 0.2)',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.14)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 6px 18px rgba(0, 191, 255, 0.12)',
            borderColor: 'rgba(0, 191, 255, 0.4)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '18px',
          '&:last-child': {
            paddingBottom: '18px',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '18px 18px 16px',
          borderBottom: '1px solid rgba(0, 191, 255, 0.12)',
        },
        title: {
          fontSize: '1rem',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a2332',
          backgroundImage: 'none',
          transition: 'all 0.3s ease',
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
        },
        elevation3: {
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          height: 28,
          fontSize: '0.6875rem',
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(0, 191, 255, 0.12)',
          color: '#00bfff',
        },
        outlined: {
          borderColor: 'rgba(0, 191, 255, 0.2)',
          color: '#b0b0b0',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          borderRadius: '8px',
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.1)',
          },
          '&:active': {
            backgroundColor: 'rgba(0, 191, 255, 0.2)',
          },
          '&.Mui-disabled': {
            color: 'rgba(176, 176, 176, 0.5)',
          },
        },
        colorPrimary: {
          color: '#00bfff',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.15)',
          },
          '&:active': {
            backgroundColor: 'rgba(0, 191, 255, 0.25)',
          },
        },
        colorError: {
          color: '#f44336',
          '&:hover': {
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
          },
          '&:active': {
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a2332',
          border: '1px solid rgba(0, 191, 255, 0.2)',
          borderRadius: 12,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          fontWeight: 600,
          borderBottom: '1px solid rgba(0, 191, 255, 0.12)',
          padding: '18px 20px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '18px 20px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '14px 20px',
          borderTop: '1px solid rgba(0, 191, 255, 0.12)',
          gap: '10px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 4,
          borderRadius: 4,
          backgroundColor: 'rgba(0, 191, 255, 0.12)',
        },
        bar: {
          backgroundColor: '#00bfff',
          borderRadius: 4,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        circle: {
          strokeLinecap: 'round',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 191, 255, 0.08)',
          '& th': {
            borderColor: 'rgba(0, 191, 255, 0.12)',
            fontWeight: 600,
            fontSize: '0.75rem',
            color: '#00bfff',
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& tr': {
            transition: 'all 0.2s ease',
            borderColor: 'rgba(0, 191, 255, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(0, 191, 255, 0.05)',
            },
          },
          '& td': {
            borderColor: 'rgba(0, 191, 255, 0.12)',
            color: '#ffffff',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 14px',
          borderColor: 'rgba(0, 191, 255, 0.12)',
        },
        head: {
          fontWeight: 600,
          fontSize: '0.75rem',
          color: '#00bfff',
        },
        body: {
          color: '#ffffff',
          fontSize: '0.875rem',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a2332',
          border: '1px solid rgba(0, 191, 255, 0.2)',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.3)',
          borderRadius: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 191, 255, 0.12)',
            color: '#00bfff',
            '&:hover': {
              backgroundColor: 'rgba(0, 191, 255, 0.16)',
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 191, 255, 0.12)',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#ffffff',
          fontWeight: 500,
        },
        secondary: {
          color: '#b0b0b0',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          color: '#b0b0b0',
          '&.Mui-error': {
            color: '#f44336',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: '#b0b0b0',
          fontSize: '0.875rem',
          fontWeight: 500,
          '&.Mui-focused': {
            color: '#00bfff',
          },
          '&.Mui-error': {
            color: '#f44336',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          height: 24,
          padding: '9px 12px',
        },
        switchBase: {
          transition: 'all 0.3s ease',
          '&.Mui-checked': {
            color: '#00bfff',
            '& + .MuiSwitch-track': {
              backgroundColor: 'rgba(0, 191, 255, 0.3)',
            },
          },
        },
        track: {
          backgroundColor: 'rgba(176, 176, 176, 0.2)',
          border: 'none',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          color: 'rgba(0, 191, 255, 0.3)',
          '&.Mui-checked': {
            color: '#00bfff',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          color: 'rgba(0, 191, 255, 0.3)',
          '&.Mui-checked': {
            color: '#00bfff',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#00bfff',
          height: 4,
        },
        track: {
          backgroundColor: '#00bfff',
          border: 'none',
        },
        rail: {
          backgroundColor: 'rgba(0, 191, 255, 0.12)',
          border: 'none',
        },
        thumb: {
          backgroundColor: '#00bfff',
          width: 20,
          height: 20,
          boxShadow: '0px 2px 8px rgba(0, 191, 255, 0.3)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.87)',
          color: '#ffffff',
          fontSize: '0.75rem',
          borderRadius: 4,
          padding: '8px 12px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
        },
        arrow: {
          color: 'rgba(0, 0, 0, 0.87)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0a1a26',
          borderBottom: '1px solid rgba(0, 191, 255, 0.12)',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            color: '#b0b0b0',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(0, 191, 255, 0.08)',
              color: '#00bfff',
            },
            '&.Mui-selected': {
              backgroundColor: '#00bfff',
              color: '#0a1a26',
              '&:hover': {
                backgroundColor: '#33d4ff',
              },
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          backgroundColor: 'transparent',
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a2332',
          color: '#ffffff',
          border: '1px solid rgba(0, 191, 255, 0.2)',
          borderRadius: 8,
        },
      },
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;
