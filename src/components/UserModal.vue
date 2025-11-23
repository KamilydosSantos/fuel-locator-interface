<template>
  <div
    class="absolute top-[110px] right-8 bg-white rounded-2xl shadow-lg p-4 w-80 h-max z-50"
  >
    <h2 class="text-lg font-semibold text-primary mb-1">Bem-vindo!</h2>
    <button
      @click="$emit('close')"
      class="h-10 w-10 absolute p-2 top-2 right-2 text-sm text-gray-400 hover:text-gray-700 font-bold hover:bg-gray-200 rounded-4xl"
    >
      ✕
    </button>

    <p class="text-gray-600 text-sm">
      Olá, <span class="font-semibold">{{ userName }}</span>
    </p>

    <div class="mt-2 flex flex-col gap-2">
      <button
        v-if="userRole === 2"
        class="w-full text-sm bg-primary text-white py-2 rounded-xl hover:opacity-90"
        @click="requestCollaborator"
      >
        Solicitar para ser colaborador
      </button>

      <button
        v-if="userRole === 3"
        class="w-full text-sm bg-primary text-white py-2 rounded-xl hover:opacity-90"
        @click="goToPriceManagement"
      >
        Gerenciar indicações de preço
      </button>

      <button
        class="w-full text-sm text-red-500 py-2 rounded-xl hover:bg-red-50 border border-gray-200 hover:border-red-500"
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
