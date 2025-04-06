import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@mui/icons-material';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <LockOutlined
          sx={{ fontSize: 100, color: 'warning.main', mb: 4 }}
        />
        
        <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="bold">
          אין לך הרשאות מתאימות
        </Typography>
        
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          אין לך הרשאות מתאימות לצפייה בעמוד זה.
          <br />
          אנא פנה למנהל המערכת אם לדעתך זו טעות.
        </Typography>
        
        <Box sx={{ mt: 6, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
            size="large"
          >
            חזרה לעמוד הקודם
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
            size="large"
          >
            לדף הבית
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Unauthorized; 