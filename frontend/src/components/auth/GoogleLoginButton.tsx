import React from 'react';
import { Button } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { oauthService } from '../../services/oauth';
import { useNavigate } from 'react-router-dom';

export const GoogleLoginButton: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await oauthService.signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <Button
      variant="outlined"
      fullWidth
      startIcon={<GoogleIcon />}
      onClick={handleGoogleLogin}
      sx={{
        mt: 2,
        mb: 2,
        color: 'text.primary',
        borderColor: 'text.primary',
        '&:hover': {
          borderColor: 'primary.main',
          color: 'primary.main',
        },
      }}
    >
      התחבר עם Google
    </Button>
  );
}; 