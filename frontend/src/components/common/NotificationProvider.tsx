import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextProps {
  showNotification: (message: string, type?: NotificationType) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextProps>({
  showNotification: () => {},
  hideNotification: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setMessage(message);
    setType(type);
    setOpen(true);
  };

  const hideNotification = () => {
    setOpen(false);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext); 