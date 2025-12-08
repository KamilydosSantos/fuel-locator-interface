<template>
  <div class="bg-transparent py-4 px-8 flex flex-col gap-3">
    <div class="flex items-center justify-between md:hidden">
      <button
        class="bg-white px-3 py-1 rounded-md shadow text-sm font-medium"
        @click="toggleFilters"
      >
        Filtros
      </button>

      <button
        @click="toggleModal"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
        class="flex items-center justify-center rounded-full bg-white transition cursor-pointer shadow-lg hover:shadow-2xl w-12 h-12"
      >
        <UserIcon :color="isHover ? primary : gray200" class="w-6" />
      </button>
    </div>

    <div class="hidden md:flex items-center justify-between w-full gap-2">
      <FilterBar />

      <button
        @click="toggleModal"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
        class="flex items-center justify-center rounded-full bg-white transition cursor-pointer shadow-lg hover:shadow-2xl w-16 h-16"
      >
        <UserIcon :color="isHover ? primary : gray200" class="w-7" />
      </button>
    </div>

    <div v-if="showFilters" class="md:hidden">
      <FilterBar />
    </div>

    <UserModal
      v-if="showModal"
      :user-name="user?.name"
      :user-role="user?.role_id"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api.js'
import FilterBar from '@/components/FilterBar.vue'
import UserIcon from '@/components/icons/UserIcon.vue'
import UserModal from '@/components/UserModal.vue'

const user = ref(null)
const showModal = ref(false)
const isHover = ref(false)
const showFilters = ref(false)

onMounted(async () => {
  try {
    const { data } = await api.get('/user')
    user.value = data
  } catch (err) {
  }
})

const gray200 = '#e5e7eb'
const primary = '#007BFF'

function toggleModal() {
  showModal.value = !showModal.value
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}
</script>
