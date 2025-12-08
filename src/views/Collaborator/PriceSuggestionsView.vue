<template>
  <div class="relative p-6 max-w-2xl mx-auto">
    <button
      @click="router.push('/map')"
      class="absolute top-4 left-4 p-2 border border-gray-100 rounded-full bg-white shadow-md hover:bg-gray-100 transition z-50"
    >
      <ArrowLeft class="w-6 h-6 text-gray-700" />
    </button>

    <div class="flex flex-col sm:flex-row justify-center items-center relative mb-6">

  <h1 class="text-xl md:text-2xl font-bold text-gray-800 text-center flex-1 mb-2 sm:mb-0">
    Histórico de sugestões
  </h1>

  <div class="bg-white text-green-700 px-4 py-2 rounded-lg text-xs font-semibold shadow border border-gray-100
              sm:absolute sm:top-0 sm:right-0">
    Total aprovado: {{ approvedCount }}
  </div>

</div>

    <div v-if="isLoading" class="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100">
      Carregando suas sugestões...
    </div>

    <template v-else>

      <div class="flex justify-center gap-2 mb-5">

        <button
          @click="filters[1] = !filters[1]"
          :class="[
            'px-3 py-1 rounded text-sm font-medium',
            filters[1]
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600'
          ]"
        >
          Pendentes
        </button>

        <button
          @click="filters[2] = !filters[2]"
          :class="[
            'px-3 py-1 rounded text-sm font-medium',
            filters[2]
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          ]"
        >
          Aprovadas
        </button>

        <button
          @click="filters[3] = !filters[3]"
          :class="[
            'px-3 py-1 rounded text-sm font-medium',
            filters[3]
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600'
          ]"
        >
          Recusadas
        </button>

      </div>

      <div
        v-if="suggestions.length === 0"
        class="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500 border border-gray-100"
      >
        Você ainda não possui sugestões de preço.
      </div>

      <div
        v-else-if="filteredSuggestions.length === 0"
        class="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500 border border-gray-100"
      >
        Nenhuma sugestão encontrada para os status selecionados.
      </div>

      <div v-else class="flex flex-col gap-4">

        <div
          v-for="item in filteredSuggestions"
          :key="item.id"
          class="bg-white p-4 rounded-xl shadow border border-gray-100 flex justify-between items-center"
        >
          <div class="flex flex-col w-full">

            <div class="flex justify-between items-start h-8">

              <p class="font-semibold text-gray-900 text-base">
                {{ item.fuel?.name }}:
                <span class="font-bold text-gray-600"> R$ {{ formatPrice(item.suggested_price) }}</span>
              </p>

              <div class="relative ml-3">
                <button
                  v-if="item.status_id === 1"
                  @click="toggleMenu(item.id)"
                  class="p-1 rounded-sm hover:bg-gray-100"
                >
                  ⋮
                </button>

                <div
                  v-if="item.status_id === 1 && openMenuId === item.id"
                  class="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg border border-gray-200 z-50"
                >
                  <button
                    @click="editSuggestion(item)"
                    class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-primary rounded-t-lg"
                  >
                    Editar
                  </button>

                  <button
                    @click="deleteSuggestion(item.id)"
                    class="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-600 rounded-b-lg"
                  >
                    Excluir
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
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded"
                :class="{
                  'bg-yellow-100 text-yellow-700': item.status_id === 1,
                  'bg-green-100 text-green-700': item.status_id === 2,
                  'bg-red-100 text-red-700': item.status_id === 3
                }"
              >
                {{ getStatusLabel(item.status_id) }}
              </span>

              <p class="text-xs text-gray-400">
                {{ formatDate(item.suggested_at) }}
              </p>
            </div>

          </div>
        </div>

      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/services/api'
import { useRouter, useRoute  } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const suggestions = ref([])
const isLoading = ref(true)
const openMenuId = ref(null)
const approvedCount = ref(0);
const filters = ref({
  1: false,
  2: false,
  3: false
})

function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function getStatusLabel(status) {
  return {
    1: "Pendente",
    2: "Aprovada",
    3: "Recusada"
  }[status] || "—";
}

function editSuggestion(item) {
  openMenuId.value = null
  router.push({
    name: 'editSuggestion',
    params: { id: item.id },
    query: {
      f1: filters.value[1] ? 1 : 0,
      f2: filters.value[2] ? 1 : 0,
      f3: filters.value[3] ? 1 : 0,
    }
  });
}

async function deleteSuggestion(id) {
  if (!confirm("Deseja excluir esta sugestão?")) return

  try {
    await api.delete(`/fuel-price-suggestions/${id}`)

    suggestions.value = suggestions.value.filter(s => s.id !== id)
  } catch (error) {
    console.error("Erro ao excluir", error)

    alert(error.response?.data?.message || "Erro ao excluir. Tente novamente.")
  }

  openMenuId.value = null
}

const userId = JSON.parse(localStorage.getItem("user"))?.id;

const fetchApprovedCount = async () => {
  try {
    const { data } = await api.get(`/fuel-price-suggestions/user/${userId}/approved-count`);
    approvedCount.value = data.approved_count;
  } catch (e) {
    console.error("Erro ao buscar contagem de sugestões aprovadas", e);
  }
};

const filteredSuggestions = computed(() => {
  const activeStatuses = Object.keys(filters.value)
    .filter(key => filters.value[key])
    .map(Number)

  if (activeStatuses.length === 0 || activeStatuses.length === 3) {
    return suggestions.value
  }

  return suggestions.value.filter(item =>
    activeStatuses.includes(item.status_id)
  )
})

onMounted(async () => {
  if (route.query.edited === "success") {
    toast.success("Sugestão atualizada com sucesso!");

    router.replace({
      query: { ...route.query, edited: undefined },
    });
  }

  if (route.query.edited === "error") {
    toast.error("Não foi possível atualizar a sugestão. Tente novamente.");

    router.replace({
      query: { ...route.query, edited: undefined },
    });
  }

  if (route.query.f1 !== undefined) {
    filters.value[1] = route.query.f1 == 1
    filters.value[2] = route.query.f2 == 1
    filters.value[3] = route.query.f3 == 1
  }

  try {
    const { data } = await api.get('/fuel-price-suggestions')
    suggestions.value = data.data
    await fetchApprovedCount()
  } catch (error) {
    console.error('Erro ao carregar sugestões de preço', error)
  } finally {
    isLoading.value = false
  }
});

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatPrice(value) {
  if (value == null || value === '') return '—'
  return Number(value).toFixed(2).replace('.', ',')
}
</script>
