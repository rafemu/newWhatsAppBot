import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Button } from '@mui/material';
import axios from 'axios';

interface ApiResponse {
  status: string;
  message: string;
}

const ApiTest = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [errorDetails, setErrorDetails] = useState<string>('');

  const testApiConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails('');
      
      // מציג את כתובת ה-API שאנחנו מנסים להתחבר אליה
      const apiUrl = `${import.meta.env.VITE_API_URL}/auth/health`;
      console.log('Attempting to connect to API at:', apiUrl);
      
      // ניסיון להתחבר לנקודת קצה שלא מצריכה אימות
      const response = await axios.get(apiUrl);
      
      console.log('API response:', response.data);
      
      // שמירת התוצאה
      setData(response.data);
      setError(null);
    } catch (err: any) {
      // טיפול בשגיאה מפורט יותר
      console.error('Error connecting to API:', err);
      
      setError('Failed to connect to the backend API');
      
      // שמירת פרטי השגיאה
      if (err.response) {
        // השרת הגיב עם סטטוס קוד ששונה מ-2xx
        setErrorDetails(`Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        // הבקשה נשלחה אך לא התקבלה תשובה
        setErrorDetails('No response received from server. Server might be down or CORS issue.');
      } else {
        // שגיאה בהגדרת הבקשה
        setErrorDetails(`Error message: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ניסיון חיבור אוטומטי בטעינה הראשונה
  useEffect(() => {
    testApiConnection();
  }, []);

  // ניסיון נתיב חלופי במקרה של כישלון
  const tryAlternativeRoute = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails('');
      
      // ניסיון ישיר לכתובת השרת ללא השימוש במשתנה הסביבה
      const altUrl = 'http://localhost:5000/api/auth/health';
      console.log('Trying alternative URL:', altUrl);
      
      const response = await axios.get(altUrl);
      console.log('Alternative route response:', response.data);
      
      setData(response.data);
    } catch (err: any) {
      console.error('Error with alternative route:', err);
      
      if (err.response) {
        setErrorDetails(`Alternative route - Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        setErrorDetails('Alternative route - No response received. Confirm backend is running on port 5000.');
      } else {
        setErrorDetails(`Alternative route - Error: ${err.message}`);
      }
      
      setError('Failed to connect via alternative route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        API Connection Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">
          API URL: {import.meta.env.VITE_API_URL || 'Not set'}
        </Typography>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <>
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
            {errorDetails && (
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                Details: {errorDetails}
              </Typography>
            )}
          </Alert>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="outlined" onClick={testApiConnection}>
              Retry Normal Route
            </Button>
            <Button variant="contained" onClick={tryAlternativeRoute}>
              Try Alternative Route
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Alert severity="success" sx={{ mt: 2 }}>
            Successfully connected to the backend API!
            <Typography variant="body2" sx={{ mt: 1 }}>
              Response: {data?.message}
            </Typography>
          </Alert>
          <Box mt={2}>
            <Button variant="outlined" onClick={testApiConnection}>
              Test Again
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ApiTest; 