<template>
  <div class="flex h-screen">
    <TopBar class="w-[calc(100%-19rem)] absolute top-0 right-0 z-999" />

    <FuelsList
        class="w-76 bg-gray-100 border-r border-gray-300 p-4"
        :stations="stations"
    />

    <div class="w-[calc(100%-19rem)]">
      <div id="map" class="w-full h-screen"></div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { ref, watch, onMounted } from 'vue';
import L from 'leaflet';
import TopBar from '@/components/TopBar.vue';
import FuelsList from '@/components/FuelsList.vue';
import { useMap } from '@/composables/useMap.js';
import { useStations } from '@/composables/useStations.js';
import { useSearchParameters } from '@/composables/useSearchParameters.js';

const { fuelId, searchRadius, currentPoint, selectedCity, radiusToZoom, setUserLocation } = useSearchParameters();

const searchCircle = ref(null);
const { map, initializeWithCoords, userLocation: mapUserLocation } = useMap();
const { stations, fetchStations } = useStations(fuelId); 

const route = useRoute();
const router = useRouter();
const toast = useToast();

function updateSearchCircle(lat, lng, radiusKm) {
  if (searchCircle.value) {
    searchCircle.value.remove();
  }

  searchCircle.value = L.circle([lat, lng], {
    radius: radiusKm * 1000,
    color: '#007BFF',
    fillColor: '#007BFF',
    fillOpacity: 0.1,
    weight: 1,
  }).addTo(map.value);
}

function onMapReady() {
  const point = currentPoint.value;
  if (!map.value || !point) return;

  const query = {
    fuel_id: fuelId.value,
    lat: point.lat,
    lng: point.lng,
    radius: searchRadius.value,
  };

  fetchStations(query, map, fuelId.value);
  updateSearchCircle(point.lat, point.lng, searchRadius.value);
}

function updateMapView(point, radius) {
  if (!map.value || !point) return;
  const zoomLevel = radiusToZoom(radius);
  map.value.setView([point.lat, point.lng], zoomLevel);
}

function initMapAndLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const location = { lat, lng };

      setUserLocation(location);

      const zoomLevel = radiusToZoom(searchRadius.value);
      initializeWithCoords(lat, lng, zoomLevel);

      L.circleMarker([lat, lng], {
        radius: 8,
        weight: 3,
        fillOpacity: 0.7,
        color: '#1d4ed8',
        fillColor: '#3b82f6',
      }).addTo(map.value);

      onMapReady();
    },
    (err) => {
      console.warn('Erro ao obter localização:', err);
      toast.info(
        'Não foi possível obter sua localização. Ative a permissão de localização para exibir os postos próximos.'
      );
    },
    { enableHighAccuracy: true }
  );
}

watch([fuelId, searchRadius], () => {
  if (currentPoint.value) {
    updateMapView(currentPoint.value, searchRadius.value);
    onMapReady();
  }
});

watch(selectedCity, (newCity) => {
  if (newCity) {
    updateMapView(currentPoint.value, searchRadius.value);
    onMapReady();
  }
});

onMounted(() => {
  if (route.query.success === "suggestion_sent") {
    toast.success("Sugestão enviada com sucesso!");
    router.replace({ query: {} });
  } else if (route.query.success === "request_sent") {
    toast.success("Solicitação enviada com sucesso!");
    router.replace({ query: {} });
  }

  initMapAndLocation();
});
</script>
