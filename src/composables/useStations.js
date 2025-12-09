import { ref, watch } from 'vue'
import { api } from '@/services/api.js'
import { createFuelIcon } from '@/utils/mapIcons.js'
import L from 'leaflet'

export function useStations(fuelIdRef) {
  const markers = ref([])
  const stations = ref([])
  const userLocation = ref(null)
  const locationAllowed = ref(false)
  const mapRef = ref(null)

  const isMobile = () => window.innerWidth < 768
  
  const setMap = map => {
    mapRef.value = map
  }
  const getUserLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        locationAllowed.value = false
        return reject('Geolocalização não suportada.')
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          userLocation.value = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }
          locationAllowed.value = true
          resolve(userLocation.value)
        },
        () => {
          locationAllowed.value = false
          reject('Usuário negou localização.')
        },
        { enableHighAccuracy: true }
      )
    })
  }

  const clearMarkers = () => {
    markers.value.forEach(m => m.marker.remove())
    markers.value = []
  }

  const buildPopupContent = station => {
    const mobile = isMobile()

    const popupWidthClass = mobile ? 'w-56 max-w-[85vw]' : 'w-80'
    const padding = mobile ? 'px-3 py-4' : 'p-4'
    const headerLayout = mobile
      ? 'flex flex-col gap-1'
      : 'flex justify-between items-center'

    const brand = station.brand || 'Bandeira Branca'
    const selectedFuelPrice = station.fuel_prices?.find(
      f => f.fuel.id === fuelIdRef.value
    )

    const fuelContent = selectedFuelPrice
      ? `
        <div class="flex justify-between text-sm">
          <span class="font-bold">${selectedFuelPrice.fuel.name}</span>
          <span class="font-bold text-primary">
            R$ ${Number(selectedFuelPrice.price).toFixed(2)}
          </span>
        </div>
      `
      : `<div class="text-gray-500 italic text-xs">Sem atualizações de preço.</div>`

    const distanceBadge = locationAllowed.value
      ? station.distanceLoading
        ? `<div class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md mt-1 inline-block">— km</div>`
        : station.distance != null
          ? `
            <div class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md mt-1 inline-block">
              ${station.distance.toFixed(1)} km
            </div>
          `
          : ''
      : '';

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const canSuggest = user.role_id === 3

    const suggestButton = canSuggest
      ? `
        <button
          onclick="window.location.href='/suggestions/new?station=${station.id}&fuel=${fuelIdRef.value}'"
          class="w-full px-3 py-2 bg-white hover:bg-gray-200 text-gray-700 rounded-lg text-xs border"
        >
          Sugerir Preço
        </button>
      `
      : '';

    return `
      <div class="bg-white font-sans ${popupWidthClass} ${padding}">
        <div class="${headerLayout}">
          <p class="font-bold text-gray-800 text-xs">${station.name}</p>
          <p class="text-gray-500 text-xs">${brand}</p>
        </div>

        <div class="text-gray-700 text-xs mt-2">
          ${station.address.street}, ${station.address.number}
          ${distanceBadge}
        </div>

        <hr class="border-gray-100 my-3">

        ${fuelContent}

        <div class="flex flex-col gap-2 mt-3">
          <button
            onclick="window.location.href='/stations/${station.id}'"
            class="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-xs"
          >
            Ver detalhes
          </button>
          ${suggestButton}
        </div>
      </div>
    `
  }

  const createMarker = (station, map) => {
    if (!station.address) return null

    const marker = L.marker(
      [station.address.latitude, station.address.longitude],
      { icon: createFuelIcon() }
    )
      .bindPopup(buildPopupContent(station))
      .addTo(map.value)

    return marker
  }

  const addMarkers = (stationsData, map) => {
    clearMarkers()

    stationsData.forEach(station => {
      const marker = createMarker(station, map)
      if (marker) {
        markers.value.push({ id: station.id, marker })
      }
    })
  }

  const openStationPopup = stationId => {
    const markerObj = markers.value.find(m => m.id === stationId)
    if (!markerObj || !mapRef.value) return

    const marker = markerObj.marker
    const latLng = marker.getLatLng()

    marker.openPopup()

    mapRef.value.setView(latLng, Math.max(mapRef.value.getZoom(), 15), {
      animate: true
    })
  }

  const fetchRouteDistance = async (user, station) => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const url = `https://router.project-osrm.org/route/v1/driving/${user.lng},${user.lat};${station.address.longitude},${station.address.latitude}?overview=false`
      const res = await fetch(url, { signal: controller.signal })

      clearTimeout(timeout)

      if (!res.ok) throw new Error(res.statusText)

      const data = await res.json()
      if (data.routes?.[0]?.distance)
        return data.routes[0].distance / 1000
    } catch (err) {
      console.warn('Erro ao calcular rota:', err)
    }

    return null
  }

  const loadDistances = async () => {
    try {
      const user = await getUserLocation()

      stations.value.forEach(station => {
        station.distanceLoading = true
      })

      for (const station of stations.value) {
        const distance = await fetchRouteDistance(user, station)
        station.distance = distance
        station.distanceLoading = false

        const markerObj = markers.value.find(m => m.id === station.id)
        if (markerObj) {
          markerObj.marker.setPopupContent(buildPopupContent(station))
        }
      }
    } catch {
      locationAllowed.value = false

      stations.value.forEach(station => {
        station.distance = null
        station.distanceLoading = false

        const markerObj = markers.value.find(m => m.id === station.id)
        if (markerObj) {
          markerObj.marker.setPopupContent(buildPopupContent(station))
        }
      })
    }
  }

  const fetchStations = async (params, map) => {
    try {
      const { data } = await api.get('/stations/map', {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      const orderedStations = data.data.sort((a, b) => {
        const priceA = a.fuel_prices?.[0]?.price ?? Infinity
        const priceB = b.fuel_prices?.[0]?.price ?? Infinity
        return priceA - priceB
      })

      stations.value = orderedStations.map(station => ({
        ...station,
        distance: null,
        distanceLoading: false
      }))

      addMarkers(stations.value, map)

      loadDistances()
    } catch (error) {
      console.error('Falha ao buscar postos:', error)
    }
  }

  watch(fuelIdRef, () => {
    if (stations.value.length) {
      markers.value.forEach(({ marker }) => {
        const station = stations.value.find(
          s => s.address.latitude === marker.getLatLng().lat
        )
        if (station) {
          marker.setPopupContent(buildPopupContent(station))
        }
      })
    }
  })

  return {
    markers,
    stations,
    openStationPopup,
    fetchStations,
    clearMarkers,
    locationAllowed,
    setMap
  }
}
