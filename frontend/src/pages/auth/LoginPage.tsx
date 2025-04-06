import React from 'react';
import { Container, Typography, Divider, Box } from '@mui/material';
import { LoginForm } from '../../components/auth/LoginForm';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          התחברות
        </Typography>
        
        <LoginForm />
        
        <Divider sx={{ width: '100%', my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            או
          </Typography>
        </Divider>
        
        <GoogleLoginButton />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            עדיין אין לך חשבון?{' '}
            <Link to="/auth/register" color="primary">
              הירשם כאן
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}; 