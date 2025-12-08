import { ref } from 'vue'
import { api } from '@/services/api'

export function usePasswordReset() {
  const loading = ref(false)

  const sendResetLink = async (email) => {
    loading.value = true

    try {
      await api.post('/forgot-password', { email })
      return true
    } catch (err) {
      throw (
        err.response?.data?.message ||
        'Falha ao enviar o link. Tente novamente.'
      )
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    sendResetLink
  }
}