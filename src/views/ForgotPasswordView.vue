<template>
  <div
    class="min-h-screen bg-white w-full flex flex-col md:flex md:items-center md:justify-center"
  >
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
          <ForgotPasswordForm
            v-if="!linkSent"
            v-model="email"
            :loading="loading"
            :error="error"
            @submitted="handleReset"
          />

          <ForgotPasswordSuccess
            v-else
            :countdown="countdown"
            @resend="resendEmail"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

import ForgotPasswordForm from '@/components/forgot-password/ForgotPasswordForm.vue'
import ForgotPasswordSuccess from '@/components/forgot-password/ForgotPasswordSuccess.vue'

import { usePasswordReset } from '@/composables/usePasswordReset'
import { useCountdown } from '@/composables/useCountdown'

const { sendResetLink, loading, error } = usePasswordReset()
const { countdown, start, clear } = useCountdown(45)

const email = ref('')
const linkSent = ref(false)

const handleReset = async () => {
  await sendResetLink(email.value)
  if (!error.value) {
    linkSent.value = true
    start()
  }
}

const resendEmail = async () => {
  if (countdown.value === 0) {
    await sendResetLink(email.value)
    start()
  }
}

onUnmounted(clear)
</script>
