import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Adjuntar JWT automáticamente a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el token expiró, limpiar sesión y redirigir al login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexo_token')
      localStorage.removeItem('nexo_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
