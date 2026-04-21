export const designTokens = {
  colors: {
    background: '#08121a',
    sidebar: '#0a1822',
    surface: 'rgba(0, 191, 255, 0.04)',
    surfaceBorder: 'rgba(0, 191, 255, 0.25)',
    accent: '#00BFFF',
    accentHover: '#87CEEB',
    textPrimary: '#ffffff',
    textSecondary: '#d1d1d1',
    danger: '#ff5252',
    success: '#25D366',
  },

  button: {
    borderRadius: {
      sm: '10px',
      md: '15px',
      lg: '20px',
    },
    padding: {
      sm: '0.75rem 0.75rem',
      md: '1rem 1.5rem',
      lg: '1.25rem 2rem',
    },
    fontSize: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    },
    variants: {
      primary: {
        background: '#00BFFF',
        color: '#000000',
        shadow: '0 0 15px rgba(0, 191, 255, 0.3)',
        shadowHover: '0 0 20px rgba(0, 191, 255, 0.5)',
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(0, 191, 255, 0.25)',
        color: '#ffffff',
        shadow: 'none',
        shadowHover: 'none',
      },
      glass: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(0, 191, 255, 0.25)',
        color: '#ffffff',
        backdrop: 'blur(20px)',
        shadow: 'none',
        shadowHover: 'none',
      },
      danger: {
        background: '#ff5252',
        color: '#ffffff',
        shadow: '0 0 15px rgba(255, 82, 82, 0.3)',
        shadowHover: '0 0 20px rgba(255, 82, 82, 0.5)',
      },
      success: {
        background: '#25D366',
        color: '#000000',
        shadow: '0 0 15px rgba(37, 211, 102, 0.3)',
        shadowHover: '0 0 20px rgba(37, 211, 102, 0.5)',
      },
      ghost: {
        background: 'transparent',
        color: '#d1d1d1',
        shadow: 'none',
        shadowHover: 'none',
      },
    },
  },
} as const;
