import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Snackbar
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Send as SendIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NewChat = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    message: '',
    session: '',
  });
  const [errors, setErrors] = useState({
    phoneNumber: '',
    message: '',
    session: '',
  });

  const sessions = [
    { id: '1', name: 'חשבון ברירת מחדל' },
    { id: '2', name: 'חשבון שיווק' },
    { id: '3', name: 'חשבון תמיכה' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Validate phone number
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'יש להזין מספר טלפון';
      valid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'יש להזין מספר טלפון תקין';
      valid = false;
    }
    
    // Validate message
    if (!formData.message) {
      newErrors.message = 'יש להזין הודעה';
      valid = false;
    }
    
    // Validate session
    if (!formData.session) {
      newErrors.session = 'יש לבחור חשבון וואטסאפ';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        navigate('/chats');
      }, 1500);
    }, 1000);
  };

  const handleBack = () => {
    navigate('/chats');
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            חזור לשיחות
          </Button>
          <Typography variant="h4" component="h1">
            יצירת שיחה חדשה
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.session}>
                  <InputLabel id="session-label">חשבון וואטסאפ</InputLabel>
                  <Select
                    labelId="session-label"
                    id="session"
                    name="session"
                    value={formData.session}
                    onChange={handleChange}
                    label="חשבון וואטסאפ"
                  >
                    {sessions.map(session => (
                      <MenuItem key={session.id} value={session.id}>
                        {session.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.session && <FormHelperText>{errors.session}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="מספר טלפון"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+972501234567"
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  InputProps={{
                    dir: "ltr", // Phone numbers are usually left-to-right
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="הודעה"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="הזן את תוכן ההודעה כאן..."
                  error={!!errors.message}
                  helperText={errors.message}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    startIcon={<SendIcon />}
                    size="large"
                  >
                    {loading ? 'שולח...' : 'שלח הודעה'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          ההודעה נשלחה בהצלחה!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewChat; 