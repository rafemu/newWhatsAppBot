import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Grid,
  Chip,
  Collapse,
  Card,
  CardContent,
  Tab,
  Tabs,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// נתונים לדוגמה
const mockRoles = [
  {
    id: 'admin',
    name: 'מנהל מערכת',
    description: 'גישה מלאה לכל מודולי המערכת',
    usersCount: 2,
    permissions: [
      'dashboard:view',
      'users:view',
      'users:create',
      'users:edit',
      'users:delete',
      'roles:view',
      'roles:create',
      'roles:edit',
      'roles:delete',
      'surveys:view',
      'surveys:create',
      'surveys:edit',
      'surveys:delete',
      'surveys:responses:view',
      'surveys:responses:export',
      'whatsapp:view',
      'whatsapp:send',
      'whatsapp:sessions:manage',
      'settings:view',
      'settings:edit'
    ]
  },
  {
    id: 'editor',
    name: 'עורך תוכן',
    description: 'ניהול סקרים ותוכן ללא גישה להגדרות מערכת',
    usersCount: 3,
    permissions: [
      'dashboard:view',
      'surveys:view',
      'surveys:create',
      'surveys:edit',
      'surveys:responses:view',
      'surveys:responses:export',
      'whatsapp:view',
      'whatsapp:send'
    ]
  },
  {
    id: 'viewer',
    name: 'צופה',
    description: 'גישה לצפייה בלבד',
    usersCount: 5,
    permissions: [
      'dashboard:view',
      'surveys:view',
      'surveys:responses:view',
      'whatsapp:view'
    ]
  }
];

// קבוצות הרשאות אפשריות
const permissionGroups = [
  {
    name: 'לוח בקרה',
    key: 'dashboard',
    permissions: [
      { id: 'dashboard:view', name: 'צפייה בלוח בקרה' }
    ]
  },
  {
    name: 'משתמשים',
    key: 'users',
    permissions: [
      { id: 'users:view', name: 'צפייה במשתמשים' },
      { id: 'users:create', name: 'יצירת משתמשים' },
      { id: 'users:edit', name: 'עריכת משתמשים' },
      { id: 'users:delete', name: 'מחיקת משתמשים' }
    ]
  },
  {
    name: 'תפקידים והרשאות',
    key: 'roles',
    permissions: [
      { id: 'roles:view', name: 'צפייה בתפקידים' },
      { id: 'roles:create', name: 'יצירת תפקידים' },
      { id: 'roles:edit', name: 'עריכת תפקידים' },
      { id: 'roles:delete', name: 'מחיקת תפקידים' }
    ]
  },
  {
    name: 'סקרים',
    key: 'surveys',
    permissions: [
      { id: 'surveys:view', name: 'צפייה בסקרים' },
      { id: 'surveys:create', name: 'יצירת סקרים' },
      { id: 'surveys:edit', name: 'עריכת סקרים' },
      { id: 'surveys:delete', name: 'מחיקת סקרים' },
      { id: 'surveys:responses:view', name: 'צפייה בתשובות' },
      { id: 'surveys:responses:export', name: 'ייצוא תשובות' }
    ]
  },
  {
    name: 'וואטסאפ',
    key: 'whatsapp',
    permissions: [
      { id: 'whatsapp:view', name: 'צפייה בהודעות' },
      { id: 'whatsapp:send', name: 'שליחת הודעות' },
      { id: 'whatsapp:sessions:manage', name: 'ניהול חיבורים' }
    ]
  },
  {
    name: 'הגדרות',
    key: 'settings',
    permissions: [
      { id: 'settings:view', name: 'צפייה בהגדרות' },
      { id: 'settings:edit', name: 'עריכת הגדרות' }
    ]
  }
];

const Permissions: React.FC = () => {
  const [roles, setRoles] = useState(mockRoles);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddRole = () => {
    setCurrentRole({
      id: '',
      name: '',
      description: '',
      usersCount: 0,
      permissions: []
    });
    setIsEditing(false);
    setShowRoleDialog(true);
  };

  const handleEditRole = (role: any) => {
    setCurrentRole({ ...role });
    setIsEditing(true);
    setShowRoleDialog(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק תפקיד זה?')) {
      // בסביבה אמיתית היינו בודקים אם יש משתמשים עם תפקיד זה
      const role = roles.find(r => r.id === roleId);
      if (role && role.usersCount > 0) {
        setAlertMessage(`לא ניתן למחוק תפקיד זה מכיוון שהוא מוקצה ל-${role.usersCount} משתמשים`);
        setAlertOpen(true);
        return;
      }
      
      setRoles(roles.filter(r => r.id !== roleId));
      setAlertMessage('התפקיד נמחק בהצלחה');
      setAlertOpen(true);
    }
  };

  const handleSaveRole = () => {
    // וולידציה בסיסית
    if (!currentRole.name.trim() || !currentRole.id.trim()) {
      alert('אנא הזן שם ומזהה לתפקיד');
      return;
    }

    // וידוא שאין מזהה כפול במקרה של תפקיד חדש
    if (!isEditing && roles.some(r => r.id === currentRole.id)) {
      alert('קיים כבר תפקיד עם מזהה זה');
      return;
    }

    if (isEditing) {
      // עדכון תפקיד קיים
      setRoles(roles.map(r => r.id === currentRole.id ? currentRole : r));
      setAlertMessage('התפקיד עודכן בהצלחה');
    } else {
      // הוספת תפקיד חדש
      setRoles([...roles, currentRole]);
      setAlertMessage('התפקיד נוצר בהצלחה');
    }
    
    setShowRoleDialog(false);
    setAlertOpen(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    const updatedPermissions = currentRole.permissions.includes(permissionId)
      ? currentRole.permissions.filter((p: string) => p !== permissionId)
      : [...currentRole.permissions, permissionId];
    
    setCurrentRole({
      ...currentRole,
      permissions: updatedPermissions
    });
  };

  const handleTogglePermissionGroup = (groupKey: string, checked: boolean) => {
    const group = permissionGroups.find(g => g.key === groupKey);
    if (!group) return;
    
    const groupPermissionIds = group.permissions.map(p => p.id);
    let updatedPermissions;
    
    if (checked) {
      // הוספת כל ההרשאות בקבוצה
      updatedPermissions = [...new Set([...currentRole.permissions, ...groupPermissionIds])];
    } else {
      // הסרת כל ההרשאות בקבוצה
      updatedPermissions = currentRole.permissions.filter((p: string) => !groupPermissionIds.includes(p));
    }
    
    setCurrentRole({
      ...currentRole,
      permissions: updatedPermissions
    });
  };

  // בדיקה האם כל ההרשאות בקבוצה מסומנות
  const isGroupChecked = (groupKey: string) => {
    const group = permissionGroups.find(g => g.key === groupKey);
    if (!group) return false;
    
    return group.permissions.every(p => currentRole?.permissions.includes(p.id));
  };

  // בדיקה האם חלק מההרשאות בקבוצה מסומנות
  const isGroupIndeterminate = (groupKey: string) => {
    const group = permissionGroups.find(g => g.key === groupKey);
    if (!group) return false;
    
    const checkedCount = group.permissions.filter(p => currentRole?.permissions.includes(p.id)).length;
    return checkedCount > 0 && checkedCount < group.permissions.length;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">תפקידים והרשאות</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRole}
        >
          תפקיד חדש
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
          {alertMessage}
        </Alert>
      </Collapse>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab icon={<GroupIcon />} label="תפקידים" />
          <Tab icon={<SecurityIcon />} label="מדיניות אבטחה" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>שם התפקיד</TableCell>
                <TableCell>תיאור</TableCell>
                <TableCell>משתמשים</TableCell>
                <TableCell>הרשאות</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{role.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {role.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>{role.usersCount}</TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      <Chip 
                        size="small" 
                        label={`${role.permissions.length} הרשאות`}
                        color="primary"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="עריכה">
                      <IconButton onClick={() => handleEditRole(role)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחיקה">
                      <IconButton 
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.usersCount > 0}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            הגדרות מדיניות אבטחה
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            הגדרות אלה קובעות את המדיניות הכללית של המערכת בנושא הרשאות.
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="אכיפת הרשאות קפדנית"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                כאשר מופעל, גישה לדפים תחסם לחלוטין למשתמשים ללא הרשאות מתאימות
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="הסתרת אלמנטים ללא הרשאה"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                כאשר מופעל, אלמנטים בממשק המשתמש יוסתרו אוטומטית ממשתמשים ללא הרשאות מתאימות
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch />}
                label="החלת הרשאות גם על API פנימי"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                כאשר מופעל, בדיקות הרשאה יחולו גם על קריאות API פנימיות
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch />}
                label="דרישת הרשאות מפורשות לכל פעולה"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                כאשר מופעל, כל פעולה במערכת תדרוש הרשאה מפורשת (מחמיר)
              </Typography>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button variant="contained" color="primary">
                שמירת הגדרות
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* דיאלוג תפקיד */}
      <Dialog
        open={showRoleDialog}
        onClose={() => setShowRoleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'עריכת תפקיד' : 'יצירת תפקיד חדש'}
        </DialogTitle>
        <DialogContent dividers>
          {currentRole && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="שם התפקיד"
                  value={currentRole.name}
                  onChange={(e) => setCurrentRole({...currentRole, name: e.target.value})}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="מזהה (ID)"
                  value={currentRole.id}
                  onChange={(e) => setCurrentRole({...currentRole, id: e.target.value})}
                  required
                  disabled={isEditing}
                  helperText={isEditing ? 'לא ניתן לשנות מזהה של תפקיד קיים' : 'מזהה ייחודי לתפקיד, באנגלית בלבד'}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="תיאור"
                  value={currentRole.description}
                  onChange={(e) => setCurrentRole({...currentRole, description: e.target.value})}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  הרשאות
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {permissionGroups.map((group) => (
                  <Box key={group.key} sx={{ mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isGroupChecked(group.key)}
                          indeterminate={isGroupIndeterminate(group.key)}
                          onChange={(e) => handleTogglePermissionGroup(group.key, e.target.checked)}
                        />
                      }
                      label={<Typography variant="subtitle2">{group.name}</Typography>}
                    />
                    
                    <Box sx={{ pl: 4 }}>
                      <FormGroup>
                        {group.permissions.map((permission) => (
                          <FormControlLabel
                            key={permission.id}
                            control={
                              <Checkbox
                                checked={currentRole.permissions.includes(permission.id)}
                                onChange={() => handleTogglePermission(permission.id)}
                                size="small"
                              />
                            }
                            label={permission.name}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRoleDialog(false)}>ביטול</Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSaveRole}
          >
            שמירה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Permissions; 