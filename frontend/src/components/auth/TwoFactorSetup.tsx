import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { QRCode } from 'react-qr-code'
import { useToast } from '@/components/common/Toaster'
import {
  useEnable2FAMutation,
  useDisable2FAMutation,
  useVerify2FAMutation,
} from '@/services/auth'

interface TwoFactorSetupProps {
  isEnabled: boolean
  onStatusChange: () => void
}

const TwoFactorSetup = ({ isEnabled, onStatusChange }: TwoFactorSetupProps) => {
  const { showToast } = useToast()
  const [showQRCode, setShowQRCode] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [qrCodeData, setQRCodeData] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const enable2FAMutation = useEnable2FAMutation({
    onSuccess: (data) => {
      setQRCodeData(data.qrCode)
      setBackupCodes(data.backupCodes)
      setShowQRCode(true)
    },
    onError: (error) => {
      showToast(error.message || 'שגיאה בהפעלת אימות דו-שלבי', 'error')
    },
  })

  const verify2FAMutation = useVerify2FAMutation({
    onSuccess: () => {
      showToast('אימות דו-שלבי הופעל בהצלחה', 'success')
      setShowQRCode(false)
      setVerificationCode('')
      onStatusChange()
    },
    onError: (error) => {
      showToast(error.message || 'קוד האימות שגוי', 'error')
    },
  })

  const disable2FAMutation = useDisable2FAMutation({
    onSuccess: () => {
      showToast('אימות דו-שלבי בוטל בהצלחה', 'success')
      setShowDisableDialog(false)
      onStatusChange()
    },
    onError: (error) => {
      showToast(error.message || 'שגיאה בביטול אימות דו-שלבי', 'error')
    },
  })

  const handleEnable = () => {
    enable2FAMutation.mutate()
  }

  const handleVerify = () => {
    if (!verificationCode) {
      showToast('נא להזין קוד אימות', 'error')
      return
    }
    verify2FAMutation.mutate({ code: verificationCode })
  }

  const handleDisable = () => {
    disable2FAMutation.mutate()
  }

  if (isEnabled) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          אימות דו-שלבי
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          אימות דו-שלבי מופעל בחשבונך
        </Alert>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setShowDisableDialog(true)}
        >
          בטל אימות דו-שלבי
        </Button>

        <Dialog
          open={showDisableDialog}
          onClose={() => setShowDisableDialog(false)}
        >
          <DialogTitle>ביטול אימות דו-שלבי</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mt: 2 }}>
              ביטול אימות דו-שלבי יפחית משמעותית את רמת האבטחה של חשבונך. האם אתה
              בטוח?
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDisableDialog(false)}>ביטול</Button>
            <Button
              onClick={handleDisable}
              color="error"
              variant="contained"
              disabled={disable2FAMutation.isLoading}
            >
              {disable2FAMutation.isLoading ? 'מבטל...' : 'בטל אימות דו-שלבי'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    )
  }

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        אימות דו-שלבי
      </Typography>

      {!showQRCode ? (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            הפעל אימות דו-שלבי כדי להגביר את אבטחת חשבונך
          </Alert>
          <Button
            variant="contained"
            onClick={handleEnable}
            disabled={enable2FAMutation.isLoading}
          >
            {enable2FAMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              'הפעל אימות דו-שלבי'
            )}
          </Button>
        </>
      ) : (
        <Box>
          <Typography variant="body1" gutterBottom>
            1. סרוק את קוד ה-QR באמצעות אפליקציית האימות שלך
          </Typography>
          <Box
            sx={{
              my: 3,
              p: 3,
              bgcolor: 'white',
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <QRCode value={qrCodeData} size={200} />
          </Box>

          <Typography variant="body1" gutterBottom>
            2. הזן את הקוד שמופיע באפליקציה
          </Typography>
          <TextField
            fullWidth
            label="קוד אימות"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography variant="body1" gutterBottom>
            3. שמור את קודי הגיבוי במקום בטוח
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            קודי הגיבוי מאפשרים גישה לחשבונך במקרה שאין לך גישה למכשיר האימות.
            שמור אותם במקום בטוח!
          </Alert>
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              fontFamily: 'monospace',
            }}
          >
            {backupCodes.map((code) => (
              <Typography key={code} variant="body2">
                {code}
              </Typography>
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={handleVerify}
            disabled={verify2FAMutation.isLoading}
            fullWidth
          >
            {verify2FAMutation.isLoading ? 'מאמת...' : 'אמת והפעל'}
          </Button>
        </Box>
      )}
    </Paper>
  )
}

export default TwoFactorSetup 