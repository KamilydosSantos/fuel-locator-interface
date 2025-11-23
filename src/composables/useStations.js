import { ref, watch } from 'vue';
import { api } from '@/services/api.js';
import { createFuelIcon } from '@/utils/mapIcons.js';
import L from 'leaflet';

export function useStations(fuelIdRef) {
  const markers = ref([]);
  const stations = ref([]);
  const userLocation = ref(null);

  const getUserLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject('Geolocalização não suportada.');

      navigator.geolocation.getCurrentPosition(
        pos => {
          userLocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          resolve(userLocation.value);
        },
        err => reject(err),
        { enableHighAccuracy: true }
      );
    });
  };

  const clearMarkers = () => {
    markers.value.forEach(marker => marker.remove());
    markers.value = [];
  };

  const createMarker = (station, map) => {
    if (!station.address) return null;

    const flag = station.flag || 'Bandeira Branca';
    const selectedFuelPrice = station.fuel_prices?.find(f => f.fuel.id === fuelIdRef.value);

    const fuelContent = selectedFuelPrice
      ? `<div class="flex justify-between m-0 p-0">
            <span class="font-bold">${selectedFuelPrice.fuel.name}</span>
            <span class="font-bold text-primary">R$ ${Number(selectedFuelPrice.price).toFixed(2)}</span>
        </div>`
      : `<div class="text-gray-500 italic m-0 p-0">Nenhum preço cadastrado</div>`;

    const distanceBadge = station.distance
      ? `<div class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md mt-1 inline-block">
            Distância: ${station.distance.toFixed(2)} km
        </div>`
      : '';

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const canSuggest = user.role_id === 3;

    const suggestButton = canSuggest
      ? `<button onclick="window.location.href='/suggestions/new?station=${station.id}'"
          class="w-full px-3 py-2 bg-white hover:bg-gray-200 text-gray-700 rounded-lg text-sm border border-gray-200">
            Sugerir Preço
        </button>`
      : '';

    const popupContent = `
      <div class="bg-white p-4 font-sans w-80">
        <div class="flex justify-between items-center mb-2">
          <p class="font-bold text-gray-700 text-sm">${station.name} — ${flag}</p>
        </div>
        <div class="text-gray-700 text-sm">
          <div class="py-2 m-0">${station.address.street}, ${station.address.number} — ${station.address.neighborhood} — ${station.address.city?.name || ''}</div>
          ${distanceBadge}
        </div>
        <hr class="border-gray-100 my-2">
        <div class="text-gray-700 text-sm mb-2">
          ${fuelContent}
        </div>
        <div class="flex flex-col gap-2 mt-2">
          <button onclick="window.location.href='/stations/${station.id}'"
            class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
            Ver mais informações
          </button>
          ${suggestButton}
        </div>
      </div>
    `;

    return L.marker([station.address.latitude, station.address.longitude], { icon: createFuelIcon() })
      .bindPopup(popupContent)
      .addTo(map.value);
  };

  const addMarkers = (stationsData, map) => {
    clearMarkers();
    stationsData.forEach(station => {
      const marker = createMarker(station, map);
      if (marker) markers.value.push(marker);
    });
  };

  const fetchRouteDistance = async (user, station) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const url = `https://router.project-osrm.org/route/v1/driving/${user.lng},${user.lat};${station.address.longitude},${station.address.latitude}?overview=false`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`OSRM error: ${res.statusText}`);
      const data = await res.json();
      if (data.routes?.[0]?.distance) return data.routes[0].distance / 1000;
    } catch (err) {
      console.warn('Falha ao buscar rota no OSRM:', err);
    }
    return null;
  };

  const fetchStations = async (params, map) => {
    try {
      const { data } = await api.get('/stations/map', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const orderedStations = data.data.sort((a, b) => {
        const priceA = a.fuel_prices?.[0]?.price ?? Infinity;
        const priceB = b.fuel_prices?.[0]?.price ?? Infinity;
        return priceA - priceB;
      });

      try {
        const user = await getUserLocation();
        const stationsWithDistance = await Promise.all(
          orderedStations.map(async station => {
            const distance = await fetchRouteDistance(user, station);
            return { ...station, distance };
          })
        );
        stations.value = stationsWithDistance;
        addMarkers(stationsWithDistance, map);
      } catch {
        stations.value = orderedStations;
        addMarkers(orderedStations, map);
      }
    } catch (error) {
      console.error('Falha ao buscar postos:', error);
    }
  };

  watch(fuelIdRef, () => {
    if (stations.value.length && map.value) {
      addMarkers(stations.value, map.value);
    }
  });

  return { markers, stations, fetchStations, clearMarkers };
}
