import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, useTheme } from '@mui/material';

const AuthLayout: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: theme.palette.background.default,
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 4
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            WhatsApp Bot Manager
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            מערכת ניהול בוטים לוואטסאפ
          </Typography>
        </Box>
        
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 2,
          }}
        >
          <Outlet />
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} WhatsApp Bot Manager. כל הזכויות שמורות.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout; 