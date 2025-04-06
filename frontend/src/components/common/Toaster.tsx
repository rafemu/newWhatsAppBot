import React, { createContext, useContext, useState, useCallback } from 'react'
import { Snackbar, Alert, AlertColor } from '@mui/material'

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor) => void
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
})

export const useToast = () => useContext(ToastContext)

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<AlertColor>('info')

  const showToast = useCallback((message: string, severity: AlertColor = 'info') => {
    setMessage(message)
    setSeverity(severity)
    setOpen(true)
  }, [])

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

interface ToasterProps {
  open?: boolean;
  message?: string;
  type?: AlertColor;
  onClose?: () => void;
  autoHideDuration?: number;
}

export const Toaster: React.FC<ToasterProps> = ({
  open = false,
  message = '',
  type = 'info',
  onClose,
  autoHideDuration = 6000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert onClose={onClose} severity={type} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}; 