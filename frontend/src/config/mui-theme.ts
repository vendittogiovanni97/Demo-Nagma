import { createTheme } from "@mui/material/styles";

/**
 * MUI Theme Configuration - Design System Fratello
 * Tema dark con accent cyan #00BFFF
 * Basato su design-tokens.ts
 */

export const muiTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00BFFF",
      light: "#87CEEB",
      dark: "#0099CC",
      contrastText: "#000000",
    },
    secondary: {
      main: "#d1d1d1",
      light: "#ffffff",
      dark: "#a0a0a0",
      contrastText: "#ffffff",
    },
    success: {
      main: "#25D366",
      light: "#52e180",
      dark: "#1a9d4a",
      contrastText: "#000000",
    },
    error: {
      main: "#ff5252",
      light: "#ff7f7f",
      dark: "#cc2828",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#FFC107",
      light: "#FFD54F",
      dark: "#F57F17",
      contrastText: "#000000",
    },
    info: {
      main: "#00BFFF",
      light: "#87CEEB",
      dark: "#0099CC",
      contrastText: "#000000",
    },
    background: {
      default: "#08121a",
      paper: "#0a1822",
    },
    text: {
      primary: "#ffffff",
      secondary: "#d1d1d1",
    },
    divider: "rgba(0, 191, 255, 0.25)",
  },
  typography: {
    fontFamily: '"Outfit", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 700,
      letterSpacing: "-0.3px",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 700,
      letterSpacing: "-0.2px",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.95rem",
      lineHeight: 1.6,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
    caption: {
      fontSize: "0.75rem",
      color: "#d1d1d1",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "12px",
          fontWeight: 600,
          transition: "all 0.3s ease",
          "&:focus-visible": {
            outline: "2px solid #00BFFF",
            outlineOffset: "2px",
          },
        },
        contained: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "16px",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          fontFamily: '"Outfit", sans-serif',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          "&.Mui-checked": {
            color: "#00BFFF",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          "&.Mui-checked": {
            color: "#00BFFF",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase": {
            "&.Mui-checked": {
              color: "#00BFFF",
              "& + .MuiSwitch-track": {
                backgroundColor: "#00BFFF",
              },
            },
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default muiTheme;
