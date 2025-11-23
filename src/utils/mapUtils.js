export function getCurrentPoint(selectedCity, userLocation) {
  if (selectedCity) return { lat: selectedCity.latitude, lng: selectedCity.longitude };
  return userLocation || null;
}

export function updateSearchCircle(map, lat, lng, radiusKm) {
  if (!map) return;
  if (map.searchCircle) map.searchCircle.remove();

  map.searchCircle = L.circle([lat, lng], {
    radius: radiusKm * 1000,
    color: '#007BFF',
    fillColor: '#007BFF',
    fillOpacity: 0.1,
    weight: 1,
  }).addTo(map);
}

export function createFuelIcon() {
  return L.icon({
    iconUrl: '/icons/fuel.svg',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  });
}
