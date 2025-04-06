import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { CssBaseline, PaletteMode } from '@mui/material';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Type definitions
type ThemeContextType = {
  mode: PaletteMode;
  toggleTheme: () => void;
  setMode: (mode: PaletteMode) => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

// Create context with default values
export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
});

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Check if there's a saved theme preference in localStorage
  const getSavedTheme = (): PaletteMode => {
    const savedTheme = localStorage.getItem('themeMode');
    return (savedTheme as PaletteMode) || 'light';
  };

  const [mode, setMode] = useState<PaletteMode>(getSavedTheme);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create theme based on current mode
  const theme = responsiveFontSizes(
    createTheme({
      direction: 'rtl',
      palette: {
        mode,
        primary: {
          main: '#25D366',
          dark: '#128C7E',
          light: '#4AE388',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#34B7F1',
          dark: '#0F8ABF',
          light: '#69D2FF',
          contrastText: '#FFFFFF',
        },
        background: {
          default: mode === 'light' ? '#F5F5F5' : '#121212',
          paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
        },
        error: {
          main: '#E53935',
        },
        warning: {
          main: '#FFA726',
        },
        info: {
          main: '#29B6F6',
        },
        success: {
          main: '#66BB6A',
        },
        text: {
          primary: mode === 'light' ? '#333333' : '#E0E0E0',
          secondary: mode === 'light' ? '#666666' : '#A0A0A0',
        },
      },
      typography: {
        fontFamily: '"Heebo", "Roboto", "Arial", sans-serif',
        fontSize: 14,
        h1: {
          fontWeight: 700,
          fontSize: '2.5rem',
        },
        h2: {
          fontWeight: 600,
          fontSize: '2rem',
        },
        h3: {
          fontWeight: 600,
          fontSize: '1.75rem',
        },
        h4: {
          fontWeight: 600,
          fontSize: '1.5rem',
        },
        h5: {
          fontWeight: 600,
          fontSize: '1.25rem',
        },
        h6: {
          fontWeight: 600,
          fontSize: '1rem',
        },
        subtitle1: {
          fontSize: '1rem',
          fontWeight: 500,
        },
        subtitle2: {
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        body1: {
          fontSize: '1rem',
        },
        body2: {
          fontSize: '0.875rem',
        },
        button: {
          fontWeight: 500,
          textTransform: 'none',
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'light' 
                ? '0 2px 8px rgba(0,0,0,0.08)' 
                : '0 2px 8px rgba(0,0,0,0.2)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontWeight: 500,
            },
            contained: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
            elevation1: {
              boxShadow: mode === 'light' 
                ? '0px 2px 10px rgba(0,0,0,0.05)' 
                : '0px 2px 10px rgba(0,0,0,0.2)',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'light' 
                ? '0 4px 12px rgba(0,0,0,0.05)' 
                : '0 4px 12px rgba(0,0,0,0.2)',
              borderRadius: 12,
              overflow: 'hidden',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: '16px',
              borderBottom: mode === 'light' 
                ? '1px solid rgba(0,0,0,0.1)' 
                : '1px solid rgba(255,255,255,0.1)',
            },
            head: {
              fontWeight: 600,
              backgroundColor: mode === 'light' 
                ? 'rgba(0,0,0,0.02)' 
                : 'rgba(255,255,255,0.02)',
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: mode === 'light' 
                  ? 'rgba(0,0,0,0.03)' 
                  : 'rgba(255,255,255,0.03)',
              },
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
              borderRight: mode === 'light' 
                ? '1px solid rgba(0,0,0,0.08)' 
                : '1px solid rgba(255,255,255,0.08)',
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'light' 
                ? 'rgba(0,0,0,0.08)' 
                : 'rgba(255,255,255,0.08)',
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              '&.Mui-selected': {
                backgroundColor: mode === 'light' 
                  ? 'rgba(37, 211, 102, 0.1)' 
                  : 'rgba(37, 211, 102, 0.2)',
                color: '#25D366',
              },
            },
          },
        },
      },
    })
  );

  // Provide theme context and MUI theme provider
  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setMode }}>
      <CacheProvider value={cacheRtl}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 