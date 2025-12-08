<template>
  <div class="relative p-6 max-w-2xl mx-auto">
    <button
      @click="router.push('/admin-panel')"
      class="absolute top-4 left-4 p-2 border border-gray-100 rounded-full bg-white shadow-md hover:bg-gray-100 transition z-50"
    >
      <ArrowLeft class="w-6 h-6 text-gray-700" />
    </button>

    <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">
      Sugestões de preço pendentes
    </h1>

    <div v-if="loading" class="text-center py-10 text-gray-500">
      Carregando sugestões pendentes...
    </div>

    <div
      v-else-if="suggestions.length === 0"
      class="text-center py-10 text-gray-500"
    >
      Nenhuma sugestão de preço pendente no momento.
    </div>

    <div v-else class="flex flex-col gap-4">
      <div
        v-for="item in suggestions"
        :key="item.id"
        class="bg-white p-4 rounded-xl shadow border border-gray-100 flex justify-between items-center"
      >
        <div class="w-full">
          <div class="flex justify-between items-start h-8">
            <p class="font-semibold text-gray-900 text-base">
              {{ item.fuel?.name }}:
              <span class="font-bold text-gray-600"> R$ {{ formatPrice(item.suggested_price) }}</span>
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
                class="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg border border-gray-100 z-50"
              >
                <button
                  @click="goToEvaluate(item.id)"
                  class="w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-100 rounded-lg"
                >
                  Avaliar
                </button>
              </div>
            </div>
          </div>

          <p class="text-sm text-gray-600 my-1">
            {{
              (item.station?.name === 'Unnamed Station'
                ? 'Posto sem Nome'
                : item.station?.name)
            }}
            — {{ item.station?.brand || 'Bandeira Branca' }}
          </p>

          <div class="flex justify-between items-center mt-2">
            <p class="text-xs text-gray-500 mt-1 italic">
              Enviado por: {{ item.user?.name }}
            </p>

            <p class="text-xs text-gray-400 mt-1">
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
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useToast } from "vue-toastification"

const toast = useToast()
const router = useRouter()
const route = useRoute()

const suggestions = ref([])
const loading = ref(true)
const openMenuId = ref(null)

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const formatPrice = (value) => Number(value).toFixed(2).replace('.', ',')
const formatDate = (date) => new Date(date).toLocaleString('pt-BR')

const fetchSuggestions = async () => {
  try {
    const { data } = await api.get('/fuel-price-suggestions/pending/all')
    suggestions.value = data.data || data
  } catch (e) {
    console.error('Erro ao carregar sugestões', e)
    toast.error(
      e.response?.data?.message ||
      "Erro ao carregar sugestões de preço pendentes."
    )
  } finally {
    loading.value = false
  }
}

const goToEvaluate = (id) => {
  router.push({ name: 'adminEvaluatePriceSuggestion', params: { id } })
}

onMounted(() => {
  if (route.query.success === 'success') {
    toast.success('Decisão registrada com sucesso! A notificação será enviada ao colaborador.')
    router.replace({ query: {} })
  }

  fetchSuggestions()
})
</script>