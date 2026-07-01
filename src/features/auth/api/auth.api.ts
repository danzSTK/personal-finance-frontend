import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_ERROR_CODES } from '@/shared/errors'
import { useAuthStore } from '../stores/auth.store'
import {
  AUTH_API_ENDPOINTS,
  AUTH_WINDOW_MESSAGES,
  DEFAULT_API_BASE_URL,
} from '../constants/auth.constants'

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  DEFAULT_API_BASE_URL

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: () => void
  reject: (reason: Error) => void
}> = []

const processQueue = (error: Error | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
      return
    }

    promise.resolve()
  })

  failedQueue = []
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isEmailVerificationRequiredError = (error: AxiosError): boolean =>
  error.response?.status === 403 &&
  isRecord(error.response.data) &&
  error.response.data.code === API_ERROR_CODES.emailVerificationRequired

const dispatchEmailVerificationRequired = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_WINDOW_MESSAGES.emailVerificationRequired)
  )
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    if (isEmailVerificationRequiredError(error)) {
      dispatchEmailVerificationRequired()
      return Promise.reject(error)
    }

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (originalRequest.url?.includes(AUTH_API_ENDPOINTS.refresh)) {
      useAuthStore.getState().logout()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => api(originalRequest))
        .catch((refreshError) => Promise.reject(refreshError))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await axios.post(
        `${apiBaseUrl}${AUTH_API_ENDPOINTS.refresh}`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      )

      processQueue(null)

      return api(originalRequest)
    } catch (refreshError) {
      const queueError =
        refreshError instanceof Error
          ? refreshError
          : new Error('Erro ao renovar token de acesso')

      processQueue(queueError)
      useAuthStore.getState().logout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
