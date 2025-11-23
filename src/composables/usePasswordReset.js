import { ref } from 'vue'
import { api } from '@/services/api'

export function usePasswordReset() {
  const loading = ref(false)
  const success = ref('')
  const error = ref('')

  const sendResetLink = async (email) => {
    loading.value = true
    success.value = ''
    error.value = ''

    try {
      const { data } = await api.post('/forgot-password', { email })
      success.value = data.message || 'Verifique seu e-mail para redefinir sua senha.'
    } catch (err) {
      error.value = err.response?.data?.message || 'Falha ao enviar o link. Tente novamente.'
    } finally {
      loading.value = false
    }
  }

  return { loading, success, error, sendResetLink }
}
