import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material'
import { useToast } from '@/components/common/Toaster'
import axios from '@/utils/axios'
import { useAuth } from '@/hooks/useAuth'

const Login = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [is2FALoading, setIs2FALoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    code: '',
  })

  const validateForm = () => {
    const newErrors = { ...errors }
    let isValid = true

    if (!formData.email) {
      newErrors.email = 'אימייל הוא שדה חובה'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'כתובת האימייל אינה תקינה'
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = 'סיסמה היא שדה חובה'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      try {
        console.log('מתחיל תהליך התחברות עם:', formData.email)
        await login(formData.email, formData.password)
        
        // נחכה רגע קצר כדי לאפשר לסטייט להתעדכן
        setTimeout(() => {
          const user = localStorage.getItem('token')
          if (user) {
            showToast('התחברת בהצלחה', 'success')
            console.log('מפנה את המשתמש לדף הבית...')
            navigate('/')
          } else {
            showToast('התחברות נכשלה', 'error')
          }
          setIsLoading(false)
        }, 500)
        
      } catch (error: any) {
        console.error('שגיאה בתהליך התחברות:', error)
        showToast(error.message || 'שגיאה בהתחברות', 'error')
        setIsLoading(false)
      }
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode) {
      setErrors((prev) => ({ ...prev, code: 'קוד אימות הוא שדה חובה' }))
      return
    }
    
    setIs2FALoading(true)
    try {
      const response = await axios.post('/api/auth/verify-2fa', { 
        code: verificationCode 
      })
      showToast('התחברת בהצלחה', 'success')
      setShow2FADialog(false)
      navigate('/')
    } catch (error: any) {
      showToast(error.message || 'קוד האימות שגוי', 'error')
      setErrors((prev) => ({ ...prev, code: 'קוד האימות שגוי' }))
    } finally {
      setIs2FALoading(false)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 'sm' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography component="h1" variant="h5" gutterBottom>
          התחברות
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ברוכים הבאים חזרה! אנא הזינו את פרטי ההתחברות שלכם
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="אימייל"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={!!errors.email}
            helperText={errors.email}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="סיסמה"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={!!errors.password}
            helperText={errors.password}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                />
              }
              label="זכור אותי"
            />
            <Link
              component={RouterLink}
              to="/auth/forgot-password"
              variant="body2"
            >
              שכחת סיסמה?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'התחבר'
            )}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          אין לך חשבון?{' '}
          <Link component={RouterLink} to="/auth/register">
            הירשם עכשיו
          </Link>
        </Typography>
      </Box>

      {/* דיאלוג אימות דו-שלבי */}
      <Dialog
        open={show2FADialog}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>אימות דו-שלבי</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              הזן את קוד האימות מאפליקציית האימות שלך
            </Alert>
            <form onSubmit={handle2FASubmit}>
              <TextField
                fullWidth
                label="קוד אימות"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value)
                  setErrors((prev) => ({ ...prev, code: '' }))
                }}
                error={!!errors.code}
                helperText={errors.code}
                disabled={is2FALoading}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={is2FALoading}
              >
                {is2FALoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'אמת'
                )}
              </Button>
            </form>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default Login 