<template>
  <div class="w-full flex flex-col md:flex-row gap-1 md:gap-2">

    <div class="flex-1 bg-white p-1.5 md:p-2 rounded-2xl md:rounded-3xl shadow-lg order-2 md:order-none">
      <label class="block mb-0.5 md:mb-1 text-xs md:text-sm font-medium text-gray-700 pl-1 md:pl-2">
        Combustível
      </label>

      <select
        v-model="fuelId"
        class="w-full h-9 md:h-10 text-xs md:text-sm p-2 md:p-2.5 pr-6 md:pr-8 rounded-2xl bg-white
               text-gray-800 border border-gray-200 shadow-sm focus:outline-none cursor-pointer"
      >
        <option v-for="fuel in fuels" :key="fuel.id" :value="fuel.id">
          {{ fuel.name }}
        </option>
      </select>
    </div>

    <div class="flex-3 bg-white p-1.5 md:p-2 rounded-2xl md:rounded-3xl relative shadow-lg order-1 md:order-none">
      <label class="block mb-0.5 md:mb-1 text-xs md:text-sm font-medium text-gray-700 pl-1 md:pl-2">
        Cidade
      </label>

      <div class="relative">
        <input
          type="text"
          v-model="cityQuery"
          @input="fetchCities"
          class="w-full h-9 md:h-10 text-xs md:text-sm p-2 md:p-2.5 rounded-2xl bg-white text-gray-800
                border border-gray-200 shadow-sm focus:outline-none"
          placeholder="Digite o nome da cidade"
        />
        <button
          v-if="cityQuery"
          type="button"
          @click="clearCity"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          aria-label="Limpar cidade"
        >
          ✕
        </button>
      </div>

      <ul
        v-if="cityOptions.length"
        class="absolute z-10 border border-primary bg-white rounded-xl mt-1 max-h-40 md:max-h-48 overflow-auto
               text-xs md:text-sm"
        style="width: calc(100% - 16px) !important;"
      >
        <li
          v-for="city in cityOptions"
          :key="city.id"
          class="p-2 hover:bg-gray-100"
          @click="handleSelectCity(city)"
        >
          {{ city.name }} ({{ city.state }})
        </li>
      </ul>
    </div>

    <div class="flex-1 bg-white p-1.5 md:p-2 rounded-2xl md:rounded-3xl shadow-lg flex flex-col gap-0.5 md:gap-1
                order-3 md:order-none">
      <label class="block mb-0.5 md:mb-1 text-xs md:text-sm font-medium text-gray-700 pl-1 md:pl-2">
        Raio de busca
        <span class="bg-primary p-0.5 md:p-1 rounded-md text-[10px] md:text-xs text-white">
          {{ searchRadius }} km
        </span>
      </label>

      <input
        type="range"
        v-model="searchRadius"
        :min="MIN_RADIUS"
        :max="MAX_RADIUS"
        step="5"
        class="w-full accent-primary cursor-pointer"
      />

      <p class="w-full flex justify-between text-[10px] md:text-xs text-gray-700 px-1 md:px-2">
        <span>5 km</span><span>100 km</span>
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/services/api.js';
import { useSearchParameters } from '@/composables/useSearchParameters.js';

const { fuelId, searchRadius, selectedCity, setSelectedCity, userLocation, MIN_RADIUS, MAX_RADIUS, resetCity } = useSearchParameters();

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

function clearCity() {
  cityQuery.value = '';
  cityOptions.value = [];
  resetCity();
}

onMounted(() => {
  fetchFuels();

  if (selectedCity.value) {
    cityQuery.value = selectedCity.value.name;
  }
});

</script>