import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  LinearProgress,
  Alert,
  Fade,
} from '@mui/material'
import { Visibility, VisibilityOff, Lock, ArrowBack } from '@mui/icons-material'
import { useToast } from '@/components/common/Toaster'
import { useResetPasswordMutation } from '@/services/auth'

interface PasswordStrength {
  score: number
  feedback: string
  color: string
}

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  })
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: '',
    color: 'error.main',
  })

  const token = searchParams.get('token')

  const resetPasswordMutation = useResetPasswordMutation({
    onSuccess: () => {
      showToast('Password successfully reset!', 'success')
      navigate('/auth/login')
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to reset password', 'error')
    },
  })

  useEffect(() => {
    if (!token) {
      showToast('Invalid or expired reset token', 'error')
      navigate('/auth/forgot-password')
    }
  }, [token, navigate, showToast])

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required'
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number'
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Password must contain at least one special character'
    }
    return ''
  }

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, feedback: 'Password is required', color: 'error.main' }
    }

    let score = 0
    let feedback = ''

    // Length check
    if (password.length >= 8) score++
    if (password.length >= 12) score++

    // Character type checks
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    // Determine feedback and color based on score
    switch (score) {
      case 0:
      case 1:
        feedback = 'Very weak'
        return { score: 20, feedback, color: 'error.main' }
      case 2:
        feedback = 'Weak'
        return { score: 40, feedback, color: 'error.light' }
      case 3:
        feedback = 'Fair'
        return { score: 60, feedback, color: 'warning.main' }
      case 4:
        feedback = 'Good'
        return { score: 80, feedback, color: 'success.light' }
      default:
        feedback = 'Strong'
        return { score: 100, feedback, color: 'success.main' }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear errors when typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setErrors((prev) => ({
        ...prev,
        password: passwordError,
      }))
      return
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }))
      return
    }

    resetPasswordMutation.mutate({
      token: token!,
      password: formData.password,
    })
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 'sm' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please enter your new password below.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: 'background.default',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box>
            <TextField
              fullWidth
              label="New Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={resetPasswordMutation.isLoading}
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
            {formData.password && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength.score}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: passwordStrength.color,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: passwordStrength.color, mt: 0.5, display: 'block' }}
                >
                  Password strength: {passwordStrength.feedback}
                </Typography>
              </Box>
            )}
          </Box>

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={resetPasswordMutation.isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
            }}
          />

          {resetPasswordMutation.isError && (
            <Alert severity="error">
              {resetPasswordMutation.error?.message || 'An error occurred'}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={resetPasswordMutation.isLoading}
            sx={{ mt: 1 }}
          >
            {resetPasswordMutation.isLoading
              ? 'Resetting Password...'
              : 'Reset Password'}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component={RouterLink}
          to="/auth/login"
          variant="body2"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <ArrowBack fontSize="small" />
          Back to Sign In
        </Link>
      </Box>
    </Box>
  )
}

export default ResetPassword 