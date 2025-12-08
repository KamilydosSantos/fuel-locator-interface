<template>
  <div class="min-h-screen bg-white w-full flex flex-col md:flex md:items-center md:justify-center">
    <div
      class="w-full md:max-w-4xl mx-auto flex flex-col md:flex-row overflow-hidden
             md:rounded-xl md:border md:border-gray-200 md:shadow-lg"
    >
      <div class="w-full h-[40vh] sm:h-[48vh] md:h-auto md:w-1/2">
        <img
          src="/images/fundo_mapa_login.png"
          alt="imagem decorativa"
          class="w-full h-full object-cover object-center block
                 rounded-b-[8rem] md:rounded-b-none md:rounded-tr-[8rem] md:rounded-br-[8rem]"
        />
      </div>

      <div class="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center bg-white">
        <div class="w-full max-w-md text-center">
          <h1 class="text-2xl md:text-3xl font-semibold text-primary mb-4">
            Redefinição de Senha
          </h1>

          <p class="text-gray-600 mb-6 text-sm md:text-base">
            Escolha uma nova senha para acessar sua conta.
          </p>

          <InputField
            placeholder="Digite a nova senha"
            type="password"
            v-model="password"
            :icon="LockIcon"
            required
            class="mb-4"
          />

          <InputField
            placeholder="Confirme a nova senha"
            type="password"
            v-model="confirmPassword"
            :icon="LockIcon"
            required
            class="mb-6"
          />

          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition text-white"
            :class="loading ? 'bg-primary-disabled cursor-not-allowed' : 'bg-primary hover:bg-primary-contrast'"
            :disabled="loading"
            @click="handleConfirm"
          >
            <svg
              v-if="loading"
              class="animate-spin h-5 w-5 text-white"
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

            {{ loading ? 'Confirmando...' : 'Confirmar' }}
          </button>

          <p v-if="error" class="text-red-500 text-sm mt-3">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LockIcon from '@/components/icons/LockIcon.vue'
import InputField from '@/components/InputField.vue'

import { usePasswordReset } from '@/composables/usePasswordReset'
import { api } from '@/services/api'

const route = useRoute()
const router = useRouter()

const { loading } = usePasswordReset()
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')

const handleConfirm = async () => {
  error.value = ''
  success.value = ''

  if (!password.value || !confirmPassword.value) {
    error.value = 'Por favor, preencha todos os campos.'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem.'
    return
  }

  try {
    const token = route.params.token
    const email = route.query.email

    const { data } = await api.post('/reset-password', {
      token,
      email,
      password: password.value,
      password_confirmation: confirmPassword.value
    })

    router.push({
      name: 'login',
      query: { reset: 'success' }
    })
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao redefinir senha. Tente novamente.'
  }
}
</script>
