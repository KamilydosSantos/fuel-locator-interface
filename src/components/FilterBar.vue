<template>
  <div class="flex-1 bg-white p-2 rounded-3xl shadow-lg">
    <label class="block mb-1 text-sm font-medium text-gray-700 pl-2">Combustível</label>
    <select
      v-model="fuelId"
      class="w-full h-10 p-2.5 pr-8 rounded-2xl bg-white text-gray-800 border border-gray-200 shadow-sm
            focus:outline-none cursor-pointer"
    >
      <option v-for="fuel in fuels" :key="fuel.id" :value="fuel.id">
        {{ fuel.name }}
      </option>
    </select>
  </div>

  <div class="flex-3 bg-white p-2 rounded-3xl relative shadow-lg">
    <label class="block mb-1 text-sm font-medium text-gray-700 pl-2">Cidade</label>
    <input
      type="text"
      v-model="cityQuery"
      @input="fetchCities"
      class="w-full h-10 p-2.5 rounded-2xl bg-white text-gray-800 border border-gray-200 shadow-sm focus:outline-none"
      placeholder="Digite o nome da cidade"
    />

    <ul
      v-if="cityOptions.length"
      class="absolute z-10 border border-primary bg-white rounded-xl mt-1 max-h-48 overflow-auto"
      style="width: calc(100% - 32px) !important;"
    >
      <li
        v-for="city in cityOptions"
        :key="city.id"
        class="p-2 hover:bg-gray-100 text-sm"
        @click="handleSelectCity(city)"
      >
        {{ city.name }}
      </li>
    </ul>
  </div>

  <div class="flex-1 bg-white p-2 rounded-3xl shadow-lg flex flex-col gap-1">
    <label class="block mb-1 text-sm font-medium text-gray-700 pl-2">
      Raio de busca <span class="bg-primary p-1 rounded-md text-xs text-white"> {{ searchRadius }} km</span>
    </label>
    <input
      type="range"
      v-model="searchRadius"
      :min="MIN_RADIUS"
      :max="MAX_RADIUS"
      step="5"
      class="w-full accent-primary cursor-pointer"
    />
    <p class="w-full flex justify-between text-xs text-gray-700 px-2"><span>5 km</span><span>100 km</span></p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/services/api.js';
import { useSearchParameters } from '@/composables/useSearchParameters.js';

const { fuelId, searchRadius, setSelectedCity, MIN_RADIUS, MAX_RADIUS, resetCity } = useSearchParameters();

const fuels = ref([]);
const cityQuery = ref('');
const cityOptions = ref([]);

async function fetchFuels() {
  try {
    const { data } = await api.get('/fuels');
    fuels.value = data.data;
  } catch (error) {
    console.error('Erro ao carregar combustíveis', error);
  }
}

async function fetchCities() {
  if (!cityQuery.value) {
    cityOptions.value = [];
    resetCity();
    return;
  }

  try {
    const { data } = await api.get('/cities', {
      params: { q: cityQuery.value },
    });
    cityOptions.value = data.data;
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
  }
}

function handleSelectCity(city) {
  setSelectedCity(city);
  cityQuery.value = city.name;
  cityOptions.value = [];
}

onMounted(() => {
  fetchFuels();
});

</script>
