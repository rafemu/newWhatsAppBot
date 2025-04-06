import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Collapse,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar
} from '@mui/material';
import {
  Settings as SettingsIcon,
  WhatsApp as WhatsAppIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Mail as MailIcon,
  Language as LanguageIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  AddCircleOutline as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// נתונים לדוגמה
const mockSettings = {
  general: {
    siteName: 'מערכת סקרים ובוטים',
    language: 'he',
    timezone: 'Asia/Jerusalem',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    maintenanceMode: false
  },
  whatsapp: {
    defaultSession: '1',
    autoReconnect: true,
    messageRetention: 30,
    errorNotification: true,
    templates: [
      { id: 't1', name: 'ברכת יום הולדת', content: 'היי {{name}}, איחולים ליום הולדתך!' },
      { id: 't2', name: 'תודה על הרכישה', content: 'תודה על הרכישה {{name}}, המוצר {{product}} יישלח בקרוב.' },
      { id: 't3', name: 'תזכורת פגישה', content: 'תזכורת: יש לך פגישה מחר בשעה {{time}}' }
    ]
  },
  notifications: {
    email: true,
    whatsapp: false,
    browser: true,
    surveyCompleted: true,
    newMessage: true,
    errorAlerts: true
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 60,
    failedLoginAttempts: 5,
    passwordComplexity: 'medium'
  },
  email: {
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'example@gmail.com',
    smtpPassword: '********',
    senderName: 'מערכת סקרים',
    senderEmail: 'noreply@surveys.com'
  }
};

const passwordComplexityOptions = [
  { value: 'low', label: 'נמוכה - מינימום 6 תווים' },
  { value: 'medium', label: 'בינונית - 8 תווים הכוללים אותיות ומספרים' },
  { value: 'high', label: 'גבוהה - 10 תווים הכוללים אותיות, מספרים ותווים מיוחדים' }
];

const languageOptions = [
  { value: 'he', label: 'עברית' },
  { value: 'en', label: 'אנגלית' },
  { value: 'ar', label: 'ערבית' },
  { value: 'ru', label: 'רוסית' }
];

const timezoneOptions = [
  { value: 'Asia/Jerusalem', label: 'ירושלים (GMT+3)' },
  { value: 'Europe/London', label: 'לונדון (GMT+0)' },
  { value: 'America/New_York', label: 'ניו יורק (GMT-5)' },
  { value: 'Asia/Tokyo', label: 'טוקיו (GMT+9)' }
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState(mockSettings);
  const [alertOpen, setAlertOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<any>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (
    category: keyof typeof mockSettings,
    setting: string,
    value: any
  ) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    });
  };

  const handleSaveSettings = () => {
    // בסביבה אמיתית, כאן היינו קוראים ל-API לשמירת ההגדרות
    setSnackbarMessage('ההגדרות נשמרו בהצלחה');
    setSnackbarOpen(true);
  };

  const handleAddTemplate = () => {
    setTemplateToEdit({
      id: `t${Date.now()}`,
      name: '',
      content: ''
    });
    setShowTemplateDialog(true);
  };

  const handleEditTemplate = (template: any) => {
    setTemplateToEdit({ ...template });
    setShowTemplateDialog(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק תבנית זו?')) {
      setSettings({
        ...settings,
        whatsapp: {
          ...settings.whatsapp,
          templates: settings.whatsapp.templates.filter(t => t.id !== templateId)
        }
      });
    }
  };

  const handleSaveTemplate = () => {
    if (!templateToEdit.name.trim() || !templateToEdit.content.trim()) {
      alert('נא למלא את כל השדות');
      return;
    }

    const existingIndex = settings.whatsapp.templates.findIndex(t => t.id === templateToEdit.id);
    
    if (existingIndex >= 0) {
      // עדכון תבנית קיימת
      const updatedTemplates = [...settings.whatsapp.templates];
      updatedTemplates[existingIndex] = templateToEdit;
      
      setSettings({
        ...settings,
        whatsapp: {
          ...settings.whatsapp,
          templates: updatedTemplates
        }
      });
    } else {
      // הוספת תבנית חדשה
      setSettings({
        ...settings,
        whatsapp: {
          ...settings.whatsapp,
          templates: [...settings.whatsapp.templates, templateToEdit]
        }
      });
    }
    
    setShowTemplateDialog(false);
    setTemplateToEdit(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">הגדרות</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          שמירת הגדרות
        </Button>
      </Box>

      <Collapse in={alertOpen}>
        <Alert 
          severity="success"
          action={
            <IconButton 
              size="small"
              onClick={() => setAlertOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{ mb: 3 }}
        >
          ההגדרות נשמרו בהצלחה
        </Alert>
      </Collapse>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab icon={<SettingsIcon />} label="כללי" />
          <Tab icon={<WhatsAppIcon />} label="וואטסאפ" />
          <Tab icon={<NotificationsIcon />} label="התראות" />
          <Tab icon={<SecurityIcon />} label="אבטחה" />
          <Tab icon={<MailIcon />} label="דואר אלקטרוני" />
        </Tabs>
      </Paper>

      {/* הגדרות כלליות */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            הגדרות כלליות
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="שם האתר"
                value={settings.general.siteName}
                onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>שפה</InputLabel>
                <Select
                  value={settings.general.language}
                  onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                  label="שפה"
                >
                  {languageOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>אזור זמן</InputLabel>
                <Select
                  value={settings.general.timezone}
                  onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                  label="אזור זמן"
                >
                  {timezoneOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>פורמט תאריך</InputLabel>
                <Select
                  value={settings.general.dateFormat}
                  onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                  label="פורמט תאריך"
                >
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>מצב תחזוקה</Typography>
                    <Tooltip title="כאשר מצב תחזוקה מופעל, רק מנהלים יוכלו להיכנס למערכת">
                      <InfoIcon fontSize="small" color="info" />
                    </Tooltip>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* הגדרות וואטסאפ */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            הגדרות וואטסאפ
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>חיבור ברירת מחדל</InputLabel>
                <Select
                  value={settings.whatsapp.defaultSession}
                  onChange={(e) => handleSettingChange('whatsapp', 'defaultSession', e.target.value)}
                  label="חיבור ברירת מחדל"
                >
                  <MenuItem value="1">בוט תמיכת לקוחות</MenuItem>
                  <MenuItem value="2">בוט מכירות</MenuItem>
                  <MenuItem value="3">בוט תזכורות</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="שמירת הודעות (ימים)"
                value={settings.whatsapp.messageRetention}
                onChange={(e) => handleSettingChange('whatsapp', 'messageRetention', parseInt(e.target.value) || 0)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ימים</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.whatsapp.autoReconnect}
                    onChange={(e) => handleSettingChange('whatsapp', 'autoReconnect', e.target.checked)}
                  />
                }
                label="התחברות אוטומטית מחדש"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.whatsapp.errorNotification}
                    onChange={(e) => handleSettingChange('whatsapp', 'errorNotification', e.target.checked)}
                  />
                }
                label="התראות על שגיאות"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">תבניות הודעות</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddTemplate}
                  size="small"
                >
                  הוספת תבנית
                </Button>
              </Box>
              
              <List>
                {settings.whatsapp.templates.map((template) => (
                  <ListItem
                    key={template.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={template.name}
                      secondary={template.content}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleEditTemplate(template)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteTemplate(template.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              {settings.whatsapp.templates.length === 0 && (
                <Typography color="text.secondary" align="center">
                  אין תבניות הודעות
                </Typography>
              )}
              
              {/* דיאלוג עריכת תבנית */}
              {showTemplateDialog && templateToEdit && (
                <Box sx={{ mt: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {templateToEdit.id.startsWith('t') && !settings.whatsapp.templates.find(t => t.id === templateToEdit.id) 
                      ? 'הוספת תבנית חדשה' 
                      : 'עריכת תבנית'
                    }
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="שם התבנית"
                        value={templateToEdit.name}
                        onChange={(e) => setTemplateToEdit({...templateToEdit, name: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="תוכן ההודעה"
                        value={templateToEdit.content}
                        onChange={(e) => setTemplateToEdit({...templateToEdit, content: e.target.value})}
                        multiline
                        rows={3}
                        helperText="ניתן להשתמש במשתנים כמו {{name}} שיוחלפו בזמן השליחה"
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button onClick={() => setShowTemplateDialog(false)}>ביטול</Button>
                      <Button 
                        variant="contained" 
                        onClick={handleSaveTemplate}
                      >
                        שמירה
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* הגדרות התראות */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            הגדרות התראות
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                ערוצי התראות
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  />
                }
                label="דואר אלקטרוני"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.whatsapp}
                    onChange={(e) => handleSettingChange('notifications', 'whatsapp', e.target.checked)}
                  />
                }
                label="וואטסאפ"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.browser}
                    onChange={(e) => handleSettingChange('notifications', 'browser', e.target.checked)}
                  />
                }
                label="התראות דפדפן"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                סוגי התראות
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.surveyCompleted}
                    onChange={(e) => handleSettingChange('notifications', 'surveyCompleted', e.target.checked)}
                  />
                }
                label="השלמת סקר"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.newMessage}
                    onChange={(e) => handleSettingChange('notifications', 'newMessage', e.target.checked)}
                  />
                }
                label="הודעה חדשה"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.errorAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'errorAlerts', e.target.checked)}
                  />
                }
                label="התראות שגיאה"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* הגדרות אבטחה */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            הגדרות אבטחה
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>אימות דו-שלבי</Typography>
                    <Tooltip title="הפעלת אימות דו-שלבי תדרוש קוד נוסף בכל התחברות">
                      <InfoIcon fontSize="small" color="info" />
                    </Tooltip>
                  </Box>
                }
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="זמן פקיעת הסשן (דקות)"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value) || 0)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">דקות</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="ניסיונות כניסה שגויים"
                value={settings.security.failedLoginAttempts}
                onChange={(e) => handleSettingChange('security', 'failedLoginAttempts', parseInt(e.target.value) || 0)}
                helperText="מספר ניסיונות הכניסה השגויים לפני נעילת החשבון"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>מורכבות סיסמה</InputLabel>
                <Select
                  value={settings.security.passwordComplexity}
                  onChange={(e) => handleSettingChange('security', 'passwordComplexity', e.target.value)}
                  label="מורכבות סיסמה"
                >
                  {passwordComplexityOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* הגדרות דואר אלקטרוני */}
      {activeTab === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            הגדרות דואר אלקטרוני
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="שרת SMTP"
                value={settings.email.smtpServer}
                onChange={(e) => handleSettingChange('email', 'smtpServer', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="פורט SMTP"
                value={settings.email.smtpPort}
                onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value) || 0)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="שם משתמש SMTP"
                value={settings.email.smtpUser}
                onChange={(e) => handleSettingChange('email', 'smtpUser', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="password"
                label="סיסמת SMTP"
                value={settings.email.smtpPassword}
                onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="שם השולח"
                value={settings.email.senderName}
                onChange={(e) => handleSettingChange('email', 'senderName', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="כתובת אימייל השולח"
                value={settings.email.senderEmail}
                onChange={(e) => handleSettingChange('email', 'senderEmail', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={() => {
                  // בסביבה אמיתית, כאן היינו שולחים אימייל בדיקה
                  alert('אימייל בדיקה נשלח!');
                }}
              >
                שליחת אימייל בדיקה
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Snackbar להודעות */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 