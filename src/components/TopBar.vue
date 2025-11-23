<template>
  <div class="bg-transparent py-4 px-8 flex items-center justify-between gap-4">
    <FilterBar />

    <button
      @click="toggleModal"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
      class="w-16 h-16 flex items-center justify-center rounded-full bg-white transition cursor-pointer shadow-lg hover:shadow-2xl"
    >
      <UserIcon
        :color="isHover ? primary : gray200"
        class="w-7"
      />
    </button>

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

const userName = localStorage.getItem('user_name') || 'Usuário'

onMounted(async () => {
  const { data } = await api.get('/user')
  user.value = data;
})

const gray200 = '#e5e7eb'
const primary = '#007BFF'

function toggleModal() {
  showModal.value = !showModal.value
}
</script>
