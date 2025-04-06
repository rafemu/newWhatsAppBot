import React, { useContext } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid,
  Typography,
  Avatar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  useTheme,
  IconButton,
  Button,
  LinearProgress 
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  WhatsApp as WhatsAppIcon, 
  Chat as ChatIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  // Sample data for dashboard
  const stats = [
    { 
      id: 1, 
      title: 'סה"כ צ\'אטים', 
      value: 184, 
      icon: <ChatIcon fontSize="large" />, 
      color: theme.palette.primary.main,
      bgColor: `${theme.palette.primary.main}15`,
      change: '+12%'
    },
    { 
      id: 2, 
      title: 'משתמשים פעילים', 
      value: 1254, 
      icon: <GroupIcon fontSize="large" />, 
      color: theme.palette.secondary.main,
      bgColor: `${theme.palette.secondary.main}15`,
      change: '+5%'
    },
    { 
      id: 3, 
      title: 'הודעות שנשלחו', 
      value: 8743, 
      icon: <WhatsAppIcon fontSize="large" />, 
      color: '#4CAF50',
      bgColor: '#4CAF5015',
      change: '+18%'
    },
    { 
      id: 4, 
      title: 'שיעור מענה', 
      value: '94%', 
      icon: <CheckCircleIcon fontSize="large" />, 
      color: '#FF9800',
      bgColor: '#FF980015',
      change: '+2%'
    }
  ];

  const recentChats = [
    { 
      id: 1, 
      name: 'קבוצת תמיכה טכנית', 
      lastMessage: 'תודה על העזרה, הבעיה נפתרה', 
      time: '10:45', 
      unread: 0, 
      avatar: null,
      status: 'active'
    },
    { 
      id: 2, 
      name: 'משתמש חדש', 
      lastMessage: 'מבקש הסבר על תהליך ההרשמה', 
      time: '09:32', 
      unread: 3, 
      avatar: null,
      status: 'active'
    },
    { 
      id: 3, 
      name: 'צוות פיתוח', 
      lastMessage: 'עדכון גרסה 2.0 זמין להתקנה', 
      time: 'אתמול', 
      unread: 0, 
      avatar: null,
      status: 'active'
    },
    { 
      id: 4, 
      name: 'שיווק ומכירות', 
      lastMessage: 'הזמנות חדשות ממתינות לאישור', 
      time: 'אתמול', 
      unread: 5, 
      avatar: null,
      status: 'active'
    }
  ];

  const pendingTasks = [
    { 
      id: 1, 
      title: 'שליחת עדכון לכל המשתמשים', 
      progress: 75, 
      dueDate: 'היום, 17:00'
    },
    { 
      id: 2, 
      title: 'אימות משתמשים חדשים', 
      progress: 30, 
      dueDate: 'מחר, 12:00'
    },
    { 
      id: 3, 
      title: 'עדכון מסמכי מדיניות', 
      progress: 90, 
      dueDate: 'יום ה\', 10:00'
    }
  ];

  const systemStatus = [
    { name: 'שרת API', status: 'online' },
    { name: 'חיבור WhatsApp', status: 'online' },
    { name: 'בסיס נתונים', status: 'online' },
    { name: 'שירות קבצים', status: 'warning' }
  ];

  return (
    <Box sx={{ 
      py: 3,
      height: '100%',
      overflow: 'auto'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
    <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            שלום, {user?.name || 'משתמש'}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            ברוך הבא למערכת ניהול הוואטסאפ. להלן סקירה כללית של המערכת.
      </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />}
          sx={{ borderRadius: 8 }}
        >
          רענון נתונים
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map(stat => (
          <Grid item xs={12} sm={6} md={3} key={stat.id}>
            <Card sx={{ 
                height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      width: 48,
                      height: 48
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: theme.palette.background.default,
                    borderRadius: 4,
                    px: 1,
                    py: 0.5
                  }}>
                    <TrendingUpIcon 
                      fontSize="small" 
                      sx={{ 
                        color: 'success.main',
                        mr: 0.5,
                        fontSize: '1rem' 
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 'medium',
                        color: 'success.main'
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.title}
              </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Main Dashboard Content */}
      <Grid container spacing={3}>
        {/* Recent Chats */}
        <Grid item xs={12} md={6} lg={5}>
          <Paper 
            sx={{ 
              height: '100%', 
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: `${theme.palette.primary.main}15`,
                    color: theme.palette.primary.main,
                    mr: 1.5
                  }}
                >
                  <ChatIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  צ'אטים אחרונים
                </Typography>
              </Box>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <List sx={{ py: 0 }}>
              {recentChats.map(chat => (
                <React.Fragment key={chat.id}>
                  <ListItem 
                    button 
                    alignItems="flex-start"
                    sx={{ 
                      py: 2,
                      px: 2,
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: theme.palette.action.hover
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color={chat.status === 'active' ? 'success' : 'default'}
                      >
                        <Avatar 
                          alt={chat.name} 
                          src={chat.avatar || undefined}
                          sx={{ bgcolor: theme.palette.primary.main }}
                        >
                          {chat.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {chat.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {chat.time}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              display: 'inline',
                              maxWidth: '70%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {chat.lastMessage}
                          </Typography>
                          {chat.unread > 0 && (
                            <Badge 
                              badgeContent={chat.unread} 
                              color="primary"
                              sx={{ 
                                '& .MuiBadge-badge': {
                                  fontSize: '0.7rem',
                                  height: 18,
                                  minWidth: 18,
                                  borderRadius: 9
                                }
                              }}
                            />
                          )}
                </Box>
                      }
                    />
                  </ListItem>
                  <Divider component="li" sx={{ mr: 9, ml: 2 }} />
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                sx={{ borderRadius: 8 }}
              >
                הצג את כל הצ'אטים
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Tasks and Status */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper 
            sx={{ 
              height: '100%', 
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: `${theme.palette.warning.main}15`,
                    color: theme.palette.warning.main,
                    mr: 1.5
                  }}
                >
                  <PendingIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  משימות ממתינות
                </Typography>
              </Box>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
              </Box>
              
            <Box sx={{ p: 2, flexGrow: 1 }}>
              {pendingTasks.map(task => (
                <Box key={task.id} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">{task.title}</Typography>
                    <Typography variant="caption" color="textSecondary">{task.dueDate}</Typography>
                </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                        value={task.progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: theme.palette.background.default,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: task.progress > 75 
                              ? theme.palette.success.main 
                              : task.progress > 30 
                                ? theme.palette.warning.main 
                                : theme.palette.primary.main
                          }
                        }}
                />
              </Box>
                    <Typography variant="body2" color="textSecondary">
                      {task.progress}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider />
            
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                סטטוס מערכת
              </Typography>
              <Grid container spacing={2}>
                {systemStatus.map((system, index) => (
                  <Grid item xs={6} key={index}>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: theme.palette.background.default,
                      }}
                    >
                      {system.status === 'online' ? (
                        <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                      ) : system.status === 'warning' ? (
                        <ErrorIcon sx={{ color: 'warning.main', mr: 1, fontSize: 20 }} />
                      ) : (
                        <ErrorIcon sx={{ color: 'error.main', mr: 1, fontSize: 20 }} />
                      )}
                      <Typography variant="body2" noWrap>
                        {system.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              </Box>
          </Paper>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12} md={12} lg={3}>
          <Grid container spacing={3} direction="column" height="100%">
            <Grid item xs>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  פעולות מהירות
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<WhatsAppIcon />}
                    fullWidth
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2,
                      justifyContent: 'flex-start' 
                    }}
                  >
                    שליחת הודעה חדשה
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<GroupIcon />}
                    fullWidth
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2,
                      justifyContent: 'flex-start'
                    }}
                  >
                    יצירת קבוצה חדשה
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<DashboardIcon />}
                    fullWidth
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2,
                      justifyContent: 'flex-start'
                    }}
                  >
                    ניהול תבניות הודעה
                  </Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  height: '100%'
                }}
              >
                <WhatsAppIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  מצב חיבור
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                  WhatsApp API מחובר ופעיל
                </Typography>
                <Box 
                  sx={{ 
                    mt: 'auto', 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                    מחובר מזה: 14 ימים
              </Typography>
                  <CheckCircleIcon fontSize="small" />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 