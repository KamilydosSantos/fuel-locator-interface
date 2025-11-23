<template>
  <div class="relative p-6 max-w-2xl mx-auto">
    <button
      @click="router.push({
        name: 'map',
        query: route.query
      })"
      class="absolute top-4 left-4 p-2 border border-gray-100 rounded-full bg-white shadow-md hover:bg-gray-100 transition z-50"
    >
      <ArrowLeft class="w-6 h-6 text-gray-700" />
    </button>

    <h1 class="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
      Informações Detalhadas do Posto
    </h1>

    <div class="w-full max-w-2xl mx-auto border border-gray-100 bg-white shadow-md rounded-xl p-4">
      <div v-if="loading" class="text-center text-gray-500">Carregando informações do posto...</div>
      <div v-else-if="station">
        <!-- Cabeçalho -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800">{{ station?.name === 'Unnamed Station' ? 'Posto sem Nome' : station?.name }}</h1>
          <p class="text-gray-600">{{ station.flag || 'Bandeira Branca' }}</p>
          <div class="mt-1 flex items-align gap-2">
            <p class="text-gray-700">{{ station.address.street }}, {{ station.address.number }} — {{ station.address.neighborhood }} — {{ station.address.city?.name || '' }}</p>
            <a
              :href="`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${station.address.latitude},${station.address.longitude}`"
              target="_blank"
              class="inline-block px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-primary rounded-lg text-xs"
            >
              Abrir rota no Google Maps
            </a>
          </div>
        </div>

        <hr class="my-4 border-gray-200">

        <div>
          <h2 class="text-lg font-semibold text-gray-700 mb-2">Combustíveis disponíveis</h2>
          <ul class="space-y-2">
            <li
              v-for="fuel in station.fuel_prices.filter(f => f.price > 0)"
              :key="fuel.fuel.id"
              class=" bg-white p-3 rounded-lg shadow-sm border border-gray-100"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium">{{ fuel.fuel.name }}</span>
                <span class="font-bold text-primary">R$ {{ formatPrice(fuel.price) }}</span>
              </div>
              <p class="w-full text-end italic text-xs text-gray-700 mt-2">Última atualização em: {{ formatDate(fuel.updated_at) }}</p>
            </li>
          </ul>
        </div>
      </div>
      <div v-else class="text-red-500 text-center">Não foi possível carregar as informações do posto.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { api } from '@/services/api.js';
import { ArrowLeft } from "lucide-vue-next";
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const station = ref(null);
const loading = ref(true);

const fetchStation = async () => {
  try {
    const { data } = await api.get(`/stations/${route.params.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    station.value = data.data;
  } catch (err) {
    console.error('Erro ao buscar posto:', err);
    toast.error('Não foi possível carregar as informações do posto.');
  } finally {
    loading.value = false;
  }
};

function formatPrice(value) {
  if (value == null || value === '') return '—'
  return Number(value).toFixed(2).replace('.', ',')
}

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  fetchStation();
});
</script>