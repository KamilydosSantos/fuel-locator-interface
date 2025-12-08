<template>
  <div class="relative p-6 max-w-2xl mx-auto">
    <button
      @click="router.push({
        name: 'priceSuggestions',
        query: route.query
      })"
      class="absolute top-4 left-4 p-2 border border-gray-100 rounded-full bg-white shadow-md hover:bg-gray-100 transition z-50"
    >
      <ArrowLeft class="w-6 h-6 text-gray-700" />
    </button>

    <h1 class="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
      Editar sugestão de preço
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
          <option disabled value="">Selecione um combustível</option>
          <option v-for="fuel in fuels" :key="fuel.id" :value="fuel.id">
            {{ fuel.name }}
          </option>
        </select>
      </div>

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

          <button
            @click="openCamera"
            class="absolute w-max left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                  px-6 py-3 rounded-lg text-white font-semibold
                  bg-black/60 hover:bg-black/70 transition shadow-lg"
          >
            Atualizar foto
          </button>
        </div>
      </div>

      <div v-if="!cameraAvailable" class="text-center text-red-500 mb-4">
        Seu dispositivo não possui câmera.
      </div>

      <div class="flex gap-4 mt-3">
        <button
          @click="router.push({ name: 'priceSuggestions', query: route.query })"
          class="flex-1 py-3 text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>

        <button
          @click="updateSuggestion"
          :disabled="loading"
          class="flex-1 py-3 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {{ loading ? "Salvando..." : "Salvar" }}
        </button>
      </div>
    </div>
  </div>

  <CameraModal
    v-if="showCamera"
    @close="showCamera = false"
    @photo-taken="setPhoto"
  />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import { api } from "@/services/api";
import CameraModal from "@/components/CameraModal.vue";

const route = useRoute();
const router = useRouter();

const id = route.params.id;

const suggestion = ref(null);
const station = ref(null);
const fuels = ref([]);

const loading = ref(false);
const cameraAvailable = ref(true);
const showCamera = ref(false);

const form = ref({
  station_id: "",
  fuel_id: "",
  suggested_price: "",
  collected_at: "",
  photo: null,
  photoPreview: null,
});

const stationDisplay = computed(() => {
  if (!station.value) return "";
  let name = station.value.name;

  if (!name || name === "Unnamed Station") {
    name = "Posto sem Nome";
  }
  const brand = station.value.brand || "Bandeira Branca";

  return `${name} - ${brand}`;
});

onMounted(async () => {
  try {
    const res = await api.get(`/fuel-price-suggestions/${id}`);
    suggestion.value = res.data.data;

    form.value.station_id = suggestion.value.station.id;
    form.value.fuel_id = suggestion.value.fuel.id;
    form.value.suggested_price = suggestion.value.suggested_price;
    form.value.collected_at = suggestion.value.suggested_at;

    form.value.photoPreview = suggestion.value.photo_path
      ? `http://localhost/storage/${suggestion.value.photo_path}`
      : null;

    station.value = suggestion.value.station;

    const fuelsResponse = await api.get("/fuels");
    fuels.value = fuelsResponse.data.data;

    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      cameraAvailable.value = true;
    } catch {
      cameraAvailable.value = false;
    }
  } catch (e) {
    console.error(e);
    alert("Erro ao carregar sugestão.");
  }
});

const openCamera = () => {
  showCamera.value = true;
};

const setPhoto = (dataUrl) => {
  form.value.photo = dataUrl;
  form.value.photoPreview = dataUrl;
};

const updateSuggestion = async () => {
  loading.value = true;

  try {
    const payload = new FormData();

    payload.append("fuel_id", form.value.fuel_id);
    payload.append("suggested_price", form.value.suggested_price);
    payload.append("collected_at", form.value.collected_at);

    if (form.value.photo && !form.value.photoPreview.startsWith("http")) {
      const res = await fetch(form.value.photo);
      const blob = await res.blob();
      payload.append("photo", blob, "photo.jpg");
    }

    payload.append("_method", "PATCH");

    await api.post(`/fuel-price-suggestions/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    router.push({
      name: "priceSuggestions",
      query: {
        ...route.query,
        edited: "success",
      },
    });

  } catch (e) {
    console.error(e);

    router.push({
      name: "priceSuggestions",
      query: {
        ...route.query,
        edited: "edit_suggestion_failed",
      },
    })
  } finally {
    loading.value = false;
  }
};
</script>