import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/utils/axios'

interface UserProfile {
  name: string
  email: string
  phone?: string
}

interface ChangePassword {
  currentPassword: string
  newPassword: string
}

// עדכון פרופיל
export const useUpdateProfileMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UserProfile) => {
      const response = await axios.put('/api/users/profile', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data)
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
}

// שינוי סיסמה
export const useChangePasswordMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  return useMutation({
    mutationFn: async (data: ChangePassword) => {
      const response = await axios.put('/api/users/password', data)
      return response.data
    },
    onSuccess: () => {
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
}

// מחיקת חשבון
export const useDeleteAccountMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await axios.delete('/api/users/account')
      return response.data
    },
    onSuccess: () => {
      queryClient.clear()
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
}

// עדכון תמונת פרופיל
export const useUpdateAvatarMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.put('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], (oldData: any) => ({
        ...oldData,
        avatar: data.avatar,
      }))
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error.response?.data || error)
    },
  })
} 