import { useState } from 'react'
import {
  Box,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Tooltip,
  CircularProgress,
  Paper
} from '@mui/material'
import {
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { ActivityLog, ActivityType, ActivityAction, ActivityStatus, ActivityLogFilters } from '@/types/activity'
import { activityLogService } from '@/services/activityLog'
import { useNotification } from '@/components/NotificationProvider'
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const ActivityLogs = () => {
  const queryClient = useQueryClient()
  const { showNotification } = useNotification()
  const [filters, setFilters] = useState<ActivityLogFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // שליפת הלוגים
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: () => activityLogService.getLogs(filters),
  })

  // מחיקת לוג
  const deleteLogMutation = useMutation({
    mutationFn: (id: string) => activityLogService.deleteLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
      showNotification('הלוג נמחק בהצלחה', 'success')
    },
    onError: () => {
      showNotification('שגיאה במחיקת הלוג', 'error')
    },
  })

  // ניקוי לוגים
  const clearLogsMutation = useMutation({
    mutationFn: (before?: string) => activityLogService.clearLogs(before),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
      showNotification('הלוגים נוקו בהצלחה', 'success')
    },
    onError: () => {
      showNotification('שגיאה בניקוי הלוגים', 'error')
    },
  })

  const handleDeleteLog = (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק לוג זה?')) {
      deleteLogMutation.mutate(id)
    }
  }

  const handleClearLogs = () => {
    if (window.confirm('האם אתה בטוח שברצונך לנקות את כל הלוגים?')) {
      // אם יש סינון לפי תאריך, נשתמש בו
      clearLogsMutation.mutate(typeof filters.endDate === 'string' ? filters.endDate : undefined)
    }
  }

  const handleShowDetails = (log: ActivityLog) => {
    setSelectedLog(log)
    setShowDetails(true)
  }

  const getStatusColor = (status: ActivityStatus) => {
    return status === ActivityStatus.SUCCESS ? 'success' : 'error'
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">לוג פעילות</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(true)}
          >
            סינון
          </Button>
          <PermissionGuard permissions={[PERMISSIONS.ADMIN_ACCESS]}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearIcon />}
              onClick={handleClearLogs}
            >
              נקה לוגים
            </Button>
          </PermissionGuard>
        </Stack>
      </Box>

      <TableContainer component={Card}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>תאריך</TableCell>
                <TableCell>סוג</TableCell>
                <TableCell>פעולה</TableCell>
                <TableCell>משתמש</TableCell>
                <TableCell>סטטוס</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id || log._id}>
                  <TableCell>
                    {log.createdAt && format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', {
                      locale: he,
                    })}
                  </TableCell>
                  <TableCell>{log.type}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.username}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.status === ActivityStatus.SUCCESS ? 'הצלחה' : 'שגיאה'}
                      color={getStatusColor(log.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="פרטים">
                        <IconButton
                          size="small"
                          onClick={() => handleShowDetails(log)}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      <PermissionGuard permissions={[PERMISSIONS.ADMIN_ACCESS]}>
                        <Tooltip title="מחק">
                          <IconButton
                            size="small"
                            onClick={() => log.id || log._id ? handleDeleteLog(log.id || log._id) : null}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </PermissionGuard>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" p={3}>
                      לא נמצאו לוגים
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* דיאלוג סינון */}
      <Dialog
        open={showFilters}
        onClose={() => setShowFilters(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>סינון לוגים</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>סוג</InputLabel>
              <Select
                multiple
                value={filters.type || []}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as ActivityType[] })}
                label="סוג"
              >
                {Object.values(ActivityType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>פעולה</InputLabel>
              <Select
                multiple
                value={filters.action || []}
                onChange={(e) => setFilters({ ...filters, action: e.target.value as ActivityAction[] })}
                label="פעולה"
              >
                {Object.values(ActivityAction).map((action) => (
                  <MenuItem key={action} value={action}>
                    {action}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="משתמש"
              value={filters.userId || ''}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>סטטוס</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as ActivityStatus })}
                label="סטטוס"
              >
                <MenuItem value="">הכל</MenuItem>
                <MenuItem value={ActivityStatus.SUCCESS}>הצלחה</MenuItem>
                <MenuItem value={ActivityStatus.FAILURE}>שגיאה</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="מתאריך"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="עד תאריך"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setFilters({})
              showNotification('הסינון נוקה', 'info')
            }}
          >
            נקה סינון
          </Button>
          <Button onClick={() => setShowFilters(false)}>סגור</Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowFilters(false)
              queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
            }}
          >
            החל סינון
          </Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג פרטים */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>פרטי הלוג</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>תאריך:</strong> {selectedLog.createdAt && format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: he })}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>סוג:</strong> {selectedLog.type}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>פעולה:</strong> {selectedLog.action}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>משתמש:</strong> {selectedLog.username}
                </Typography>
              </Box>

              <Box>
                <Chip
                  label={selectedLog.status === ActivityStatus.SUCCESS ? 'הצלחה' : 'שגיאה'}
                  color={getStatusColor(selectedLog.status)}
                  size="small"
                />
              </Box>

              {selectedLog.targetId && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    <strong>מזהה יעד:</strong> {selectedLog.targetId}
                  </Typography>
                </Box>
              )}

              {selectedLog.targetType && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    <strong>סוג יעד:</strong> {selectedLog.targetType}
                  </Typography>
                </Box>
              )}

              {selectedLog.ipAddress && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    <strong>כתובת IP:</strong> {selectedLog.ipAddress}
                  </Typography>
                </Box>
              )}

              {selectedLog.details && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    <strong>פרטים:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {selectedLog.details}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {selectedLog.errorMessage && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    <strong>הודעת שגיאה:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#fff5f5' }}>
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: 'error.main' }}>
                      {selectedLog.errorMessage}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ActivityLogs 