<template>
  <div
    class="absolute top-20 md:top-[110px] right-8
           bg-white rounded-xl md:rounded-2xl
           shadow-lg
           p-4 md:p-5
           w-[92vw] max-w-[20rem] md:w-80
           h-max z-50"
  >
    <h2 class="text-lg md:text-lg font-semibold text-primary mb-1">
      Bem-vindo!
    </h2>

    <button
      @click="$emit('close')"
      class="absolute top-2 right-2
             h-9 w-9 md:h-10 md:w-10
             text-gray-400 hover:text-gray-700
             hover:bg-gray-200 rounded-full
             flex items-center justify-center"
    >
      ✕
    </button>

    <p class="text-gray-600 text-sm md:text-sm">
      Olá, <span class="font-semibold">{{ userName }}</span>
    </p>

    <div class="mt-4 flex flex-col gap-2.5">
      <button
        v-if="userRole === 2"
        class="w-full bg-primary text-white
               py-2
               text-sm
               rounded-xl
               hover:opacity-90"
        @click="requestCollaborator"
      >
        Solicitar para ser colaborador
      </button>

      <button
        v-if="userRole === 3"
        class="w-full bg-primary text-white
               py-2
               text-sm
               rounded-xl
               hover:opacity-90"
        @click="goToPriceManagement"
      >
        Gerenciar indicações de preço
      </button>

      <button
        class="w-full text-red-500
               py-2
               text-sm
               rounded-xl
               border border-gray-200
               hover:bg-red-50 hover:border-red-500"
        @click="logout"
      >
        Sair
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { api } from '@/services/api.js'

defineProps({
  userName: {
    type: String,
    required: true,
  },
  userRole: Number,
})

const emit = defineEmits(['close'])
const router = useRouter()

function requestCollaborator() {
  router.push({ name: 'requestCollaborator' })
  emit('close')
}

function goToPriceManagement() {
  router.push({ name: 'priceSuggestions' })
  emit('close')
}

async function logout() {
  const confirmed = window.confirm('Tem certeza que deseja sair do sistema?')

  if (!confirmed) return

  try {
    await api.post('/logout')

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    delete api.defaults.headers.common['Authorization']

    router.push({ name: 'login' })

    emit('close')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}
</script>
