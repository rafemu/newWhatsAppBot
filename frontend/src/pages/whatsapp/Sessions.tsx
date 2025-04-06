import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Chip,
  Paper,
  CircularProgress,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutlined as DeleteIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { WhatsAppSession } from '../../types/global';
import { apiService } from '../../services/api';
import { useSnackbar } from 'notistack';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

import PageHeader from '../../components/PageHeader';
import PageContainer from '../../components/PageContainer';
import QRCodeDialog from '../../components/QRCodeDialog';

const WhatsAppSessions: React.FC = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  // טעינת נתוני סשנים מהשרת
  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await apiService.getSessions();
      
      console.log('Raw sessions data from server:', response.data);
      
      // המרת נתונים שמגיעים מהשרת לפורמט מקומי
      const formattedSessions: WhatsAppSession[] = response.data.map((sessionData: any) => {
        console.log('Processing session:', sessionData);
        const formatted = {
          id: sessionData.id || sessionData._id, // נסה להשתמש ב-_id אם id חסר
          name: sessionData.name,
          phone: sessionData.phone || '',
          status: sessionData.status || 'disconnected',
          // mapServerStatusToClientStatus(sessionData.status),
          lastActive: sessionData.lastActive || new Date().toISOString(),
          createdAt: sessionData.createdAt,
          updatedAt: sessionData.updatedAt,
          devices: sessionData.devices || []
        };
        console.log('Formatted session:', formatted);
        return formatted;
      });
      
      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      enqueueSnackbar('שגיאה בטעינת רשימת סשנים', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // המרת סטטוס שרת לסטטוס לקוח
  const mapServerStatusToClientStatus = (serverStatus: string): 'connecting' | 'connected' | 'disconnected' | 'error' => {
    const statusMap: { [key: string]: 'connecting' | 'connected' | 'disconnected' | 'error' } = {
      'CONNECTING': 'connecting',
      'CONNECTED': 'connected',
      'DISCONNECTED': 'disconnected',
      'ERROR': 'error',
      'INITIALIZING': 'connecting'
    };
    
    return statusMap[serverStatus] || 'disconnected';
  };

  useEffect(() => {
    loadSessions();
    
    // רענון אוטומטי כל 30 שניות
    const intervalId = setInterval(() => {
      loadSessions();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await apiService.createSession(
        newSessionName.trim(), 
        newSessionDescription.trim() || undefined
      );
      
      // רענון רשימת הסשנים
      await loadSessions();
      
      // סגירת הדיאלוג ואיפוס שדות הטופס
      setIsCreateDialogOpen(false);
      setNewSessionName('');
      setNewSessionDescription('');
      
      enqueueSnackbar('הסשן נוצר בהצלחה', { variant: 'success' });
    } catch (error) {
      console.error('Error creating session:', error);
      enqueueSnackbar('שגיאה ביצירת סשן חדש', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!sessionId) {
      console.error('Session ID is undefined');
      enqueueSnackbar('שגיאה: מזהה סשן חסר', { variant: 'error' });
      return;
    }
    
    if (!confirm('האם אתה בטוח שברצונך למחוק את הסשן? כל המכשירים והשיחות המקושרים יימחקו גם כן.')) {
      return;
    }
    
    try {
      await apiService.deleteSession(sessionId);
      
      // רענון רשימת הסשנים
      await loadSessions();
      
      enqueueSnackbar('הסשן נמחק בהצלחה', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting session:', error);
      enqueueSnackbar('שגיאה במחיקת הסשן', { variant: 'error' });
    }
  };

  const handleRefreshSession = async (sessionId: string) => {
    if (!sessionId) {
      console.error('Session ID is undefined');
      enqueueSnackbar('שגיאה: מזהה סשן חסר', { variant: 'error' });
      return;
    }
    
    try {
      await apiService.getSessionStatus(sessionId);
      
      // רענון רשימת הסשנים
      await loadSessions();
    } catch (error) {
      console.error('Error refreshing session:', error);
      enqueueSnackbar('שגיאה ברענון סטטוס הסשן', { variant: 'error' });
    }
  };

  const handleShowQRCode = (selectedSession: WhatsAppSession) => {
    if (!selectedSession || !selectedSession.id) {
      console.error('Session ID is undefined');
      enqueueSnackbar('שגיאה: מזהה סשן חסר', { variant: 'error' });
      return;
    }
    setSession(selectedSession);
    setIsQRDialogOpen(true);
  };

  const handleNavigateToSettings = (sessionId: string) => {
    if (!sessionId) {
      console.error('Session ID is undefined');
      enqueueSnackbar('שגיאה: מזהה סשן חסר', { variant: 'error' });
      return;
    }
    navigate(`/whatsapp/settings/${sessionId}`);
  };

  // פונקציה למיפוי סטטוס לצבע
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'info';
      case 'disconnected':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  // פונקציה למיפוי סטטוס לטקסט בעברית
  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'מחובר';
      case 'connecting':
        return 'מתחבר';
      case 'disconnected':
        return 'מנותק';
      case 'error':
        return 'שגיאה';
      default:
        return 'לא ידוע';
    }
  };
  
  return (
    <PageContainer>
      <PageHeader 
        title="ניהול סשנים" 
        subtitle="צור וצפה בסשנים מרובים של WhatsApp, נהל מכשירים מחוברים ובצע פעולות שונות."
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={() => setIsCreateDialogOpen(true)}
        >
          צור סשן חדש
        </Button>
      </Box>
      
      {loading ? (
        <LinearProgress />
      ) : sessions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" color="textSecondary">
            אין סשנים קיימים. לחץ על "צור סשן חדש" כדי להתחיל.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sessions.map((session) => (
            <Grid item xs={12} sm={6} md={4} key={session.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {session.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="רענן סטטוס">
                    <IconButton 
                          size="small" 
                          onClick={() => handleRefreshSession(session.id)}
                    >
                          <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                      
                      <Tooltip title="הצג קוד QR ומכשירים">
                    <IconButton 
                          size="small" 
                          onClick={() => handleShowQRCode(session)}
                    >
                          <QrCodeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                      
                      <Tooltip title="הגדרות">
                    <IconButton 
                          size="small" 
                          onClick={() => handleNavigateToSettings(session.id)}
                    >
                          <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                      
                  <Tooltip title="מחק סשן">
                    <IconButton 
                          size="small" 
                      color="error" 
                      onClick={() => handleDeleteSession(session.id)}
                    >
                          <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                    </Box>
                  </Box>
                  
                  <Chip 
                    label={getStatusText(session.status)} 
                    color={getStatusColor(session.status) as any} 
                    size="small" 
                    sx={{ mb: 2 }} 
                  />
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    מספר טלפון: {session.phone || 'לא מחובר'}
                  </Typography>
                  
                  {session.devices && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      מכשירים מחוברים: {session.devices.filter(d => d.status === 'connected').length} / {session.devices.length}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="textSecondary">
                    פעילות אחרונה: {formatDistanceToNow(new Date(session.lastActive), { 
                      addSuffix: true, 
                      locale: he 
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* דיאלוג יצירת סשן חדש */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
        <DialogTitle>צור סשן WhatsApp חדש</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
          <TextField
            autoFocus
              margin="normal"
            label="שם הסשן"
            fullWidth
              required
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
          />
          <TextField
              margin="normal"
              label="תיאור (אופציונלי)"
            fullWidth
              multiline
              rows={2}
              value={newSessionDescription}
              onChange={(e) => setNewSessionDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>בטל</Button>
          <Button 
            onClick={handleCreateSession} 
            variant="contained" 
            disabled={!newSessionName.trim() || isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'צור סשן'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* דיאלוג QR */}
      <QRCodeDialog
        open={isQRDialogOpen}
        onClose={() => setIsQRDialogOpen(false)}
        session={session}
        onRefresh={loadSessions}
      />
    </PageContainer>
  );
};

export default WhatsAppSessions; 