import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'

export function useAuth() {
  const router = useRouter()
  const loading = ref(false)
  const error = ref('')

  const login = async (email, password) => {
    loading.value = true
    error.value = ''

    try {
      const { data } = await api.post('/login', { email, password })

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      router.push('/')
    } catch (err) {
      error.value = err.response?.data?.message || 'Falha ao fazer login. Tente novamente.'
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    router.push({ name: 'login' })
  }

  const isAuthenticated = () => !!localStorage.getItem('token')

  return { login, logout, isAuthenticated, loading, error }
}