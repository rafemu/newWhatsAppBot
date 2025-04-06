import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box,
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Paper,
  Divider,
  useTheme,
  IconButton,
  Avatar,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Chat as ChatIcon,
  Group as GroupIcon,
  FormatListBulleted as ListIcon,
  Add as AddIcon,
  WhatsApp as WhatsAppIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import {   FaBullhorn } from 'react-icons/fa';

const drawerWidth = 270;

interface SidebarProps {
  open: boolean;
}

const Sidebar = ({ open }: SidebarProps) => {
  const { pathname } = useLocation();
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  const { user, logout } = authContext;
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleMenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const menuItems = [
    {
      id: 'dashboard',
      title: 'דשבורד',
      icon: <DashboardIcon />,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      id: 'chats',
      title: ' שיחות',
      icon: <ChatIcon />,
      label: 'Chats',
      path: '/chats',
    },
    {
      id: 'surveys',
      title: 'סקרים',
      icon: <AssessmentIcon />,
      label: 'Surveys',
      path: '/surveys',
    },
    {
      id: 'campaigns',
      title: 'קמפיינים',
      icon: <FaBullhorn />,
      label: 'Campaigns',
      path: '/campaigns',
    },
    {
      title: 'ניהול משתמשים',
      icon: <PersonIcon />,
      permission: 'user:view',
      submenu: [
        { title: 'כל המשתמשים', path: '/admin/users', icon: <GroupIcon /> },
        { title: 'הרשאות', path: '/admin/permissions', icon: <ListIcon /> },
        { title: 'לוגים', path: '/admin/activity-logs', icon: <ListIcon /> }
      ]
    },
    {
      title: 'וואטסאפ',
      icon: <WhatsAppIcon />,
      permission: 'whatsapp:view',
      submenu: [
        { title: 'חיבורים', path: '/whatsapp', icon: <ListIcon /> }
      ]
    },
    {
      title: 'סקרים',
      icon: <ChatIcon />,
      permission: 'survey:view',
      submenu: [
        { title: 'כל הסקרים', path: '/surveys', icon: <ListIcon /> },
        { title: 'סקר חדש', path: '/surveys/new', icon: <AddIcon /> }
      ]
    },
    {
      title: 'הגדרות',
      path: '/settings',
      icon: <SettingsIcon />,
      permission: 'settings:view'
    }
  ];

  const isItemActive = (path?: string): boolean => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const filteredMenu = menuItems.filter(item => {
    // כרגע נציג את כל התפריטים ללא תלות בהרשאות
    return true;
    
    // לוגיקת הרשאות במקור (מושבתת כרגע):
    // const hasPermission = !item.permission || 
    //   (user?.permissions && user.permissions.includes(item.permission));
    // return hasPermission;
  });

    return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
            sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderLeft: 'none',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
          background: theme => theme.palette.background.paper,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            מערכת ניהול WhatsApp
          </Typography>
          <IconButton>
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
        
        <Divider />
        
        {user && (
          <Paper 
            elevation={0} 
            sx={{ 
              m: 2, 
              p: 2, 
              borderRadius: 2,
              background: theme.palette.background.default,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {user.name || 'משתמש'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
            </Box>
          </Paper>
        )}
        
        <Divider />
        
        <List sx={{ flexGrow: 1, overflow: 'auto', pt: 0 }}>
          {filteredMenu.map((item, index) => {
            const isActive = isItemActive(item.path);
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenu === item.title;

                return (
              <Box key={index}>
                <ListItem 
                  disablePadding 
                  component={hasSubmenu ? 'div' : Link} 
                  to={hasSubmenu ? undefined : item.path}
                  sx={{ 
                    display: 'block',
                    mb: 0.5,
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                    <ListItemButton
                    onClick={hasSubmenu ? () => toggleMenu(item.title) : undefined}
                    sx={{
                      minHeight: 48,
                      justifyContent: 'flex-start',
                      px: 2.5,
                      borderRadius: '0 10px 10px 0',
                      ml: 1,
                      bgcolor: isActive || isExpanded ? `${theme.palette.primary.main}15` : 'transparent',
                      '&:hover': {
                        bgcolor: isActive || isExpanded 
                          ? `${theme.palette.primary.main}25` 
                          : `${theme.palette.action.hover}`
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isActive || isExpanded ? theme.palette.primary.main : 'inherit'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      sx={{ 
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive || isExpanded ? 'bold' : 'normal',
                          color: isActive || isExpanded ? theme.palette.primary.main : 'inherit'
                        }
                      }}
                    />
                    {hasSubmenu && (
                      <ExpandMoreIcon 
                        sx={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: '0.3s',
                          color: isActive || isExpanded ? theme.palette.primary.main : 'inherit'
                        }} 
                      />
                    )}
                  </ListItemButton>
                </ListItem>
                
                {hasSubmenu && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.submenu?.map((subItem, subIndex) => {
                        const isSubActive = isItemActive(subItem.path);
                        return (
                          <ListItem
                            key={subIndex}
                            disablePadding
                            component={Link}
                            to={subItem.path}
                            sx={{ 
                              display: 'block',
                              color: 'inherit',
                              textDecoration: 'none'
                            }}
                          >
                            <ListItemButton
                              sx={{
                                minHeight: 40,
                                justifyContent: 'flex-start',
                                px: 2.5,
                                py: 0.75,
                                ml: 4,
                                mr: 3,
                                borderRadius: '0 8px 8px 0',
                                bgcolor: isSubActive ? `${theme.palette.primary.main}15` : 'transparent',
                                '&:hover': {
                                  bgcolor: isSubActive 
                                    ? `${theme.palette.primary.main}25` 
                                    : `${theme.palette.action.hover}`
                                }
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 32,
                                  color: isSubActive ? theme.palette.primary.main : 'inherit'
                                }}
                              >
                                {subItem.icon}
                      </ListItemIcon>
                              <ListItemText
                                primary={subItem.title}
                                sx={{ 
                                  '& .MuiListItemText-primary': {
                                    fontSize: '0.925rem',
                                    fontWeight: isSubActive ? 'bold' : 'normal',
                                    color: isSubActive ? theme.palette.primary.main : 'inherit'
                                  }
                                }}
                              />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        )}
              </Box>
            );
          })}
        </List>
        
        <Divider />
        
        <List>
          <ListItem disablePadding onClick={logout} sx={{ display: 'block', mb: 0.5 }}>
            <ListItemButton
      sx={{
                minHeight: 48,
                justifyContent: 'flex-start',
                px: 2.5,
                borderRadius: '0 10px 10px 0',
                ml: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="התנתק" sx={{ color: theme.palette.error.main }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 