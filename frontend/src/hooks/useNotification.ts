import { useState } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationState {
  open: boolean;
  message: string;
  type: NotificationType;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info',
  });

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({
      open: true,
      message,
      type,
    });
  };

  const hideNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return {
    notification,
    showNotification,
    hideNotification,
  };
}; 