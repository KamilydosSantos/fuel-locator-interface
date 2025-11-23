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

    <h1 class="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6">
      Sugerir Preço de Combustível
    </h1>

    <div class="w-full max-w-2xl mx-auto border border-gray-100 bg-white shadow-md rounded-xl p-4">

      <div class="mb-4">
        <label class="text-sm font-medium text-gray-700">Posto de Combustível</label>
        <input
          type="text"
          class="w-full mt-1 px-3 py-2 border border-gray-300 bg-gray-100 rounded-lg"
          :value="stationDisplay"
          disabled
        />
      </div>

      <div class="mb-4">
        <label class="text-sm font-medium text-gray-700">Combustível</label>
        <select
          v-model="form.fuel_id"
          class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="" disabled>Selecione um combustível</option>
          <option v-for="fuel in fuels" :key="fuel.id" :value="fuel.id">
            {{ fuel.name }}
          </option>
        </select>
      </div>

      <!-- Preço -->
      <div class="mb-4">
        <label class="text-sm font-medium text-gray-700">Preço (R$)</label>
        <input
          v-model="form.suggested_price"
          type="number"
          step="0.01"
          min="0"
          class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Ex: 5.49"
        />
      </div>

      <div class="mb-4">
        <label class="text-sm font-medium text-gray-700">Foto do preço</label>

        <div class="relative mt-2 w-full h-76">
          <img
            v-if="form.photoPreview"
            :src="form.photoPreview"
            class="w-full h-full object-cover rounded-lg border border-gray-300 brightness-[0.40]"
          />

          <div
            v-else
            class="w-full h-full bg-gray-100 border border-gray-300 rounded-lg
                  flex items-center justify-center text-gray-500"
          ></div>

          <button
            @click="openCamera"
            class="absolute w-max left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                  px-6 py-3 rounded-lg text-white font-semibold
                  bg-black/60 hover:bg-black/70 transition shadow-lg"
          >
            {{ form.photoPreview ? "Atualizar foto" : "Adicionar foto" }}
          </button>
        </div>
      </div>

      <div v-if="!cameraAvailable" class="text-center text-red-500 mb-4">
        Seu dispositivo não possui câmera. Não é possível enviar uma sugestão.
      </div>

      <div class="flex gap-4 mt-3">
        <button
          @click="router.push({ name: 'map', query: route.query })"
          class="flex-1 py-3 text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>

        <button
          @click="submit"
          :disabled="loading"
          class="flex-1 py-3 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {{ loading ? "Salvando..." : "Salvar" }}
        </button>
      </div>
    </div>
  </div>
  <!-- Modal -->
  <CameraModal
    v-if="showCamera"
    @close="showCamera = false"
    @photo-taken="setPhoto"
  />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/services/api";
import { ArrowLeft } from "lucide-vue-next";
import CameraModal from "@/components/CameraModal.vue";

const route = useRoute();
const router = useRouter();

const stationId = route.query.station ?? null;
const selectedFuelFromMap = route.query.fuel ? Number(route.query.fuel) : null;

const station = ref(null);
const fuels = ref([]);
const loading = ref(false);

const cameraAvailable = ref(true);
const showCamera = ref(false);

const form = ref({
  station_id: stationId,
  fuel_id: selectedFuelFromMap || "",
  suggested_price: "",
  collected_at: new Date().toISOString().slice(0, 16),
  photo: null,
  photoPreview: null,
});

const stationDisplay = computed(() => {
  if (!station.value) return "";

  const name =
    !station.value.name || station.value.name === "Unnamed Station"
      ? "Posto sem nome"
      : station.value.name;

  const brand =
    !station.value.brand || station.value.brand === "unknown"
      ? "Bandeira Branca"
      : station.value.brand;

  return `${name} - ${brand}`;
});

onMounted(async () => {
  if (!stationId) router.push("/");

  const s = await api.get(`/stations/${stationId}`);
  station.value = s.data.data;

  const f = await api.get("/fuels");
  fuels.value = f.data.data;

  try {
    await navigator.mediaDevices.getUserMedia({ video: true });
    cameraAvailable.value = true;
  } catch (e) {
    cameraAvailable.value = false;
  }
});

const openCamera = () => {
  showCamera.value = true;
};

const setPhoto = (dataUrl) => {
  form.value.photo = dataUrl;
  form.value.photoPreview = dataUrl;
};

const submit = async () => {
  if (!form.value.fuel_id || !form.value.suggested_price || !form.value.photo) {
    alert("Preencha todos os campos e tire a foto.");
    return;
  }

  loading.value = true;

  try {
    const payload = new FormData();
    payload.append("station_id", form.value.station_id);
    payload.append("fuel_id", form.value.fuel_id);
    payload.append("suggested_price", form.value.suggested_price);
    payload.append("collected_at", form.value.collected_at);

    const res = await fetch(form.value.photo);
    const blob = await res.blob();
    payload.append("photo", blob, "photo.jpg");

    await api.post("/fuel-price-suggestions", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    router.push({ name: "map", query: { success: "suggestion_sent" } });
  } catch (e) {
    console.error(e);
    alert("Erro ao enviar sugestão!");
  } finally {
    loading.value = false;
  }
};
</script>
