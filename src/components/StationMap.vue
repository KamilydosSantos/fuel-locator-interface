<template>
  <div class="relative h-screen w-screen overflow-hidden">
    <div
      class="hidden md:block fixed left-0 top-0 h-full w-76 bg-gray-100 border-r border-gray-300 z-[910] overflow-y-auto"
    >
      <FuelsList :stations="stations" />
    </div>

    <div
      id="map"
      ref="mapContainer"
      :style="mapStyle"
      class="absolute top-0 h-full z-0"
    ></div>

    <TopBar
      class="block md:hidden absolute top-0 left-0 w-full z-[950]"
      :style="topbarStyle"
    />

    <div class="hidden md:block absolute top-0 right-0 z-[999] w-[calc(100%-19rem)]">
      <TopBar class="w-full" />
    </div>

    <div
      ref="panel"
      class="md:hidden absolute left-0 bottom-0 w-full bg-white shadow-xl transition-all duration-200 overflow-visible"
      :style="panelStyle"
    >
      <div
        class="w-full flex justify-center py-2 cursor-grab z-[1000]"
        @touchstart.passive="handleTouchStart"
        @touchmove.passive="handleTouchMove"
        @touchend.passive="handleTouchEnd"
        @mousedown.prevent="handleMouseStart"
      >
        <div class="w-12 h-1 rounded-full bg-gray-400"></div>
      </div>

      <div class="overflow-y-auto" :style="{ height: `calc(${panelHeight}vh - 20px)` }">
        <FuelsList :stations="stations" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted  } from 'vue'
import TopBar from '@/components/TopBar.vue'
import FuelsList from '@/components/FuelsList.vue'
import { useMap } from '@/composables/useMap.js'
import { useStations } from '@/composables/useStations.js'
import { useSearchParameters } from '@/composables/useSearchParameters.js'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import L from 'leaflet'

const { fuelId, searchRadius, currentPoint, selectedCity, radiusToZoom, setUserLocation } = useSearchParameters()
const { map, initializeWithCoords, destroyMap } = useMap()
const { stations, fetchStations } = useStations(fuelId)

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isDesktop = ref(window.innerWidth >= 768)

function handleResize() {
  isDesktop.value = window.innerWidth >= 768
  setTimeout(() => { if (map.value?.invalidateSize) map.value.invalidateSize() }, 120)
}
window.addEventListener('resize', handleResize)

const mapStyle = computed(() => {
  if (isDesktop.value) {
    return {
      left: '19rem',
      width: 'calc(100% - 19rem)'
    }
  }
  return {
    left: '0',
    width: '100%'
  }
})

const topbarStyle = computed(() => {
  const panelFull = panelHeight.value >= FULL_THRESHOLD
  return { pointerEvents: 'auto', zIndex: panelFull ? 900 : 2000 }
})

const panelHeight = ref(15)
const dragStartY = ref(0)
const initialHeight = ref(15)
const isDragging = ref(false)

const SNAP_SMALL = 15
const SNAP_MID = 50
const SNAP_FULL = 100
const FULL_THRESHOLD = 100

const panelStyle = computed(() => {
  const isFull = panelHeight.value >= FULL_THRESHOLD
  if (isFull) {
    return {
      top: '0px',
      bottom: 'auto',
      height: '100vh',
      zIndex: 3000,
      borderTopLeftRadius: '0px',
      borderTopRightRadius: '0px',
      boxShadow: '0 -8px 30px rgba(0,0,0,0.2)'
    }
  }
  return {
    top: 'auto',
    bottom: '0px',
    height: `${panelHeight.value}vh`,
    zIndex: 1200,
    borderTopLeftRadius: '18px',
    borderTopRightRadius: '18px',
    boxShadow: '0 -4px 18px rgba(0,0,0,0.12)'
  }
})

function handleTouchStart(e) {
  isDragging.value = true
  dragStartY.value = e.touches ? e.touches[0].clientY : e.clientY
  initialHeight.value = panelHeight.value
}

function handleTouchMove(e) {
  if (!isDragging.value) return
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const delta = dragStartY.value - clientY
  const heightChange = (delta / window.innerHeight) * 100
  let newHeight = initialHeight.value + heightChange
  newHeight = Math.max(SNAP_SMALL, Math.min(SNAP_FULL, newHeight))
  panelHeight.value = newHeight
}

function handleTouchEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  if (panelHeight.value < (SNAP_MID + SNAP_SMALL) / 2) panelHeight.value = SNAP_SMALL
  else if (panelHeight.value < (SNAP_FULL + SNAP_MID) / 2) panelHeight.value = SNAP_MID
  else panelHeight.value = SNAP_FULL

  setTimeout(() => { if (map.value?.invalidateSize) map.value.invalidateSize() }, 180)
}

function handleMouseStart(e) {
  isDragging.value = true
  dragStartY.value = e.clientY
  initialHeight.value = panelHeight.value

  const onMouseMove = (ev) => {
    if (!isDragging.value) return
    const clientY = ev.clientY
    const delta = dragStartY.value - clientY
    const heightChange = (delta / window.innerHeight) * 100
    let newHeight = initialHeight.value + heightChange
    newHeight = Math.max(SNAP_SMALL, Math.min(SNAP_FULL, newHeight))
    panelHeight.value = newHeight
  }

  const onMouseUp = (ev) => {
    if (!isDragging.value) return
    isDragging.value = false
    if (panelHeight.value < (SNAP_MID + SNAP_SMALL) / 2) panelHeight.value = SNAP_SMALL
    else if (panelHeight.value < (SNAP_FULL + SNAP_MID) / 2) panelHeight.value = SNAP_MID
    else panelHeight.value = SNAP_FULL

    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)

    setTimeout(() => { if (map.value?.invalidateSize) map.value.invalidateSize() }, 180)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const searchCircle = ref(null)

function updateSearchCircle(lat, lng, radiusKm) {
  if (!map.value) return
  try { searchCircle.value?.remove() } catch (e) {}
  searchCircle.value = L.circle([lat, lng], {
    radius: radiusKm * 1000,
    color: '#007BFF',
    fillColor: '#007BFF',
    fillOpacity: 0.1,
    weight: 1
  }).addTo(map.value)
}

function onMapReady() {
  const point = currentPoint.value
  if (!map.value || !point) return
  fetchStations({ fuel_id: fuelId.value, lat: point.lat, lng: point.lng, radius: searchRadius.value }, map, fuelId.value)
  updateSearchCircle(point.lat, point.lng, searchRadius.value)
}

function updateMapView(point, radius) {
  if (!map.value || !point) return
  try { map.value.setView([point.lat, point.lng], radiusToZoom(radius)) } catch (e) {}
}

function initMapAndLocation() {
  if (!navigator.geolocation) {
    initializeWithCoords(-14.235, -51.9253, 4.5)
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude

      setUserLocation({ lat, lng })
      initializeWithCoords(lat, lng, radiusToZoom(searchRadius.value))

      setTimeout(() => {
        map.value?.invalidateSize()
      }, 300)

      onMapReady()
    },
    () => {
      toast.info('Não foi possível obter sua localização. Ative a permissão de localização para exibir os postos próximos.')

      initializeWithCoords(-14.235, -51.9253, 4.5)

      setTimeout(() => {
        map.value?.invalidateSize()
      }, 300)
    },
    { enableHighAccuracy: true }
  )
}

watch([fuelId, searchRadius], () => {
  if (currentPoint.value) {
    updateMapView(currentPoint.value, searchRadius.value)
    onMapReady()
  }
})
watch(selectedCity, (newCity) => {
  if (newCity && currentPoint.value) {
    updateMapView(currentPoint.value, searchRadius.value)
    onMapReady()
  }
})

onMounted(() => {
  handleResize()

  if (route.query.success === 'suggestion_sent') {
    toast.success('Sugestão enviada com sucesso!')
    router.replace({ query: {} })
  }

  if (route.query.error === 'suggestion_failed') {
    toast.error('Não foi possível enviar a sugestão. Tente novamente.')
    router.replace({ query: {} })
  }

  if (route.query.success === 'request_sent') {
    toast.success('Solicitação enviada com sucesso!')
    router.replace({ query: {} })
  }

  if (route.query.error === 'request_failed') {
    toast.error('Não foi possível enviar a solicitação. Tente novamente.')
    router.replace({ query: {} })
  }

  if (currentPoint.value) {
    initializeWithCoords(
      currentPoint.value.lat,
      currentPoint.value.lng,
      radiusToZoom(searchRadius.value)
    )

    setTimeout(() => {
      map.value?.invalidateSize()
    }, 300)

    onMapReady()
  } else {
    initMapAndLocation()
  }
})

onUnmounted(() => {
  destroyMap()
})
</script>
