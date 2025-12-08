<template>
  <div class="relative p-6 max-w-2xl mx-auto">
    <button
      @click="router.push('/manage-collaboration-requests')"
      class="absolute top-4 left-4 p-2 border border-gray-100 rounded-full bg-white shadow-md hover:bg-gray-100 transition z-50"
    >
      <ArrowLeft class="w-6 h-6 text-gray-700" />
    </button>

    <h1 class="text-xl md:text-2xl px-10 md:p-0 font-bold text-gray-800 mb-6 text-center">
      Avaliar solicitação de colaboração
    </h1>

    <div v-if="loading" class="text-center py-10 text-gray-500">
      Carregando dados da solicitação...
    </div>

    <div
      v-else
      class="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col gap-2"
    >

      <section class="flex flex-col gap-4">
        <div>
          <p class="font-bold text-gray-800 text-lg">
            {{ request.user.name }}
          </p>
          <p class="font-medium text-sm text-gray-600 mt-1">
            {{ request.user.email }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row flex-wrap gap-1 md:gap-4 text-sm text-gray-500">
          <p class="italic">Telefone: {{ request.phone }}</p>
          <p class="italic">CPF: {{ request.cpf }}</p>
        </div>
        <div class="flex flex-col sm:flex-row flex-wrap gap-1 md:gap-4 text-xs text-gray-500">
          <p class="italic">Utiliza o sistema há: {{ userTimeInSystem }}</p>
          <p class="italic">Solicitado em: {{ formatDate(request.requested_at) }}</p>
        </div>
      </section>

      <div class="flex gap-2 w-full mt-4">
        <button
          @click="cancel"
          class="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
        >
          Cancelar
        </button>

        <button
          @click="rejectRequest"
          class="w-full px-4 py-2 bg-red-400 hover:bg-red-700 text-white rounded-lg"
        >
          Rejeitar
        </button>

        <button
          @click="approveRequest"
          class="w-full px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg"
        >
          Aprovar
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const toast = useToast()

const route = useRoute()
const router = useRouter()

const id = route.params.id

const loading = ref(true)
const request = ref(null)

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const fetchRequest = async () => {
  try {
    const { data } = await api.get(`/role-requests/pending/${id}`)
    request.value = data.data || data
  } catch (e) {
    console.error('Erro ao carregar solicitação', e)

    toast.error(
      e.response?.data?.message ||
      'Erro ao carregar a solicitação de colaboração.'
    )
  } finally {
    loading.value = false
  }
}

const approveRequest = async () => {
  try {
    await api.patch(`/role-requests/${id}/approve`)

    router.push({
      name: 'manageCollaborationRequests',
        query: { success: "success" 
      }
    })
  } catch (e) {
    console.error(e)

    toast.error(
      e.response?.data?.message ||
      'Erro ao aprovar a solicitação.'
    )
  }
}

const rejectRequest = async () => {
  try {
    await api.patch(`/role-requests/${id}/reject`)
    router.push({
      name: 'manageCollaborationRequests',
        query: { success: "success" 
      }
    })
  } catch (e) {
    console.error(e)

    toast.error(
      e.response?.data?.message ||
      'Erro ao rejeitar a solicitação.'
    )
  }
}

const cancel = () => {
  router.push({ name: 'manageCollaborationRequests' })
}


const userTimeInSystem = computed(() => {
  if (!request.value?.user?.created_at) return '—'

  const createdAt = new Date(request.value.user.created_at)
  const now = new Date()

  const diffMs = now - createdAt
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  const days = diffDays % 30

  let parts = []
  if (years) parts.push(`${years} ano${years > 1 ? 's' : ''}`)
  if (months) parts.push(`${months} mês${months > 1 ? 'es' : ''}`)
  if (!years && !months) parts.push(`${days} dia${days > 1 ? 's' : ''}`)

  return parts.join(', ')
})

onMounted(fetchRequest)
</script>
