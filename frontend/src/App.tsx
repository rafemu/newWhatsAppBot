import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import ThemeProvider from './contexts/ThemeContext';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

// Loading component for suspense fallback
const LoadingFallback = () => (
  <Box sx={{ 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  }}>
    <CircularProgress color="primary" />
  </Box>
);

function App() {
  return (
    <ChakraProvider>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
}

export default App; 