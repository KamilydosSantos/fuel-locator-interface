import { ref, onMounted } from 'vue';
import L from 'leaflet';

export function useMap(onMapReady) {
  const map = ref(null);
  const userLocation = ref(null);

  const BRAZIL_CENTER = [-14.235, -51.9253];
  const BRAZIL_ZOOM = 4.5;

  const setupTileLayer = (instance) => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(instance);
  };

  const initializeWithCoords = (lat, lng, zoomLevel = 14) => {
    const instance = L.map('map', { zoomControl: false }).setView([lat, lng], zoomLevel);
    setupTileLayer(instance);
    map.value = instance;
    userLocation.value = { lat, lng };
    onMapReady?.(lat, lng);
  };

  const initializeBrazilFallback = () => {
    initializeWithCoords(BRAZIL_CENTER[0], BRAZIL_CENTER[1], BRAZIL_ZOOM);
  };

  onMounted(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const defaultRadius = 10;
        const zoomLevel = radiusToZoom(defaultRadius);
        initializeWithCoords(latitude, longitude, zoomLevel);
      },
      () => initializeBrazilFallback(),
      { enableHighAccuracy: true }
    );
  });

  const radiusToZoom = (radiusKm) => {
    if (radiusKm <= 5) return 14;
    if (radiusKm <= 10) return 13;
    if (radiusKm <= 20) return 12;
    if (radiusKm <= 50) return 11;
    return 10;
  };

  return { map, userLocation, initializeWithCoords, radiusToZoom };
}
