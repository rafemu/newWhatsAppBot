import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
  Divider,
  Tab,
  Tabs,
  Alert,
  Collapse,
  FormControlLabel,
  Switch,
  Pagination,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { apiService } from '@/services/api';
import { UserRole } from '@/types/user';

// מיפוי תפקידים
const roleMapping = {
  [UserRole.SUPER_ADMIN]: 'מנהל מערכת עליון',
  [UserRole.ADMIN]: 'מנהל מערכת',
  [UserRole.MANAGER]: 'מנהל',
  [UserRole.AGENT]: 'נציג',
  [UserRole.VIEWER]: 'צופה'
};

// ממשק לנתוני משתמש כפי שמוצגים בטבלה
interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt?: string;
  password?: string;
  confirmPassword?: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // פונקציה לטעינת המשתמשים מהשרת
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getUsers();
      console.log('תגובת שרת:', response);
      
      if (response.status === 'success' && response.data && response.data.users) {
        // המרת הנתונים מהשרת למבנה הנדרש בממשק
        const formattedUsers = response.data.users.map((user: any) => {
          // פיצול השם לשם פרטי ושם משפחה
          const nameParts = user.name?.split(' ') || [''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          return {
            id: user.id || user._id,
            firstName,
            lastName,
            email: user.email,
            phone: user.phoneNumber || '',
            role: user.role,
            status: user.isActive !== false ? 'active' : 'inactive', // אם isActive לא מוגדר, נניח שהמשתמש פעיל
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          };
        });
        
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        console.log('נטענו משתמשים:', formattedUsers);
      } else {
        console.error('תגובת שרת לא תקינה:', response);
        setAlertMessage('שגיאה בטעינת המשתמשים');
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error('שגיאה בטעינת המשתמשים:', error);
      setAlertMessage('שגיאה בטעינת המשתמשים');
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // סינון לפי לשונית
    if (newValue === 0) { // כל המשתמשים
      setStatusFilter('all');
      applyFilters(searchTerm, 'all', roleFilter);
    } else if (newValue === 1) { // משתמשים פעילים
      setStatusFilter('active');
      applyFilters(searchTerm, 'active', roleFilter);
    } else if (newValue === 2) { // משתמשים לא פעילים
      setStatusFilter('inactive');
      applyFilters(searchTerm, 'inactive', roleFilter);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    applyFilters(searchTerm, statusFilter, roleFilter);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newFilter = event.target.value as string;
    setStatusFilter(newFilter);
    applyFilters(searchTerm, newFilter, roleFilter);
  };

  const handleRoleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newFilter = event.target.value as string;
    setRoleFilter(newFilter);
    applyFilters(searchTerm, statusFilter, newFilter);
  };

  const applyFilters = (search: string, status: string, role: string) => {
    let result = [...users];

    if (search) {
      result = result.filter(
        user =>
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          (user.phone && user.phone.includes(search))
      );
    }

    if (status !== 'all') {
      result = result.filter(user => user.status === status);
    }

    if (role !== 'all') {
      result = result.filter(user => user.role === role);
    }

    setFilteredUsers(result);
    setPage(1);
  };

  const refreshUsersList = async () => {
    await fetchUsers();
    setAlertMessage('רשימת המשתמשים עודכנה');
    setAlertSeverity('success');
    setAlertOpen(true);
    setTimeout(() => setAlertOpen(false), 3000);
  };

  const handleAddUser = () => {
    setCurrentUser({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: UserRole.VIEWER,
      status: 'active',
      password: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setShowUserDialog(true);
  };

  const handleEditUser = (user: any) => {
    setCurrentUser({
      ...user,
      password: '',
      confirmPassword: ''
    });
    setIsEditing(true);
    setShowUserDialog(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
      try {
        await apiService.deleteUser(userId);
        
        // מחיקת המשתמש מהמערך המקומי
        const newUsers = users.filter(user => user.id !== userId);
        setUsers(newUsers);
        setFilteredUsers(newUsers.filter(user => 
          (statusFilter === 'all' || user.status === statusFilter) &&
          (roleFilter === 'all' || user.role === roleFilter)
        ));
        
        setAlertMessage('המשתמש נמחק בהצלחה');
        setAlertSeverity('success');
        setAlertOpen(true);
        setTimeout(() => setAlertOpen(false), 3000);
      } catch (error) {
        console.error('שגיאה במחיקת המשתמש:', error);
        setAlertMessage('שגיאה במחיקת המשתמש');
        setAlertSeverity('error');
        setAlertOpen(true);
        setTimeout(() => setAlertOpen(false), 3000);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const targetUser = users.find(user => user.id === userId);
      if (!targetUser) return;
      
      const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
      
      // עדכון הסטטוס בשרת
      // במקרה זה אנחנו רק משנים את הסטטוס ב-UI, כיוון שאין נקודת קצה ספציפית לעדכון סטטוס
      
      // עדכון המצב המקומי
      const newUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, status: newStatus };
        }
        return user;
      });
      
      setUsers(newUsers);
      setFilteredUsers(newUsers.filter(user => 
        (statusFilter === 'all' || user.status === statusFilter) &&
        (roleFilter === 'all' || user.role === roleFilter)
      ));
      
      setAlertMessage(`סטטוס המשתמש שונה ל${newStatus === 'active' ? 'פעיל' : 'לא פעיל'}`);
      setAlertSeverity('success');
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    } catch (error) {
      console.error('שגיאה בעדכון סטטוס המשתמש:', error);
      setAlertMessage('שגיאה בעדכון סטטוס המשתמש');
      setAlertSeverity('error');
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    }
  };

  const validateForm = () => {
    if (!currentUser.firstName.trim()) {
      setAlertMessage('נא להזין שם פרטי');
      setAlertSeverity('error');
      setAlertOpen(true);
      return false;
    }
    
    if (!currentUser.lastName.trim()) {
      setAlertMessage('נא להזין שם משפחה');
      setAlertSeverity('error');
      setAlertOpen(true);
      return false;
    }
    
    if (!currentUser.email.trim() || !/\S+@\S+\.\S+/.test(currentUser.email)) {
      setAlertMessage('נא להזין כתובת אימייל תקינה');
      setAlertSeverity('error');
      setAlertOpen(true);
      return false;
    }
    
    if (!isEditing && (!currentUser.password || currentUser.password.length < 8)) {
      setAlertMessage('נא להזין סיסמה באורך 8 תווים לפחות');
      setAlertSeverity('error');
      setAlertOpen(true);
      return false;
    }
    
    if (!isEditing && currentUser.password !== currentUser.confirmPassword) {
      setAlertMessage('הסיסמאות אינן תואמות');
      setAlertSeverity('error');
      setAlertOpen(true);
      return false;
    }
    
    return true;
  };

  const handleSaveUser = async () => {
    if (!validateForm()) return;
    
    try {
      if (isEditing) {
        // עדכון משתמש קיים
        const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
        
        // עדכון פרטי המשתמש
        await apiService.updateUser(currentUser.id, {
          name: fullName,
          email: currentUser.email
        });
        
        // עדכון התפקיד אם השתנה
        const originalUser = users.find(user => user.id === currentUser.id);
        if (originalUser && originalUser.role !== currentUser.role) {
          await apiService.updateUserRole(currentUser.id, currentUser.role);
        }
        
        // עדכון הרשימה המקומית
        const updatedUser = {
          ...currentUser,
          name: fullName
        };
        
        const newUsers = users.map(user => user.id === currentUser.id ? updatedUser : user);
        setUsers(newUsers);
        setFilteredUsers(newUsers.filter(user => 
          (statusFilter === 'all' || user.status === statusFilter) &&
          (roleFilter === 'all' || user.role === roleFilter)
        ));
        
        setAlertMessage('המשתמש עודכן בהצלחה');
      } else {
        // הוספת משתמש חדש
        const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
        
        const response = await apiService.createUser({
          email: currentUser.email,
          password: currentUser.password,
          name: fullName,
          role: currentUser.role
        });
        
        if (response.status === 'success' && response.data.user) {
          // יצירת אובייקט המשתמש החדש
          const newUser = {
            id: response.data.user.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            phone: currentUser.phone || '',
            role: currentUser.role,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: null
          };
          
          const newUsers = [...users, newUser];
          setUsers(newUsers);
          setFilteredUsers(newUsers.filter(user => 
            (statusFilter === 'all' || user.status === statusFilter) &&
            (roleFilter === 'all' || user.role === roleFilter)
          ));
          
          setAlertMessage('המשתמש נוצר בהצלחה');
        }
      }
      
      setAlertSeverity('success');
      setAlertOpen(true);
      setShowUserDialog(false);
      setTimeout(() => setAlertOpen(false), 3000);
    } catch (error: any) {
      console.error('שגיאה בשמירת המשתמש:', error);
      const errorMessage = error.response?.data?.message || 'שגיאה בשמירת המשתמש';
      setAlertMessage(errorMessage);
      setAlertSeverity('error');
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    try {
      await apiService.resetPassword(email);
      
      setAlertMessage(`נשלח איפוס סיסמה לכתובת ${email}`);
      setAlertSeverity('success');
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    } catch (error) {
      console.error('שגיאה בשליחת איפוס סיסמה:', error);
      setAlertMessage('שגיאה בשליחת איפוס סיסמה');
      setAlertSeverity('error');
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    }
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'לא התחבר/ה';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('he-IL', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } catch (e) {
      console.error('שגיאה בפירוק התאריך:', e);
      return 'תאריך לא תקין';
    }
  };

  const getRoleName = (roleId: string) => {
    const role = roleMapping[roleId as UserRole];
    return role ? role : roleId;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'פעיל' : 'לא פעיל';
  };

  const getCurrentPageItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">ניהול משתמשים</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          משתמש חדש
        </Button>
      </Box>

      <Collapse in={alertOpen}>
        <Alert 
          severity={alertSeverity}
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

      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="חיפוש לפי שם, אימייל או טלפון"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>סטטוס</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="סטטוס"
              >
                <MenuItem value="all">הכל</MenuItem>
                <MenuItem value="active">פעיל</MenuItem>
                <MenuItem value="inactive">לא פעיל</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>תפקיד</InputLabel>
              <Select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                label="תפקיד"
              >
                <MenuItem value="all">הכל</MenuItem>
                {Object.keys(roleMapping).map(role => (
                  <MenuItem key={role} value={role}>
                    {roleMapping[role as UserRole]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refreshUsersList}
            >
              רענון
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="כל המשתמשים" />
          <Tab label="משתמשים פעילים" />
          <Tab label="משתמשים לא פעילים" />
        </Tabs>
      </Paper>

      <Paper>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>משתמש</TableCell>
                    <TableCell>אימייל</TableCell>
                    <TableCell>טלפון</TableCell>
                    <TableCell>תפקיד</TableCell>
                    <TableCell>סטטוס</TableCell>
                    <TableCell>כניסה אחרונה</TableCell>
                    <TableCell>פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentPageItems().map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {user.firstName ? user.firstName.charAt(0) : '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              נוצר: {formatDate(user.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={roleMapping[user.role as UserRole] || user.role} 
                          size="small" 
                          color={user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN ? 'secondary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(user.status)} 
                          size="small"
                          color={getStatusColor(user.status) as any}
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.lastLogin)}</TableCell>
                      <TableCell>
                        <Tooltip title="עריכה">
                          <IconButton onClick={() => handleEditUser(user)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.status === 'active' ? 'השבתה' : 'הפעלה'}>
                          <IconButton onClick={() => handleToggleUserStatus(user.id)}>
                            {user.status === 'active' ? <LockIcon /> : <LockOpenIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="מחיקה">
                          <IconButton onClick={() => handleDeleteUser(user.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body1" py={3}>
                          לא נמצאו משתמשים
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {filteredUsers.length > 0 && totalPages > 1 && (
              <Box display="flex" justifyContent="center" p={2}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handleChangePage} 
                  color="primary" 
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* דיאלוג משתמש */}
      <Dialog
        open={showUserDialog}
        onClose={() => setShowUserDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'עריכת משתמש' : 'הוספת משתמש חדש'}
        </DialogTitle>
        <DialogContent dividers>
          {currentUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="שם פרטי"
                  value={currentUser.firstName}
                  onChange={(e) => setCurrentUser({...currentUser, firstName: e.target.value})}
                  required
                  error={!currentUser.firstName.trim()}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="שם משפחה"
                  value={currentUser.lastName}
                  onChange={(e) => setCurrentUser({...currentUser, lastName: e.target.value})}
                  required
                  error={!currentUser.lastName.trim()}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="דואר אלקטרוני"
                  type="email"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  required
                  error={!currentUser.email.trim() || !/\S+@\S+\.\S+/.test(currentUser.email)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="טלפון"
                  value={currentUser.phone}
                  onChange={(e) => setCurrentUser({...currentUser, phone: e.target.value})}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>תפקיד</InputLabel>
                  <Select
                    value={currentUser.role}
                    onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                    label="תפקיד"
                  >
                    {Object.keys(roleMapping).map(role => (
                      <MenuItem key={role} value={role}>
                        {roleMapping[role as UserRole]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>סטטוס</InputLabel>
                  <Select
                    value={currentUser.status}
                    onChange={(e) => setCurrentUser({...currentUser, status: e.target.value})}
                    label="סטטוס"
                  >
                    <MenuItem value="active">פעיל</MenuItem>
                    <MenuItem value="inactive">לא פעיל</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              {!isEditing ? (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="סיסמה"
                      type={showPassword ? 'text' : 'password'}
                      value={currentUser.password}
                      onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
                      required
                      error={!currentUser.password || currentUser.password.length < 8}
                      helperText="לפחות 8 תווים"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="אימות סיסמה"
                      type={showPassword ? 'text' : 'password'}
                      value={currentUser.confirmPassword}
                      onChange={(e) => setCurrentUser({...currentUser, confirmPassword: e.target.value})}
                      required
                      error={currentUser.password !== currentUser.confirmPassword}
                      helperText={currentUser.password !== currentUser.confirmPassword ? 'הסיסמאות אינן תואמות' : ''}
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      variant="outlined"
                      startIcon={<LockOpenIcon />}
                      onClick={() => handleSendPasswordReset(currentUser.email)}
                    >
                      שליחת איפוס סיסמה
                    </Button>
                    <Typography variant="caption" color="textSecondary">
                      הודעת איפוס סיסמה תישלח לדואר האלקטרוני של המשתמש
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserDialog(false)}>ביטול</Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSaveUser}
          >
            שמירה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 