import { ref } from 'vue'
import L from 'leaflet'

export function useMap() {
  const map = ref(null)
  const userMarker = ref(null)

  const setupTileLayer = (instance) => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(instance)
  }

  const initializeWithCoords = (lat, lng, zoomLevel = 14) => {
    const container = document.getElementById('map')

    if (map.value && container) {
      map.value.setView([lat, lng], zoomLevel)
      updateUserMarker(lat, lng)
      return
    }

    if (map.value) {
      map.value.remove()
      map.value = null
    }

    const instance = L.map('map', { zoomControl: false })
      .setView([lat, lng], zoomLevel)

    setupTileLayer(instance)
    map.value = instance

    updateUserMarker(lat, lng)
  }

  const updateUserMarker = (lat, lng) => {
    if (!map.value) return

    if (userMarker.value) {
      userMarker.value.setLatLng([lat, lng])
      return
    }

    userMarker.value = L.circleMarker([lat, lng], {
      radius: 7,
      weight: 3,
      fillOpacity: 0.7,
      color: '#1d4ed8',
      fillColor: '#3b82f6'
    }).addTo(map.value)
  }

  const destroyMap = () => {
    if (map.value) {
      map.value.remove()
      map.value = null
      userMarker.value = null
    }
  }

  return {
    map,
    initializeWithCoords,
    destroyMap
  }
}