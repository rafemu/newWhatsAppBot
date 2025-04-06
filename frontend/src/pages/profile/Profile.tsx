import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Edit,
  PhotoCamera,
  Save,
  Cancel,
  Lock,
  Delete,
  Warning,
} from '@mui/icons-material'
import { useToast } from '@/components/common/Toaster'
import { useAuth } from '@/hooks/useAuth'
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useUpdateAvatarMutation,
} from '@/services/user'
import TwoFactorSetup from '@/components/auth/TwoFactorSetup'

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const Profile = () => {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const updateProfileMutation = useUpdateProfileMutation({
    onSuccess: () => {
      showToast('פרופיל עודכן בהצלחה', 'success')
      setIsEditing(false)
    },
    onError: (error: any) => {
      showToast(error.message || 'שגיאה בעדכון הפרופיל', 'error')
    },
  })

  const changePasswordMutation = useChangePasswordMutation({
    onSuccess: () => {
      showToast('הסיסמה שונתה בהצלחה', 'success')
      setShowPasswordDialog(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    },
    onError: (error: any) => {
      showToast(error.message || 'שגיאה בשינוי הסיסמה', 'error')
    },
  })

  const deleteAccountMutation = useDeleteAccountMutation({
    onSuccess: () => {
      showToast('החשבון נמחק בהצלחה', 'success')
      logout()
    },
    onError: (error: any) => {
      showToast(error.message || 'שגיאה במחיקת החשבון', 'error')
    },
  })

  const updateAvatarMutation = useUpdateAvatarMutation({
    onSuccess: () => {
      showToast('תמונת הפרופיל עודכנה בהצלחה', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'שגיאה בעדכון תמונת הפרופיל', 'error')
    },
  })

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('גודל הקובץ חייב להיות קטן מ-5MB', 'error')
        return
      }
      const formData = new FormData()
      formData.append('avatar', file)
      updateAvatarMutation.mutate(formData)
    }
  }

  const validateForm = () => {
    const newErrors = { ...errors }
    let isValid = true

    if (!formData.name.trim()) {
      newErrors.name = 'שם הוא שדה חובה'
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'פורמט האימייל אינו תקין'
      isValid = false
    }

    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'מספר טלפון לא תקין'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const validatePasswordForm = () => {
    const newErrors = { ...errors }
    let isValid = true

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'סיסמה נוכחית היא שדה חובה'
      isValid = false
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'סיסמה חדשה היא שדה חובה'
      isValid = false
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'הסיסמה חייבת להכיל לפחות 8 תווים'
      isValid = false
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות אינן תואמות'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      updateProfileMutation.mutate(formData)
    }
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (validatePasswordForm()) {
      changePasswordMutation.mutate({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
    }
  }

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate()
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user?.avatar}
              sx={{ width: 100, height: 100 }}
              alt={user?.name}
            />
            <input
              accept="image/*"
              type="file"
              id="avatar-upload"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                }}
              >
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם מלא"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="אימייל"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isEditing}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="טלפון"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!isEditing}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {isEditing ? (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={updateProfileMutation.isLoading}
                >
                  שמור שינויים
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => setIsEditing(false)}
                >
                  ביטול
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
              >
                ערוך פרופיל
              </Button>
            )}
          </Box>
        </form>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Lock />}
            onClick={() => setShowPasswordDialog(true)}
          >
            שנה סיסמה
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setShowDeleteDialog(true)}
          >
            מחק חשבון
          </Button>
        </Box>
      </Paper>

      {/* אימות דו-שלבי */}
      <TwoFactorSetup
        isEnabled={user?.twoFactorEnabled || false}
        onStatusChange={() => {
          // רענון נתוני המשתמש לאחר שינוי סטטוס האימות הדו-שלבי
          window.location.reload()
        }}
      />

      {/* דיאלוג שינוי סיסמה */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>שינוי סיסמה</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handlePasswordChange} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="סיסמה נוכחית"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="סיסמה חדשה"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="אימות סיסמה חדשה"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>ביטול</Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={changePasswordMutation.isLoading}
          >
            שנה סיסמה
          </Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג מחיקת חשבון */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          מחיקת חשבון
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            פעולה זו היא בלתי הפיכה. כל המידע שלך יימחק לצמיתות.
          </Alert>
          <Typography>
            האם אתה בטוח שברצונך למחוק את החשבון שלך? לא ניתן לשחזר את המידע
            לאחר המחיקה.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>ביטול</Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={deleteAccountMutation.isLoading}
          >
            מחק חשבון
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Profile 