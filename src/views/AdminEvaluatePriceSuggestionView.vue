<template>
  <div class="relative p-6 max-w-2xl mx-auto">
    <button
      @click="router.push('/manage-collaboration-requests')"
      class="absolute top-4 left-4 p-2 border border-gray-100 rounded-full bg-white shadow-md hover:bg-gray-100 transition z-50"
    >
      <ArrowLeft class="w-6 h-6 text-gray-700" />
    </button>

    <h1 class="text-xl md:text-2xl px-10 md:p-0 font-bold text-gray-800 mb-6 text-center">
      Avaliar sugestão de preço
    </h1>

    <div v-if="loading" class="text-center py-10 text-gray-500">
      Carregando dados da sugestão...
    </div>

    <div v-else class="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col gap-2">
      <section class="flex justify-between">
        <p class="italic text-gray-700">Enviado por: {{ suggestion.user.name }}</p>
        <p class="italic text-gray-700 text-sm text-gray-500">
          {{ formatDate(suggestion.created_at) }}
        </p>
      </section>
      <section>
        <p class="font-bold text-md text-gray-700 my-1">
          {{
            (suggestion.station?.name === 'Unnamed Station'
              ? 'Posto sem Nome'
              : suggestion.station?.name)
          }}
          — {{ suggestion.station?.brand || 'Bandeira Branca' }}
        </p>
        <p class="text-gray-700 flex gap-2"><p class="font-medium">Endereço: </p>{{ suggestion.station.address?.street }}, {{ suggestion.station.address?.number }}</p>
        <p class="text-gray-700 flex gap-2"><p class="font-medium">Bairro: </p>{{ suggestion.station.address?.neighborhood }}</p>
        <p class="text-gray-700 flex gap-2"><p class="font-medium">Cidade: </p>{{ suggestion.station.address?.city?.name }}</p>
      </section>
      <hr class="text-gray-100">
      <section>
        <p class="font-bold text-md text-gray-700 my-1">{{ suggestion.fuel.name }}</p>
        <p class="text-primary flex gap-2"><p class="text-gray-700 font-medium">Preço sugerido: </p>
            R$ {{ formatPrice(suggestion.suggested_price) }}
        </p>
        <p class="text-gray-700 flex gap-2"><p class="font-medium">Preço atual: </p>
          <span v-if="suggestion.fuel_price.price && suggestion.fuel_price.price > 0">
            R$ {{ formatPrice(suggestion.fuel_price.price) }}
          </span>
          <span v-else>
            Sem atualizações de preço.
          </span>
        </p>
      </section>
      <hr class="text-gray-100">
      <section v-if="suggestion.photo_path">
        <h2 class="font-bold text-md text-gray-700 my-1">Imagem enviada</h2>
        <img
          :src="photoUrl"
          class="w-full max-h-96 object-contain rounded-lg border"
        />
      </section>

      <div class="flex justify-end gap-4 mt-4">
        <button
          @click="cancel"
          class="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
        >
          Cancelar
        </button>

        <button
          @click="rejectSuggestion"
          class="w-full px-4 py-2 bg-red-400 hover:bg-red-700 text-white rounded-lg"
        >
          Rejeitar
        </button>

        <button
          @click="approveSuggestion"
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
const suggestion = ref(null)

const formatPrice = (v) => Number(v).toFixed(2).replace('.', ',')
const formatDate = (d) => new Date(d).toLocaleString('pt-BR')

const fetchSuggestion = async () => {
  try {
    const { data } = await api.get(`/fuel-price-suggestions/pending/${id}`)
    suggestion.value = data.data || data
    console.log(suggestion.value)
  } catch (e) {
    console.error('Erro ao carregar sugestão', e)

    toast.error(
      e.response?.data?.message ||
      'Erro ao carregar a sugestão de preço.'
    )
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  router.push({ name: 'managePriceSuggestions' })
}

const approveSuggestion = async () => {
  try {
    await api.patch(`/fuel-price-suggestions/${id}/approve`)

    router.push({
      name: 'managePriceSuggestions',
        query: { success: "success" 
      }
    })
  } catch (e) {
    console.error(e)

    toast.error(
      e.response?.data?.message ||
      'Erro ao aprovar a sugestão.'
    )
  }
}

const rejectSuggestion = async () => {
  try {
    await api.patch(`/fuel-price-suggestions/${id}/reject`)
    router.push({
      name: 'managePriceSuggestions',
        query: { success: "success" 
      }
    })
 } catch (e) {
    console.error(e)

    toast.error(
      e.response?.data?.message ||
      'Erro ao rejeitar a sugestão.'
    )
  }
}

const photoUrl = computed(() => {
  if (!suggestion.value?.photo_path) return null
  return `http://localhost/storage/${suggestion.value.photo_path}`
})

onMounted(fetchSuggestion)
</script>