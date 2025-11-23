<template>
  <div class="relative w-full">
    <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
      <component
        :is="icon"
        class="w-5 h-5 transition-colors"
        :class="isFocused ? 'text-primary' : 'text-gray-200'"
      />
    </span>

    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :type="type"
      @focus="isFocused = true"
      @blur="isFocused = false"
      class="w-full border border-gray-200 rounded-2xl px-10 py-2 focus:ring-2 focus:ring-primary focus:outline-none placeholder-gray-400"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isFocused = ref(false)

defineProps({
  modelValue: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: String,
  icon: {
    type: Object,
    default: null,
  },
})
</script>
