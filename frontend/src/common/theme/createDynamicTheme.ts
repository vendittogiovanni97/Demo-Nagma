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
export function createDynamicTheme(clientConfig?: ClientConfig, mode: 'light' | 'dark' = 'dark') {
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
      light: hexToRgba(primaryColor, 0.8),
      dark: hexToRgba(primaryColor, 0.6),
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryColor,
      light: hexToRgba(secondaryColor, 0.8),
      dark: hexToRgba(secondaryColor, 0.6),
      contrastText: '#ffffff',
    },
    success: { main: '#34d399', light: '#6ee7b7', dark: '#059669', contrastText: '#064e3b' },
    warning: { main: '#fbbf24', light: '#fde047', dark: '#d97706', contrastText: '#451a03' },
    error: { main: '#f87171', light: '#fca5a5', dark: '#dc2626', contrastText: '#450a0a' },
    info: { main: '#38bdf8', light: '#7dd3fc', dark: '#0284c7', contrastText: '#0c4a6e' },
    background: { default: '#0d1a28', paper: '#1a2332' },
    text: { primary: '#ffffff', secondary: '#b0b0b0', disabled: 'rgba(176, 176, 176, 0.5)' },
    custom: { purple: '#a855f7', emerald: '#34d399', whatsapp: '#25D366' },
    divider: hexToRgba(primaryColor, 0.12),
    action: {
      active: primaryColor,
      hover: hexToRgba(primaryColor, 0.08),
      selected: hexToRgba(primaryColor, 0.16),
      disabled: 'rgba(176, 176, 176, 0.38)',
      disabledBackground: 'rgba(176, 176, 176, 0.12)',
    },
  };

  const lightPalette = {
    primary: {
      main: primaryColor,
      light: hexToRgba(primaryColor, 0.7),
      dark: hexToRgba(primaryColor, 0.9),
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4a5568',
      light: '#718096',
      dark: '#2d3748',
      contrastText: '#ffffff',
    },
    success: { main: '#38a169', light: '#48bb78', dark: '#276749', contrastText: '#ffffff' },
    warning: { main: '#d69e2e', light: '#ecc94b', dark: '#b7791f', contrastText: '#ffffff' },
    error: { main: '#e53e3e', light: '#fc8181', dark: '#c53030', contrastText: '#ffffff' },
    info: { main: '#3182ce', light: '#63b3ed', dark: '#2c5282', contrastText: '#ffffff' },
    background: { default: '#f7fafc', paper: '#ffffff' },
    text: { primary: '#1a202c', secondary: '#4a5568', disabled: 'rgba(74, 85, 104, 0.4)' },
    custom: { purple: '#805ad5', emerald: '#38a169', whatsapp: '#25D366' },
    divider: 'rgba(0, 0, 0, 0.12)',
    action: {
      active: primaryColor,
      hover: hexToRgba(primaryColor, 0.06),
      selected: hexToRgba(primaryColor, 0.12),
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
  };

  const activePalette = mode === 'light' ? lightPalette : darkPalette;

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      ...activePalette,
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
    shape: { borderRadius: 8 },
    components: {
      ...theme.components,

      // ── CssBaseline: sfondo unificato html+body+gradiente ────────────────
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            // Sincronizza le CSS custom properties con la palette dinamica
            '--color-background': activePalette.background.default,
            '--color-surface': mode === 'light'
              ? 'rgba(255, 255, 255, 0.8)'
              : hexToRgba(primaryColor, 0.035),
            '--color-surface-border': mode === 'light'
              ? 'rgba(0, 0, 0, 0.1)'
              : hexToRgba(primaryColor, 0.2),
            '--color-accent': primaryColor,
            '--color-text-primary': activePalette.text.primary,
            '--color-text-secondary': activePalette.text.secondary,
            '--color-glow-1': hexToRgba(primaryColor, mode === 'light' ? 0.06 : 0.08),
            '--color-glow-2': hexToRgba(primaryColor, mode === 'light' ? 0.03 : 0.04),
            '--color-gradient-start': activePalette.background.default,
            '--color-gradient-end': mode === 'light' ? '#e2e8f0' : activePalette.background.paper,
          },
          html: {
            backgroundColor: activePalette.background.default,
            scrollBehavior: 'smooth',
          },
          body: {
            backgroundColor: activePalette.background.default,
            color: activePalette.text.primary,
            overflowX: 'hidden',
          },
          'body::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            backgroundImage: [
              `radial-gradient(circle at top right, ${hexToRgba(primaryColor, mode === 'light' ? 0.06 : 0.08)}, transparent 800px)`,
              `radial-gradient(circle at bottom left, ${hexToRgba(primaryColor, mode === 'light' ? 0.03 : 0.04)}, transparent 800px)`,
              `linear-gradient(180deg, ${activePalette.background.default} 0%, ${mode === 'light' ? '#e2e8f0' : activePalette.background.paper} 100%)`,
            ].join(', '),
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
          },
          '*::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: hexToRgba(primaryColor, mode === 'light' ? 0.25 : 0.35),
            borderRadius: '4px',
            border: 'none',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: hexToRgba(primaryColor, mode === 'light' ? 0.5 : 0.65),
          },
          '*::-webkit-scrollbar-corner': {
            backgroundColor: 'transparent',
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${hexToRgba(primaryColor, mode === 'light' ? 0.25 : 0.35)} transparent`,
          },
        },
      },

      // ── Button ──────────────────────────────────────────────────────────────
      MuiButton: {
        defaultProps: { disableElevation: false },
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 16px',
            fontSize: '0.8125rem',
            minHeight: 38,
            '&:hover': { transform: 'translateY(-1px)' },
            '&:active': { transform: 'translateY(0px)' },
          },
          contained: {
            backgroundColor: primaryColor,
            color: mode === 'light' ? '#ffffff' : '#0a1a26',
            '&:hover': {
              backgroundColor: hexToRgba(primaryColor, 0.85),
              boxShadow: `0px 8px 24px ${hexToRgba(primaryColor, 0.3)}`,
            },
            '&:disabled': {
              backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(176,176,176,0.38)',
              color: mode === 'light' ? 'rgba(0,0,0,0.38)' : 'rgba(176,176,176,0.5)',
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
              borderColor: mode === 'light' ? 'rgba(0,0,0,0.26)' : 'rgba(176,176,176,0.38)',
              color: mode === 'light' ? 'rgba(0,0,0,0.26)' : 'rgba(176,176,176,0.5)',
            },
          },
          text: {
            color: primaryColor,
            '&:hover': { backgroundColor: hexToRgba(primaryColor, 0.08) },
            '&:disabled': {
              color: mode === 'light' ? 'rgba(0,0,0,0.26)' : 'rgba(176,176,176,0.5)',
            },
          },
        },
      },

      // ── Form & Input ────────────────────────────────────────────────────────
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#4a5568' : '#b0b0b0',
            '&.Mui-focused': { color: primaryColor },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#1a202c' : '#ffffff',
            '& input[type="date"], & input[type="time"], & input[type="month"]': {
              color: mode === 'light' ? '#1a202c' : '#ffffff',
              colorScheme: mode === 'light' ? 'light' : 'dark',
            },
            '& ::-webkit-datetime-edit, & ::-webkit-datetime-edit-fields-wrapper, & ::-webkit-datetime-edit-text, & ::-webkit-datetime-edit-month-field, & ::-webkit-datetime-edit-day-field, & ::-webkit-datetime-edit-year-field': {
              color: mode === 'light' ? '#1a202c' : '#ffffff',
            },
          },
          input: {
            '&::placeholder': {
              color: mode === 'light' ? 'rgba(26,32,44,0.6)' : 'rgba(255,255,255,0.4)',
              opacity: 1,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: mode === 'light' ? 'rgba(0,0,0,0.23)' : 'rgba(255,255,255,0.23)',
          },
          root: {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryColor,
            },
          },
        },
      },

      // ── Checkbox / Radio / Switch ────────────────────────────────────────────
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? 'rgba(0,0,0,0.4)' : hexToRgba(primaryColor, 0.4),
            padding: 6,
            borderRadius: 6,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: hexToRgba(primaryColor, 0.12),
              transform: 'scale(1.08)',
            },
            '&.Mui-checked': {
              color: primaryColor,
              filter: `drop-shadow(0 0 6px ${hexToRgba(primaryColor, 0.5)})`,
              '&:hover': {
                backgroundColor: hexToRgba(primaryColor, 0.18),
              },
            },
            '&.Mui-disabled': {
              opacity: 0.4,
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? 'rgba(0,0,0,0.4)' : hexToRgba(primaryColor, 0.4),
            padding: 6,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: hexToRgba(primaryColor, 0.12),
              transform: 'scale(1.08)',
            },
            '&.Mui-checked': {
              color: primaryColor,
              filter: `drop-shadow(0 0 6px ${hexToRgba(primaryColor, 0.5)})`,
              '&:hover': {
                backgroundColor: hexToRgba(primaryColor, 0.18),
              },
            },
            '&.Mui-disabled': {
              opacity: 0.4,
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            padding: 6,
          },
          switchBase: {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: hexToRgba(primaryColor, 0.1),
            },
            '&.Mui-checked': {
              color: primaryColor,
              filter: `drop-shadow(0 0 6px ${hexToRgba(primaryColor, 0.6)})`,
              '& + .MuiSwitch-track': {
                backgroundColor: hexToRgba(primaryColor, 0.5),
                opacity: 0.8,
              },
              '&:hover': {
                backgroundColor: hexToRgba(primaryColor, 0.2),
              },
            },
          },
          track: {
            borderRadius: 12,
            backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.15)',
          },
        },
      },

      // ── Slider ──────────────────────────────────────────────────────────────
      MuiSlider: {
        styleOverrides: {
          root: { color: primaryColor },
          track: { backgroundColor: primaryColor },
          rail: { backgroundColor: hexToRgba(primaryColor, 0.2) },
          thumb: {
            backgroundColor: primaryColor,
            boxShadow: `0px 2px 8px ${hexToRgba(primaryColor, 0.4)}`,
          },
        },
      },

      // ── Card ─────────────────────────────────────────────────────────────────
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light'
              ? 'rgba(255,255,255,0.92)'
              : hexToRgba(secondaryColor, 0.35),
            borderRadius: 12,
            border: mode === 'light'
              ? `1px solid rgba(0,0,0,0.08)`
              : `1px solid ${hexToRgba(primaryColor, 0.15)}`,
            boxShadow: mode === 'light'
              ? '0 2px 12px 0 rgba(0,0,0,0.08)'
              : '0 8px 32px 0 rgba(0,0,0,0.25)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: mode === 'light'
                ? `0 4px 20px 0 ${hexToRgba(primaryColor, 0.15)}`
                : `0 8px 32px 0 ${hexToRgba(primaryColor, 0.12)}`,
              borderColor: mode === 'light'
                ? hexToRgba(primaryColor, 0.3)
                : hexToRgba(primaryColor, 0.4),
            },
          },
        },
      },

      // ── Paper ────────────────────────────────────────────────────────────────
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: mode === 'light' ? '#ffffff' : '#1a2332',
          },
          elevation1: {
            boxShadow: mode === 'light'
              ? '0 1px 4px 0 rgba(0,0,0,0.1)'
              : '0 4px 16px 0 rgba(0,0,0,0.3)',
          },
        },
      },

      // ── Menu / Dropdown ──────────────────────────────────────────────────────
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light'
              ? 'rgba(255, 255, 255, 0.98)'
              : hexToRgba(activePalette.background.paper, 0.96),
            border: `1px solid ${hexToRgba(primaryColor, 0.25)}`,
            borderRadius: 12,
            boxShadow: mode === 'light'
              ? '0 10px 30px rgba(0,0,0,0.1)'
              : `0 16px 40px rgba(0,0,0,0.4), 0 0 20px ${hexToRgba(primaryColor, 0.15)}`,
            padding: 0,
            overflow: 'hidden',
          },
          list: {
            padding: '4px',
            '&::-webkit-scrollbar-track': {
              marginTop: '8px',
              marginBottom: '8px',
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 4px',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.15s ease',
            color: activePalette.text.primary,
            '&:hover': {
              backgroundColor: hexToRgba(primaryColor, 0.15),
              color: primaryColor,
            },
            '&.Mui-selected': {
              backgroundColor: hexToRgba(primaryColor, 0.2),
              color: primaryColor,
              fontWeight: 700,
              '&:hover': {
                backgroundColor: hexToRgba(primaryColor, 0.25),
              },
            },
          },
        },
      },

      // ── Dialog ───────────────────────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1a2332',
            border: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.08)' : hexToRgba(primaryColor, 0.2)}`,
            boxShadow: mode === 'light'
              ? '0 8px 32px rgba(0,0,0,0.12)'
              : '0 8px 32px rgba(0,0,0,0.5)',
          },
        },
      },

      // ── AppBar ───────────────────────────────────────────────────────────────
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            boxShadow: 'none',
          },
        },
      },

      // ── Divider ──────────────────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
          },
        },
      },

      // ── Table ────────────────────────────────────────────────────────────────
      MuiTableHead: {
        styleOverrides: {
          root: { '& th': { color: primaryColor } },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { color: primaryColor },
          root: {
            borderBottomColor: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
            color: mode === 'light' ? '#1a202c' : '#ffffff',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light'
                ? 'rgba(0,0,0,0.02)'
                : 'rgba(255,255,255,0.03)',
            },
          },
        },
      },



      // ── Chip ─────────────────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)',
            color: mode === 'light' ? '#1a202c' : '#ffffff',
          },
          colorPrimary: {
            backgroundColor: hexToRgba(primaryColor, 0.15),
            color: primaryColor,
          },
        },
      },

      // ── Tooltip ──────────────────────────────────────────────────────────────
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light'
              ? 'rgba(15, 23, 42, 0.92)'
              : hexToRgba(activePalette.background.paper, 0.96),
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 8,
            border: `1px solid ${hexToRgba(primaryColor, 0.3)}`,
            boxShadow: mode === 'light'
              ? '0 6px 20px rgba(0,0,0,0.2)'
              : `0 12px 32px rgba(0,0,0,0.4), 0 0 15px ${hexToRgba(primaryColor, 0.2)}`,
            padding: '6px 10px',
          },
          arrow: {
            color: mode === 'light'
              ? 'rgba(15, 23, 42, 0.92)'
              : hexToRgba(activePalette.background.paper, 0.96),
          },
        },
      },

      MuiTablePagination: {
        styleOverrides: {
          root: {
            color: activePalette.text.secondary,
            fontSize: '0.8125rem',
            borderTop: 'none',
            '& .MuiTablePagination-toolbar': {
              minHeight: 44,
              paddingLeft: '12px',
              paddingRight: '12px',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: activePalette.text.secondary,
            },
            '& .MuiTablePagination-select': {
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: primaryColor,
              paddingLeft: '6px',
              paddingRight: '22px !important',
              backgroundColor: 'transparent !important',
              borderRadius: 6,
              '&:focus': {
                backgroundColor: 'transparent !important',
              },
            },
            '& .MuiTablePagination-selectIcon': {
              color: primaryColor,
              right: 0,
            },
            '& .MuiTablePagination-actions': {
              marginLeft: '12px',
              '& .MuiIconButton-root': {
                color: primaryColor,
                borderRadius: 8,
                padding: '6px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: hexToRgba(primaryColor, 0.15),
                  transform: 'scale(1.05)',
                },
                '&.Mui-disabled': {
                  color: activePalette.text.disabled,
                  opacity: 0.3,
                },
              },
            },
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            '& .MuiPaginationItem-root': {
              borderRadius: 8,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: activePalette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: hexToRgba(primaryColor, 0.12),
                color: primaryColor,
              },
              '&.Mui-selected': {
                backgroundColor: primaryColor,
                color: mode === 'light' ? '#ffffff' : '#000000',
                boxShadow: `0 0 12px ${hexToRgba(primaryColor, 0.4)}`,
                fontWeight: 700,
                '&:hover': {
                  backgroundColor: primaryColor,
                },
              },
            },
          },
        },
      },

      // ── Tabs ─────────────────────────────────────────────────────────────────
      MuiTab: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#4a5568' : '#b0b0b0',
            '&.Mui-selected': { color: primaryColor },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { backgroundColor: primaryColor },
        },
      },

      // ── Typography ───────────────────────────────────────────────────────────
      MuiTypography: {
        styleOverrides: {
          root: {
            color: 'inherit',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}
