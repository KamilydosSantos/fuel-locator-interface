<template>
  <div class="relative p-6 max-w-2xl mx-auto">
    <button
      @click="router.push('/admin-panel')"
      class="absolute top-4 left-4 p-2 border border-gray-100 rounded-full bg-white shadow-md hover:bg-gray-100 transition z-50"
    >
      <ArrowLeft class="w-6 h-6 text-gray-700" />
    </button>

    <h1 class="text-xl md:text-2xl px-10 md:p-0 font-bold text-gray-800 mb-6 text-center">
      Solicitações de colaboração pendentes
    </h1>

    <div v-if="loading" class="text-center py-10 text-gray-500">
      Carregando solicitações pendentes...
    </div>

    <div
      v-else-if="requests.length === 0"
      class="text-center py-10 text-gray-500"
    >
      Nenhuma solicitação pendente no momento.
    </div>

    <div v-else class="flex flex-col gap-4">
      <div
        v-for="item in requests"
        :key="item.id"
        class="bg-white p-4 rounded-xl shadow border border-gray-100 flex justify-between items-center"
      >
        <div class="w-full">
          <div class="flex justify-between items-start h-8">
            <p class="font-bold text-gray-800">
              {{ item.user?.name }}
            </p>
          
            <div class="relative">
              <button
                @click="toggleMenu(item.id)"
                class="p-1 rounded-sm hover:bg-gray-100"
              >
                ⋮
              </button>

              <div
                v-if="openMenuId === item.id"
                class="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg border border-gray-200 z-50"
              >
                <button
                  @click="goToEvaluate(item.id)"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-primary rounded-lg"
                >
                  Avaliar
                </button>
              </div>
            </div>
          </div>

          <p class="text-sm text-gray-600 font-medium">
            {{ item.user?.email }}
          </p>

          <div class="flex justify-between items-end mt-2 w-full">
            <div class="flex-1">
              <p class="text-xs text-gray-500 italic mt-1">
                Telefone: {{ item.phone }}
              </p>
              <p class="text-xs text-gray-500 italic">
                CPF: {{ item.cpf }}
              </p>
            </div>

            <p class="text-xs text-gray-400 mt-1 text-right whitespace-nowrap">
              {{ formatDate(item.created_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const requests = ref([])
const loading = ref(true)
const openMenuId = ref(null)

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const formatDate = (date) =>
  new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

const fetchRequests = async () => {
  try {
    const { data } = await api.get('/role-requests/pending')
    requests.value = data.data || data
  } catch (e) {
    console.error('Erro ao carregar solicitações', e)
  } finally {
    loading.value = false
  }
}

const goToEvaluate = (id) => {
  router.push({ name: 'adminEvaluateCollaborationRequest', params: { id } })
}

onMounted(fetchRequests)
</script>
