<template>
  <div
    class="min-h-screen bg-white w-full
           flex flex-col md:flex md:items-center md:justify-center"
  >
    <div
      class="w-full md:max-w-4xl mx-auto flex flex-col md:flex-row overflow-hidden
             md:rounded-xl md:border md:border-gray-200 md:shadow-lg"
    >
      <div class="w-full h-[40vh] sm:h-[48vh] md:h-auto md:w-1/2">
        <img
          src="/images/fundo_mapa_login.png"
          alt="imagem decorativa do mapa da aplicação com marcadores"
          class="w-full h-full object-cover object-center block rounded-b-[8rem] md:rounded-b-none md:rounded-tr-[8rem] md:rounded-br-[8rem]"
        />
      </div>

      <div class="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center bg-white">
        <div class="w-full max-w-md">
          <h1 class="text-2xl md:text-3xl font-semibold text-center text-primary mb-4">
            Bem-vindo de volta!
          </h1>
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import LoginForm from '@/components/LoginForm.vue'

const route = useRoute()
const toast = useToast()

onMounted(() => {
  if (route.query.reset === 'success') {
    toast.success(
      'Senha redefinida com sucesso! Agora você pode entrar com sua nova senha.'
    )
  }

  if (route.query.register === 'success') {
    toast.success(
      'Conta criada com sucesso! Faça login para continuar.'
    )
  }
})
</script>
