import React, { createContext, useContext, ReactNode } from 'react';
import { useToast, UseToastOptions } from '@chakra-ui/react';

// יצירת טיפוס להודעות
interface NotificationContextType {
  showNotification: (options: UseToastOptions) => void;
}

// יצירת הקונטקסט
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Props של הפרוביידר
interface NotificationProviderProps {
  children: ReactNode;
}

// קומפוננטת הפרוביידר
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const toast = useToast();

  // פונקציה להצגת הודעות
  const showNotification = (options: UseToastOptions) => {
    toast({
      position: 'top',
      duration: 3000,
      isClosable: true,
      ...options,
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// הוק לשימוש בקונטקסט
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 