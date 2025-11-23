<template>
  <div class="h-screen overflow-y-auto bg-white p-4 border-r border-gray-200">
    <h2 class="text-lg font-semibold mb-4 text-gray-800">Postos encontrados</h2>

    <div class="mb-4 flex items-center gap-2">
      <label for="sort" class="text-gray-700 text-sm whitespace-nowrap font-medium">Ordenar por:</label>
      <select
        id="sort"
        v-model="sortOption"
        class="flex-1 h-9 p-1 pr-8 rounded-2xl bg-white text-gray-800 border border-gray-200 shadow-sm focus:outline-none cursor-pointer text-sm"
      >
        <option value="price">Menor preço</option>
        <option value="distance">Menor distância</option>
      </select>
    </div>

    <div v-if="!sortedStations.length" class="text-gray-500 text-sm">
      Nenhum posto encontrado.
    </div>

    <ul v-else>
      <li
        v-for="station in sortedStations"
        :key="station.id"
        class="mb-4 p-4 rounded-2xl shadow-sm bg-white hover:shadow-md transition"
      >
        <div class="flex flex-col items-center gap-2 mb-2">
          <div class="flex justify-between items-center w-full">
            <h3 class="font-semibold text-gray-900 text-base text-sm">
            {{ station?.name === 'Unnamed Station' ? 'Posto sem Nome' : station?.name }} - {{ station.brand || 'Bandeira Branca' }}
            </h3>
            <div v-if="station.distance" class="text-xs font-bold text-gray-500">
              {{ station.distance.toFixed(1) }} km
            </div>
          </div>

          <p class="text-sm text-gray-600 w-full">
            {{ station.address?.street }}, {{ station.address?.number }}
          </p>
        </div>

        <div
          v-for="price in station.fuel_prices"
          :key="price.fuel_id"
          class="border-t border-gray-100 pt-2 mt-2"
        >
          <div class="flex justify-between items-center text-sm font-medium text-gray-800">
            <span>{{ price.fuel.name }}</span>
            <span class="text-primary">R$ {{ Number(price.price).toFixed(2) }}</span>
          </div>
          <div class="italic text-xs text-gray-500 mt-1">
            Atualizado em: {{ formatDate(price.updated_at) }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  stations: {
    type: Array,
    default: () => []
  }
})

const sortOption = ref('price')

const sortedStations = computed(() => {
  const list = [...props.stations]

  if (sortOption.value === 'distance') {
    return list.sort(
      (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
    )
  }

  return list.sort((a, b) => {
    const priceA = a.fuel_prices?.[0]?.price ?? Infinity
    const priceB = b.fuel_prices?.[0]?.price ?? Infinity
    return priceA - priceB
  })
})

function formatDate(dateString) {
  if (!dateString) return 'Data não informada'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>
