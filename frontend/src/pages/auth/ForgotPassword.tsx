import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  InputAdornment,
  Alert,
  Collapse,
  Fade,
} from '@mui/material'
import { Email, ArrowBack } from '@mui/icons-material'
import { useToast } from '@/components/common/Toaster'
import { useForgotPasswordMutation } from '@/services/auth'

const ForgotPassword = () => {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const forgotPasswordMutation = useForgotPasswordMutation({
    onSuccess: () => {
      setIsSuccess(true)
      showToast('Reset instructions sent to your email', 'success')
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to send reset instructions')
      showToast(error.message || 'Failed to send reset instructions', 'error')
    },
  })

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required'
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Invalid email format'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }
    setError('')
    forgotPasswordMutation.mutate({ email })
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 'sm' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your email address and we'll send you instructions to reset your
          password.
        </Typography>
      </Box>

      <Collapse in={!isSuccess}>
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
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              error={!!error}
              helperText={error}
              disabled={forgotPasswordMutation.isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={forgotPasswordMutation.isLoading}
              sx={{ mt: 1 }}
            >
              {forgotPasswordMutation.isLoading
                ? 'Sending Instructions...'
                : 'Send Instructions'}
            </Button>
          </Box>
        </Paper>
      </Collapse>

      <Fade in={isSuccess}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: 'success.light',
            color: 'success.contrastText',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Check Your Email
          </Typography>
          <Typography variant="body2" paragraph>
            We've sent password reset instructions to {email}. Please check your
            email and follow the instructions to reset your password.
          </Typography>
          <Typography variant="body2">
            Didn't receive the email? Check your spam folder or{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => setIsSuccess(false)}
              sx={{ color: 'inherit', textDecoration: 'underline' }}
            >
              try again
            </Link>
          </Typography>
        </Paper>
      </Fade>

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

export default ForgotPassword 