import { ref, computed, watch } from 'vue';

const STORAGE_KEY = 'search_params_v1';

const MIN_RADIUS = 5;
const MAX_RADIUS = 100;

const DEFAULT_FUEL_ID = 5;
const DEFAULT_SEARCH_RADIUS = 10;
const DEFAULT_USER_LOCATION = null;
const DEFAULT_SELECTED_CITY = null;

let saved = {};
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) saved = JSON.parse(raw);
} catch (e) {
  saved = {};
}

const fuelId = ref(saved.fuelId ?? DEFAULT_FUEL_ID);
const searchRadius = ref(saved.searchRadius ?? DEFAULT_SEARCH_RADIUS);
const userLocation = ref(saved.userLocation ?? DEFAULT_USER_LOCATION);
const selectedCity = ref(saved.selectedCity ?? DEFAULT_SELECTED_CITY);

const radiusToZoom = (radiusKm) => {
    if (radiusKm <= 5) return 14;
    if (radiusKm <= 10) return 13;
    if (radiusKm <= 20) return 12;
    if (radiusKm <= 35) return 11;
    if (radiusKm <= 70) return 10;
    return 9;
};

const currentPoint = computed(() => {
    if (selectedCity.value) {
        return { lat: selectedCity.value.lat, lng: selectedCity.value.lng };
    }
    if (userLocation.value) {
        return { lat: userLocation.value.lat, lng: userLocation.value.lng };
    }
    return null;
});

watch([fuelId, searchRadius, userLocation, selectedCity], () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fuelId: fuelId.value,
        searchRadius: searchRadius.value,
        userLocation: userLocation.value,
        selectedCity: selectedCity.value,
      })
    );
  } catch (e) {
  }
}, { deep: true });

export function useSearchParameters() {

    const setUserLocation = (location) => {
        userLocation.value = location;
    };

    const setSelectedCity = (city) => {
        selectedCity.value = city;
    };

    const resetCity = () => {
        selectedCity.value = null;
    };

    const setFuelId = (id) => {
        fuelId.value = id;
    };

    const setSearchRadius = (radius) => {
        const r = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radius));
        searchRadius.value = r;
    };

    const clearSavedParameters = () => {
        try {
        localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
        fuelId.value = DEFAULT_FUEL_ID;
        searchRadius.value = DEFAULT_SEARCH_RADIUS;
        userLocation.value = DEFAULT_USER_LOCATION;
        selectedCity.value = DEFAULT_SELECTED_CITY;
    };

    return {
        fuelId,
        searchRadius,
        userLocation,
        selectedCity,
        currentPoint,

        MIN_RADIUS,
        MAX_RADIUS,

        radiusToZoom,
        setUserLocation,
        setSelectedCity,
        resetCity,
        setFuelId,
        setSearchRadius,
        clearSavedParameters,
    };
}