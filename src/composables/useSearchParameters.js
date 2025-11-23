import { ref, computed } from 'vue';

const MIN_RADIUS = 5;
const MAX_RADIUS = 100;

const fuelId = ref(2);
const searchRadius = ref(10);
const userLocation = ref(null);
const selectedCity = ref(null);

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

export function useSearchParameters() {

    const setUserLocation = (location) => {
        userLocation.value = location;
    };

    const setSelectedCity = (city) => {
        selectedCity.value = city;
    };

    const resetCity = () => {
        selectedCity.value = null;
    }

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
    };
}