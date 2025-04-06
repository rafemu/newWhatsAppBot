import { useContext } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Badge, 
  Avatar, 
  Menu, 
  MenuItem, 
  useTheme,
  alpha,
  Button,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon, 
  WhatsApp as WhatsAppIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Settings as SettingsIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  open: boolean;
  onDrawerToggle: () => void;
}

const Header = ({ open, onDrawerToggle }: HeaderProps) => {
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  const { user } = authContext;
  const themeContext = useContext(ThemeContext);
  const { toggleTheme, mode } = themeContext;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme => theme.zIndex.drawer + 1,
        transition: theme => theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        mr: { xs: 0, sm: open ? `${270}px` : 0 }, 
        width: { xs: '100%', sm: open ? `calc(100% - ${270}px)` : '100%' },
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
        background: theme => alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ 
            mr: 2,
            color: theme.palette.text.primary
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <WhatsAppIcon sx={{ 
          display: { xs: 'none', md: 'block' }, 
          mr: 1.5, 
          color: theme.palette.primary.main,
          fontSize: 28 
        }} />
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            display: { xs: 'none', md: 'block' }, 
            color: theme.palette.text.primary,
            fontWeight: 'bold',
            flexGrow: 1
          }}
        >
          WhatsApp Bot Manager
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={mode === 'dark' ? 'מצב בהיר' : 'מצב כהה'}>
            <IconButton 
              onClick={toggleTheme} 
              sx={{ 
                mx: 1,
                color: theme.palette.text.primary
              }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="התראות">
            <IconButton 
              size="large" 
              aria-label="התראות חדשות" 
              color="inherit" 
              onClick={handleNotificationsOpen}
              sx={{ color: theme.palette.text.primary }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationsAnchor}
            id="notifications-menu"
            keepMounted
            open={Boolean(notificationsAnchor)}
            onClose={handleNotificationsClose}
            PaperProps={{
              sx: {
                width: 320,
                maxHeight: 450,
                mt: 1.5,
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.15)',
                borderRadius: 2
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">התראות</Typography>
              <Button size="small" color="primary">סמן הכל כנקרא</Button>
            </Box>
            <Divider />
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight="medium">הודעה חדשה מהמערכת</Typography>
                <Typography variant="caption" color="textSecondary">לפני 10 דקות</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight="medium">התקבלה תשובה חדשה בסקר</Typography>
                <Typography variant="caption" color="textSecondary">לפני שעה</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight="medium">עדכון גרסה חדשה זמין</Typography>
                <Typography variant="caption" color="textSecondary">לפני 3 שעות</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <Box sx={{ p: 1.5, textAlign: 'center' }}>
              <Button
                component={Link}
                to="/notifications"
                size="small"
                onClick={handleNotificationsClose}
              >
                הצג את כל ההתראות
              </Button>
            </Box>
          </Menu>

          <Tooltip title={user?.name || 'פרופיל משתמש'}>
            <IconButton
              size="large"
              edge="end"
              aria-label="תפריט משתמש"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              {user?.profileImage ? (
                <Avatar 
                  src={user.profileImage} 
                  alt={user.name || 'user'} 
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: theme.palette.primary.main
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              )}
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            id="profile-menu"
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                minWidth: 180,
                mt: 1.5,
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.15)',
                borderRadius: 2
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.name || 'משתמש'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                {user?.email || 'אימייל לא זמין'}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
              <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
              <Typography variant="body2">פרופיל</Typography>
            </MenuItem>
            <MenuItem onClick={handleMenuClose} component={Link} to="/settings">
              <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
              <Typography variant="body2">הגדרות</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 