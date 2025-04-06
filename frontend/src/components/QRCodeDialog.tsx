import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, 
  Button, Typography, Box, Card, CardActions, CardContent, CardHeader,
  TextField, Tabs, Tab, Grid, Chip, CircularProgress, Divider, Avatar, LinearProgress, IconButton, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { RefreshRounded as RefreshIcon, QrCode as QrCodeIcon, Add as AddIcon, Smartphone as SmartphoneIcon, CheckCircle as CheckCircleIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { WhatsAppSession, WhatsAppDevice } from '../types/global';
import { apiService } from '../services/api';
import { useSnackbar } from 'notistack';

interface QRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  session: WhatsAppSession | null;
  onRefresh?: () => void;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ open, onClose, session, onRefresh }) => {
  const [tabValue, setTabValue] = useState(0);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrExpiration, setQrExpiration] = useState<Date | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<WhatsAppDevice | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<WhatsAppDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrTimeoutRef] = useState<React.MutableRefObject<NodeJS.Timeout | null>>(React.useRef(null));
  const [qrUpdateTrigger, setQrUpdateTrigger] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isQRLoading, setIsQRLoading] = useState(false);

  // טעינת מכשירים בעת פתיחת הדיאלוג
  useEffect(() => {
    if (open && session) {
      handleLoadDevices();
    }
  }, [open, session]);

  // טעינת מכשירים מהשרת
  const handleLoadDevices = async () => {
    if (!session || !session.id) {
      console.error('Session ID is undefined');
      enqueueSnackbar('שגיאה: מזהה סשן חסר', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    setDevices([]);
    
    try {
      const response = await apiService.getDevices(session.id);
      setDevices(response.data);
      
      // אם אין מכשירים, נעבור אוטומטית ללשונית "הוסף מכשיר חדש"
      if (response.data.length === 0) {
        setTabValue(1);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
      enqueueSnackbar('שגיאה בטעינת המכשירים', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // פונקציה להוספת מכשיר חדש
  const handleAddDevice = async () => {
    if (!session || !session.id || !newDeviceName.trim()) {
      console.error('Session ID or device name is missing');
      enqueueSnackbar('שגיאה: מזהה סשן או שם מכשיר חסר', { variant: 'error' });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiService.addDevice(session.id, { name: newDeviceName.trim() });
      console.log('Device response:', response);
      
      // וידוא שאנחנו מקבלים את המכשיר החדש מהשרת
      if (!response.data.device || !response.data.device.deviceId) {
        console.error('Response does not contain device data or deviceId', response.data);
        enqueueSnackbar('שגיאה: לא התקבלו נתוני מכשיר מהשרת', { variant: 'error' });
        return;
      }
      
      // עדכון רשימת המכשירים
      await handleLoadDevices();
      
      // איפוס שדות הטופס
      setNewDeviceName('');
      
      // מעבר לטאב של קוד QR והצגתו
      const newDevice = response.data.device;
      
      // וידוא שיש דרך לזהות את המכשיר באופן ייחודי
      if (!ensureValidDeviceId(newDevice)) {
        console.error('Device ID format is invalid:', newDevice);
        enqueueSnackbar('שגיאה: מזהה מכשיר בפורמט לא תקין', { variant: 'error' });
        return;
      }
      
      // שימוש בפונקציה המקורית עם וידוא ה-ID
      setSelectedDevice(newDevice);
      setTabValue(1);
      
      // עדכון קוד QR ישירות מהתשובה אם קיים
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
        if (response.data.device.qrExpiration) {
          setQrExpiration(new Date(response.data.device.qrExpiration));
        }
      } else {
        // טעינת קוד QR אם לא התקבל ישירות
        await handleGetQRCode(newDevice.deviceId);
      }
      
      enqueueSnackbar('המכשיר נוסף בהצלחה', { variant: 'success' });
    } catch (error) {
      console.error('שגיאה בהוספת מכשיר:', error);
      enqueueSnackbar('אירעה שגיאה בהוספת המכשיר', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // פונקציה לבחירת מכשיר ספציפי
  const handleSelectDevice = useCallback(async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setQrCode(null);
    setIsQRLoading(true);
    const device = devices.find(d => d.deviceId === deviceId) || null;
    setSelectedDevice(device);
    
    if (device && device.status !== 'connected' && session?.id) {
      try {
        const response = await apiService.getQRCode(session.id, deviceId);
        setQrCode(response.data.qrCode);
      } catch (error) {
        console.error('Error loading QR code:', error);
        enqueueSnackbar('שגיאה בטעינת קוד הQR', { variant: 'error' });
      } finally {
        setIsQRLoading(false);
      }
    } else {
      setIsQRLoading(false);
    }
  }, [devices, session, enqueueSnackbar]);

  // וידוא שה-deviceId תקין
  const ensureValidDeviceId = (device: WhatsAppDevice): boolean => {
    if (!device || !device.deviceId) {
      return false;
    }
    
    // בדיקה אם ה-deviceId תקין (שהוא מחרוזת לא ריקה)
    if (typeof device.deviceId !== 'string' || device.deviceId.trim() === '') {
      return false;
    }
    
    // החזרת אמת אם ה-deviceId תקין
    return true;
  };

  // פונקציה להסרת מכשיר
  const handleRemoveDevice = async (deviceId: string) => {
    if (!session || !session.id) {
      console.error('Session ID is missing');
      enqueueSnackbar('שגיאה: מזהה סשן חסר', { variant: 'error' });
      return;
    }
    
    setIsLoading(true);
    try {
      await apiService.removeDevice(session.id, deviceId);
      // עדכון רשימת המכשירים
      await handleLoadDevices();
      
      // אם המכשיר הנוכחי נמחק, נחזור לטאב הראשון
      if (selectedDevice?.deviceId === deviceId) {
        setSelectedDevice(null);
        setTabValue(0);
      }
      
      enqueueSnackbar('המכשיר הוסר בהצלחה', { variant: 'success' });
    } catch (error) {
      console.error('שגיאה בהסרת מכשיר:', error);
      enqueueSnackbar('אירעה שגיאה בהסרת המכשיר', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // פונקציה להתנתקות ממכשיר
  const handleLogoutDevice = async (deviceId: string) => {
    if (!session || !session.id) {
      console.error('Session ID is missing');
      enqueueSnackbar('שגיאה: מזהה סשן חסר', { variant: 'error' });
      return;
    }
    
    setIsLoading(true);
    try {
      await apiService.logoutDevice(session.id, deviceId);
      // עדכון רשימת המכשירים
      await handleLoadDevices();
      
      enqueueSnackbar('המכשיר נותק בהצלחה', { variant: 'success' });
    } catch (error) {
      console.error('שגיאה בניתוק מכשיר:', error);
      enqueueSnackbar('אירעה שגיאה בניתוק המכשיר', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // פונקציה לקבלת קוד QR של מכשיר
  const handleGetQRCode = async (deviceId: string) => {
    if (!session || !session.id) {
      console.error('Session ID is missing');
      enqueueSnackbar('שגיאה: מזהה סשן חסר', { variant: 'error' });
      return;
    }
    
    if (!deviceId) {
      console.error('Device ID is undefined');
      enqueueSnackbar('שגיאה: מזהה מכשיר חסר', { variant: 'error' });
      return;
    }
    
    console.log('Getting QR code for device:', deviceId, 'in session:', session.id);
    
    setIsLoading(true);
    try {
      const response = await apiService.getQRCode(session.id, deviceId);
      console.log('QR code response:', response);
      
      // התמודדות עם מבנים שונים של תשובה
      let qrCodeData = null;
      let expirationData = null;
      
      if (response.data) {
        // נתיב 1: הנתונים בתוך data
        if (response.data.qrCode) {
          qrCodeData = response.data.qrCode;
          expirationData = response.data.expiresAt;
        }
        // נתיב 2: תשובה מנתיב לגאסי
        else if (response.data.data && response.data.data.qrCode) {
          qrCodeData = response.data.data.qrCode;
          expirationData = response.data.data.expiration;
        }
      }
      
      if (!qrCodeData) {
        console.error('QR code is missing in the response');
        enqueueSnackbar('שגיאה: קוד QR לא התקבל מהשרת', { variant: 'error' });
        return;
      }
      
      setQrCode(qrCodeData);
      
      // הגדרת תאריך פקיעת תוקף הקוד (אם קיים)
      if (expirationData) {
        setQrExpiration(new Date(expirationData));
      }
      
      // הגדרת טיימר לרענון הקוד אוטומטי
      if (expirationData) {
        const expirationTime = new Date(expirationData).getTime();
        const currentTime = new Date().getTime();
        const timeUntilExpiration = expirationTime - currentTime;
        
        // נרענן 10 שניות לפני פקיעת הקוד
        if (timeUntilExpiration > 10000) {
          qrTimeoutRef.current = setTimeout(() => {
            handleRefreshQR();
          }, timeUntilExpiration - 10000);
        }
      }
      
      enqueueSnackbar('קוד QR התקבל בהצלחה', { variant: 'success' });
    } catch (error: any) {
      console.error('שגיאה בקבלת קוד QR:', error);
      
      // טיפול ספציפי בשגיאת 404 - המכשיר לא נמצא
      if (error.response && error.response.status === 404) {
        enqueueSnackbar('המכשיר לא נמצא במערכת. נסה ליצור מכשיר חדש', { variant: 'error' });
        
        // חזרה לטאב הראשון
        setTabValue(0);
        setSelectedDevice(null);
      } else {
        enqueueSnackbar('אירעה שגיאה בקבלת קוד QR', { variant: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // פונקציה לרענון קוד QR
  const handleRefreshQR = async () => {
    if (!session?.id || !selectedDeviceId) {
      enqueueSnackbar('לא ניתן לרענן, חסרים פרטי מכשיר', { variant: 'error' });
      return;
    }
    
    setIsQRLoading(true);
    setQrCode(null);
    
    try {
      const response = await apiService.refreshQR(session.id, selectedDeviceId);
      setQrCode(response.data.qrCode);
      
      // עדכון סטטוס המכשיר
      const updatedDevices = [...devices];
      const deviceIndex = updatedDevices.findIndex(d => d.deviceId === selectedDeviceId);
      if (deviceIndex !== -1) {
        updatedDevices[deviceIndex].status = 'initializing';
        setDevices(updatedDevices);
        setSelectedDevice(updatedDevices[deviceIndex]);
      }
      
      enqueueSnackbar('קוד QR חודש בהצלחה', { variant: 'success' });
    } catch (error) {
      console.error('שגיאה בחידוש קוד QR:', error);
      enqueueSnackbar('שגיאה בחידוש קוד QR', { variant: 'error' });
    } finally {
      setIsQRLoading(false);
    }
  };

  const handleResetDevice = async () => {
    if (!session?.id || !selectedDeviceId) {
      enqueueSnackbar('לא ניתן לאפס, חסרים פרטי מכשיר', { variant: 'error' });
      return;
    }
    
    // וידוא האיפוס עם המשתמש
    if (!window.confirm('האם אתה בטוח שברצונך לאפס את המכשיר? פעולה זו תמחק את קוד ה-QR הנוכחי ותיצור חדש.')) {
      return;
    }
    
    setIsQRLoading(true);
    setQrCode(null);
    
    try {
      // התנתקות מהמכשיר קודם
      await apiService.logoutDevice(session.id, selectedDeviceId);
      
      // רענון קוד QR לאחר התנתקות
      const response = await apiService.refreshQR(session.id, selectedDeviceId);
      setQrCode(response.data.qrCode);
      
      // עדכון רשימת המכשירים
      handleLoadDevices();
      
      enqueueSnackbar('המכשיר אופס בהצלחה', { variant: 'success' });
    } catch (error) {
      console.error('שגיאה באיפוס המכשיר:', error);
      enqueueSnackbar('שגיאה באיפוס המכשיר', { variant: 'error' });
    } finally {
      setIsQRLoading(false);
    }
  };

  // פונקציה להצגת הזמן שנותר עד לפקיעת הקוד
  const formatRemainingTime = () => {
    if (!qrExpiration) return '';
    
    const now = new Date();
    const diff = qrExpiration.getTime() - now.getTime();
    
    if (diff <= 0) return 'פג תוקף';
    
    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60));
    
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  // ניקוי טיימרים בעת סגירת הקומפוננטה
  useEffect(() => {
    return () => {
      if (qrTimeoutRef.current) {
        clearTimeout(qrTimeoutRef.current);
      }
    };
  }, []);

  // עדכון של זמן קוד QR אם קיים
  useEffect(() => {
    if (!qrExpiration) return;
    
    const interval = setInterval(() => {
      // אם פג תוקף הקוד, נרענן אותו
      if (new Date() >= qrExpiration) {
        handleRefreshQR();
      } else {
        // נרנדר מחדש כדי לעדכן את התצוגה
        setQrUpdateTrigger((prev) => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [qrExpiration]);

  // הפונקציה נקראת בעת סגירת הדיאלוג
  const handleClose = () => {
    // ניקוי טיימרים וסטייטים
    if (qrTimeoutRef.current) {
      clearTimeout(qrTimeoutRef.current);
      qrTimeoutRef.current = null;
    }
    
    setSelectedDevice(null);
    setQrCode(null);
    setQrExpiration(null);
    setTabValue(0);
    onClose();
    
    // רענון הנתונים אם קיימת פונקציית רענון
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        {session ? `ניהול מכשירי WhatsApp עבור ${session.name}` : 'ניהול מכשירי WhatsApp'}
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ width: '100%', textAlign: 'center', p: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              טוען מכשירים...
            </Typography>
          </Box>
        ) : (
          <>
            <Tabs 
              value={tabValue} 
              onChange={(_, val) => setTabValue(val)} 
              variant="fullWidth"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                label="מכשירים מחוברים" 
                icon={<SmartphoneIcon />}
                iconPosition="start"
              />
              <Tab 
                label="הוסף מכשיר חדש" 
                icon={<AddIcon />}
                iconPosition="start"
              />
            </Tabs>
            
            {/* לשונית מכשירים מחוברים */}
            {tabValue === 0 && (
              <Box>
                {devices.length === 0 ? (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography color="textSecondary" sx={{ mb: 2 }}>
                      לא נמצאו מכשירים מחוברים לסשן זה.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setTabValue(1)}
                    >
                      הוסף מכשיר חדש
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                      <Typography variant="subtitle1" gutterBottom>
                        בחר מכשיר:
                      </Typography>
                      <List 
                        sx={{ 
                          border: '1px solid', 
                          borderColor: 'divider', 
                          borderRadius: 1, 
                          maxHeight: 300, 
                          overflow: 'auto'
                        }}
                      >
                        {devices.map((device) => (
                          <ListItem 
                            key={device.deviceId} 
                            button 
                            selected={selectedDeviceId === device.deviceId}
                            onClick={() => handleSelectDevice(device.deviceId)}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: device.status === 'connected' ? 'success.light' : 'grey.300' }}>
                                <SmartphoneIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={device.name}
                              secondary={
                                <>
                                  <Typography variant="caption" color="textSecondary" component="span">
                                    {device.status === 'connected' ? 'מחובר' : 'לא מחובר'}
                                  </Typography>
                                  {device.phone && (
                                    <>
                                      <br />
                                      <Typography variant="caption" component="span">
                                        {device.phone}
                                      </Typography>
                                    </>
                                  )}
                                </>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Chip 
                                size="small" 
                                color={device.status === 'connected' ? 'success' : 'default'}
                                label={device.status === 'connected' ? 'מחובר' : 'מנותק'}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                      
                      {/* פעולות מכשיר */}
                      {selectedDeviceId && selectedDevice && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          {selectedDevice.status === 'connected' ? (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              onClick={() => handleLogoutDevice(selectedDeviceId)}
                              disabled={isLoading}
                              fullWidth
                            >
                              נתק מכשיר
                            </Button>
                          ) : (
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="primary"
                              onClick={() => handleGetQRCode(selectedDeviceId)}
                              disabled={isLoading}
                              fullWidth
                            >
                              הצג קוד QR
                            </Button>
                          )}
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            onClick={() => handleRemoveDevice(selectedDeviceId)}
                            disabled={isLoading}
                          >
                            הסר
                          </Button>
                        </Box>
                      )}
                    </Grid>
                    
                    {/* אזור הצגת QR/מידע */}
                    <Grid item xs={12} md={7}>
                      <Box 
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          p: 3,
                          minHeight: 320,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {selectedDeviceId ? (
                          selectedDevice?.status === 'connected' ? (
                            <Box sx={{ textAlign: 'center' }}>
                              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                              <Typography variant="h6" gutterBottom>המכשיר מחובר!</Typography>
                              <Typography variant="body2" color="textSecondary">
                                מכשיר זה כבר מחובר לחשבון WhatsApp.
                                {selectedDevice?.phone && (
                                  <Box sx={{ mt: 1 }}>מספר: <b>{selectedDevice.phone}</b></Box>
                                )}
                              </Typography>
                            </Box>
                          ) : isQRLoading ? (
                            <>
                              <CircularProgress sx={{ mb: 2 }} />
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                טוען קוד QR...
                              </Typography>
                            </>
                          ) : qrCode ? (
                            <>
                              <Typography variant="subtitle1" gutterBottom>
                                סרוק את הקוד כדי לחבר את המכשיר
                              </Typography>
                              <Box sx={{ 
                                position: 'relative', 
                                mb: 2,
                                width: { xs: '100%', sm: 210 },
                                height: { xs: 'auto', sm: 210 },
                                margin: '0 auto'
                              }}>
                                <img 
                                  src={qrCode} 
                                  alt="QR Code" 
                                  style={{ 
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    imageRendering: 'pixelated' 
                                  }} 
                                />
                                <IconButton
                                  onClick={handleRefreshQR}
                                  sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    }
                                  }}
                                  size="small"
                                >
                                  <RefreshIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                <b>הוראות:</b> פתח את WhatsApp בטלפון &gt; הגדרות &gt; מכשירים מקושרים &gt; קשר מכשיר
                              </Typography>
                              
                              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<RefreshIcon />}
                                  onClick={handleRefreshQR}
                                  disabled={isQRLoading}
                                >
                                  רענן קוד
                                </Button>
                              </Box>
                            </>
                          ) : (
                            <Box>
                              <Typography variant="body1" sx={{ mb: 2 }}>
                                לחץ על כפתור "הצג קוד QR" כדי לסרוק ולחבר את המכשיר
                              </Typography>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleGetQRCode(selectedDeviceId)}
                              >
                                הצג קוד QR
                              </Button>
                            </Box>
                          )
                        ) : (
                          <Typography variant="body1" color="textSecondary">
                            בחר מכשיר מהרשימה משמאל או הוסף מכשיר חדש
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}
            
            {/* לשונית הוספת מכשיר חדש */}
            {tabValue === 1 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  הוסף מכשיר WhatsApp חדש
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 3 }}>
                  הוסף מכשיר חדש כדי לחבר את חשבון WhatsApp שלך למערכת
                </Typography>
                
                <Box component="form" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                  <TextField
                    autoFocus
                    label="שם המכשיר"
                    fullWidth
                    required
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    placeholder="למשל: טלפון אישי, מחשב נייד, טאבלט"
                    sx={{ mb: 2 }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={!newDeviceName.trim() || isLoading}
                    onClick={handleAddDevice}
                    startIcon={<AddIcon />}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'צור מכשיר חדש'}
                  </Button>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    איך זה עובד?
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" paragraph>
                        1. הגדר שם למכשיר החדש
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" paragraph>
                        2. תקבל קוד QR לסריקה
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" paragraph>
                        3. סרוק את הקוד עם WhatsApp בטלפון שלך
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
            
            {/* תיבת מידע כללית */}
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#e8f5e9', 
              borderRadius: 1, 
              border: '1px solid #a5d6a7' 
            }}>
              <Typography variant="subtitle2" sx={{ color: '#2e7d32', mb: 1 }}>
                <b>הידעת?</b>
              </Typography>
              <Typography variant="body2" sx={{ color: '#1b5e20' }}>
                ניתן לחבר עד 4 מכשירים במקביל לאותו חשבון WhatsApp.
                המכשירים יישארו מחוברים גם אם הטלפון הראשי שלך לא מחובר לאינטרנט.
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>סגור</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDialog;