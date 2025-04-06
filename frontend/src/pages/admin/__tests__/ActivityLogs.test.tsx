import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import ActivityLogs from '../ActivityLogs'
import { useNotification } from '@/hooks/useNotification'
import { activityLogService } from '@/services/activityLog'
import { ActivityType, ActivityAction } from '@/types/activity'

// Mock the hooks
vi.mock('@/hooks/useNotification', () => ({
  useNotification: vi.fn(),
}))

// Mock the service
vi.mock('@/services/activityLog', () => ({
  activityLogService: {
    getLogs: vi.fn(),
    deleteLog: vi.fn(),
    clearLogs: vi.fn(),
  },
}))

// Mock data
const mockLogs = [
  {
    id: '1',
    type: ActivityType.AUTH,
    action: ActivityAction.LOGIN,
    userId: '1',
    userName: 'משה כהן',
    targetId: null,
    details: { ip: '127.0.0.1' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    createdAt: '2024-03-20T10:00:00Z',
    status: 'SUCCESS',
  },
  {
    id: '2',
    type: ActivityType.USER,
    action: ActivityAction.UPDATE,
    userId: '2',
    userName: 'שרה לוי',
    targetId: '3',
    details: { field: 'email' },
    ipAddress: '127.0.0.2',
    userAgent: 'Chrome/120.0.0.0',
    createdAt: '2024-03-20T11:00:00Z',
    status: 'FAILURE',
    errorMessage: 'שגיאת הרשאות',
  },
]

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const mockShowNotification = vi.fn()
  ;(useNotification as jest.Mock).mockReturnValue({
    showNotification: mockShowNotification,
  })

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ActivityLogs />
        </MemoryRouter>
      </QueryClientProvider>
    ),
    mockShowNotification,
  }
}

describe('ActivityLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(activityLogService.getLogs as jest.Mock).mockResolvedValue(mockLogs)
  })

  it('מציג את טבלת הלוגים', async () => {
    renderComponent()

    // בדיקת כותרות הטבלה
    expect(screen.getByText('תאריך')).toBeInTheDocument()
    expect(screen.getByText('סוג')).toBeInTheDocument()
    expect(screen.getByText('פעולה')).toBeInTheDocument()
    expect(screen.getByText('משתמש')).toBeInTheDocument()
    expect(screen.getByText('סטטוס')).toBeInTheDocument()

    // בדיקת תוכן הלוגים
    await waitFor(() => {
      expect(screen.getByText('משה כהן')).toBeInTheDocument()
      expect(screen.getByText('שרה לוי')).toBeInTheDocument()
    })
  })

  it('פותח דיאלוג פרטים בלחיצה על כפתור הפרטים', async () => {
    renderComponent()

    // המתנה לטעינת הלוגים
    await waitFor(() => {
      expect(screen.getByText('משה כהן')).toBeInTheDocument()
    })

    // לחיצה על כפתור הפרטים
    const detailsButtons = screen.getAllByTitle('פרטים')
    fireEvent.click(detailsButtons[0])

    // בדיקת תוכן הדיאלוג
    expect(screen.getByText('פרטי לוג')).toBeInTheDocument()
    expect(screen.getByText(/כתובת IP:/)).toBeInTheDocument()
    expect(screen.getByText(/127.0.0.1/)).toBeInTheDocument()
  })

  it('מוחק לוג בהצלחה', async () => {
    const { mockShowNotification } = renderComponent()
    ;(activityLogService.deleteLog as jest.Mock).mockResolvedValue(undefined)

    // המתנה לטעינת הלוגים
    await waitFor(() => {
      expect(screen.getByText('משה כהן')).toBeInTheDocument()
    })

    // לחיצה על כפתור המחיקה
    const deleteButtons = screen.getAllByTitle('מחק')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.click(deleteButtons[0])

    // בדיקת קריאה לשירות המחיקה
    await waitFor(() => {
      expect(activityLogService.deleteLog).toHaveBeenCalledWith('1')
      expect(mockShowNotification).toHaveBeenCalledWith(
        'הלוג נמחק בהצלחה',
        'success'
      )
    })
  })

  it('מנקה את כל הלוגים בהצלחה', async () => {
    const { mockShowNotification } = renderComponent()
    ;(activityLogService.clearLogs as jest.Mock).mockResolvedValue(undefined)

    // המתנה לטעינת הלוגים
    await waitFor(() => {
      expect(screen.getByText('נקה לוגים')).toBeInTheDocument()
    })

    // לחיצה על כפתור ניקוי הלוגים
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.click(screen.getByText('נקה לוגים'))

    // בדיקת קריאה לשירות הניקוי
    await waitFor(() => {
      expect(activityLogService.clearLogs).toHaveBeenCalled()
      expect(mockShowNotification).toHaveBeenCalledWith(
        'הלוגים נוקו בהצלחה',
        'success'
      )
    })
  })

  it('מסנן לוגים לפי קריטריונים', async () => {
    renderComponent()

    // המתנה לטעינת הלוגים
    await waitFor(() => {
      expect(screen.getByText('סינון')).toBeInTheDocument()
    })

    // פתיחת דיאלוג הסינון
    fireEvent.click(screen.getByText('סינון'))

    // בחירת סוג פעילות
    const typeSelect = screen.getByLabelText('סוג')
    fireEvent.mouseDown(typeSelect)
    const authOption = screen.getByText(ActivityType.AUTH)
    fireEvent.click(authOption)

    // בחירת סטטוס
    const statusSelect = screen.getByLabelText('סטטוס')
    fireEvent.mouseDown(statusSelect)
    const successOption = screen.getByText('הצלחה')
    fireEvent.click(successOption)

    // סגירת הדיאלוג
    fireEvent.click(screen.getByText('סגור'))

    // בדיקת קריאה לשירות עם הפילטרים
    await waitFor(() => {
      expect(activityLogService.getLogs).toHaveBeenCalledWith({
        type: [ActivityType.AUTH],
        status: 'SUCCESS',
      })
    })
  })
}) 