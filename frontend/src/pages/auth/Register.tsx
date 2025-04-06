import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  Container,
  Divider
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeTerms' ? checked : value
    });

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'שם פרטי הוא שדה חובה';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'שם משפחה הוא שדה חובה';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל אינה תקינה';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'סיסמה היא שדה חובה';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'סיסמה חייבת להכיל לפחות 8 תווים';
      isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
      isValid = false;
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'יש לאשר את תנאי השימוש כדי להמשיך';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ביצוע קריאת API להרשמה
      await authService.register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password
      });
      
      setRegisterSuccess(true);
      
      // ניווט אוטומטי לעמוד ההתחברות לאחר הצלחת ההרשמה
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'אירעה שגיאה בהרשמה. אנא נסה שנית מאוחר יותר.';
      setRegisterError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            הרשמה למערכת
          </Typography>
          <Typography variant="body2" color="textSecondary">
            מלאו את הפרטים הבאים כדי ליצור חשבון חדש
          </Typography>
        </Box>

        {registerError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {registerError}
          </Alert>
        )}

        {registerSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ההרשמה הושלמה בהצלחה! מעביר אותך לעמוד ההתחברות...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="שם פרטי"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                disabled={isSubmitting || registerSuccess}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="שם משפחה"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                disabled={isSubmitting || registerSuccess}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="דואר אלקטרוני"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                disabled={isSubmitting || registerSuccess}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="סיסמה"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || 'סיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isSubmitting || registerSuccess}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="אימות סיסמה"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isSubmitting || registerSuccess}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    color="primary"
                    disabled={isSubmitting || registerSuccess}
                  />
                }
                label={
                  <Typography variant="body2">
                    אני מסכים/ה ל
                    <Link component={RouterLink} to="/terms" underline="hover">
                      תנאי השימוש
                    </Link>
                    {' '}ול
                    <Link component={RouterLink} to="/privacy" underline="hover">
                      מדיניות הפרטיות
                    </Link>
                  </Typography>
                }
              />
              {errors.agreeTerms && (
                <Typography variant="caption" color="error">
                  {errors.agreeTerms}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting || registerSuccess}
          >
            {isSubmitting ? 'מבצע הרשמה...' : 'הרשמה'}
          </Button>

          <Divider sx={{ my: 2 }} />

          <Box textAlign="center">
            <Typography variant="body2">
              כבר יש לך חשבון?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                התחברות
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>

      <Box textAlign="center" mt={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          חזרה לדף הבית
        </Button>
      </Box>
    </Container>
  );
};

export default Register; 