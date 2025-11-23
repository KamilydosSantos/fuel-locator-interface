<template>
  <form @submit.prevent="handleRegister">
    <p
    class="text-red-500 bg-red-100 rounded-lg text-xs text-center min-h-[1.25rem] mb-4 transition-opacity duration-200"
      :class="error || fieldError ? 'opacity-100' : 'opacity-0'"
    >
      {{ error || fieldError || '\u00A0' }}
    </p>

    <InputField
      placeholder="Nome"
      type="text"
      v-model="name"
      :icon="UserIcon"
      required
      class="mb-4"
    />

    <InputField
      placeholder="E-mail"
      type="email"
      v-model="email"
      :icon="MailIcon"
      required
      class="mb-4"
    />

    <InputField
      placeholder="Senha"
      type="password"
      v-model="password"
      :icon="LockIcon"
      required
      class="mb-4"
    />

    <InputField
      placeholder="Confirmar senha"
      type="password"
      v-model="password_confirmation"
      :icon="LockIcon"
      required
      class="mb-4"
    />

    <button
      type="submit"
      class="w-full flex items-center justify-center gap-2 font-semibold py-2 rounded-2xl transition text-white mb-4"
      :class="loading ? 'bg-primary-disabled cursor-not-allowed' : 'bg-primary hover:bg-primary-contrast'"
      :disabled="loading"
    >
      <svg
        v-if="loading"
        class="animate-spin h-5 w-5 text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>

      {{ loading ? 'Criando...' : 'Criar conta' }}
    </button>

    <p class="w-full flex items-center justify-center text-sm mb-8 gap-1">
      Já possui conta?
      <RouterLink
        to="/login"
        class="text-primary hover:text-primary-dark transition-colors underline"
      >
        Entrar
      </RouterLink>
    </p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import InputField from './InputField.vue'
import MailIcon from '@/components/icons/MailIcon.vue'
import LockIcon from '@/components/icons/LockIcon.vue'
import UserIcon from '@/components/icons/UserIcon.vue'
import { api } from '@/services/api.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')

const loading = ref(false)
const error = ref(null)
const fieldError = ref(null)

const handleRegister = async () => {
  loading.value = true
  error.value = null
  fieldError.value = null

  try {
    await api.post('/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    })

    router.push('/login')
  } catch (e) {
    console.error(e)

    if (e.response?.data?.errors) {
      const errors = e.response.data.errors
      fieldError.value = Object.values(errors).flat()[0]
    } else {
      error.value = e.response?.data?.message || 'Erro ao criar a conta.'
    }
  } finally {
    loading.value = false
  }
}
</script>