<template>
  <div class="relative min-h-screen bg-white relative">
    <div class="absolute top-0 right-0 mt-6 mr-8">
      <button
        @click="toggleModal"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
        class="w-14 h-14 flex items-center justify-center  border border-gray-100 rounded-full bg-white transition cursor-pointer shadow-lg hover:shadow-2xl"
      >
        <UserIcon
          :color="isHover ? primary : gray200"
          class="w-7 h-7"
        />
      </button>

      <UserModal
        v-if="showModal"
        :user-name="user?.name"
        :user-role="user?.role_id"
        @close="showModal = false"
      />
    </div>

    <div class="max-w-2xl mx-auto px-6 pt-6 pb-4">
      <h1 class="text-xl md:text-2xl font-bold text-gray-800 my-4 sm:text-center">
        Painel Administrativo
      </h1>
    </div>

    <div class="max-w-2xl mx-auto px-6 pb-10 mt-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">

        <div
          @click="goTo('manageCollaborationRequests')"
          class="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-gray-100 flex flex-col gap-3"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-lg md:text-xl font-semibold text-primary">
              Solicitações de colaboração
            </h2>
            <svg class="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <p class="text-gray-600 text-sm">
            Aprove ou rejeite pedidos de usuários para se tornarem colaboradores.
          </p>
        </div>

        <div
          @click="goTo('managePriceSuggestions')"
          class="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-gray-200 flex flex-col gap-3"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-lg md:text-xl font-semibold text-primary">
              Sugestões de preço
            </h2>
            <svg class="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <p class="text-gray-600 text-sm">
            Gerencie sugestões enviadas para atualização dos preços de combustível.
          </p>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import { useRouter } from 'vue-router'
import UserIcon from '@/components/icons/UserIcon.vue'
import UserModal from '@/components/UserModal.vue'

const router = useRouter()

const user = ref(null)
const showModal = ref(false)
const isHover = ref(false)

const gray200 = '#e5e7eb'
const primary = '#007BFF'

onMounted(async () => {
  const { data } = await api.get('/user')
  user.value = data
})

function toggleModal() {
  showModal.value = !showModal.value
}

function goTo(routeName) {
  router.push({ name: routeName })
}
</script>