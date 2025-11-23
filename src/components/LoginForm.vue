<template>
  <p
    class="text-red-500 bg-red-100 rounded-lg text-xs text-center min-h-[1.25rem] mb-4 transition-opacity duration-200"
    :class="error || fieldError ? 'opacity-100' : 'opacity-0'"
  >
    {{ error || fieldError || '\u00A0' }}
  </p>

  <form @submit.prevent="handleLogin">
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

    <div class="w-full flex items-center justify-end text-sm mb-8">
      <RouterLink
        to="/forgot-password"
        class="text-primary hover:text-primary-dark transition-colors underline"
      >
        Esqueceu a senha?
      </RouterLink>
    </div>

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

      {{ loading ? 'Entrando' : 'Entrar' }}
    </button>

    <p class="w-full flex items-center justify-center text-sm mb-8 gap-1">
      Não possui conta?
      <RouterLink
        to="/register"
        class="text-primary hover:text-primary-dark transition-colors underline"
      >
        Cadastre-se
      </RouterLink>
    </p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import InputField from './InputField.vue'
import MailIcon from '@/components/icons/MailIcon.vue'
import LockIcon from '@/components/icons/LockIcon.vue'
import { useAuth } from '@/composables/useAuth'

const { login, loading, error } = useAuth()
const email = ref('')
const password = ref('')
const fieldError = ref('')

const handleLogin = () => {
  fieldError.value = ''

  if (!email.value) {
    fieldError.value = 'Por favor, informe seu e-mail.'
    return
  }

  if (!password.value) {
    fieldError.value = 'Por favor, informe sua senha.'
    return
  }

  login(email.value, password.value)
}
</script>

