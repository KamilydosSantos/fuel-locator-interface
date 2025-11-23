<template>
  <div>
    <h1 class="text-2xl md:text-3xl font-semibold text-primary mb-4">
      Esqueceu sua senha?
    </h1>

    <p class="text-gray-600 mb-6 text-sm md:text-base">
      Por favor, informe o endereço de e-mail cadastrado na sua conta para que possamos enviar um link com as instruções necessárias para a redefinição da sua senha.
    </p>

    <InputField
      placeholder="E-mail"
      type="email"
      v-model="localEmail"
      :icon="MailIcon"
      required
      class="mb-6"
    />

    <button
      type="button"
      class="w-full flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition text-white"
      :class="loading ? 'bg-primary-disabled cursor-not-allowed' : 'bg-primary hover:bg-primary-contrast'"
      :disabled="loading"
      @click="$emit('submitted')"
    >
      <svg
        v-if="loading"
        class="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>

      {{ loading ? 'Enviando...' : 'Redefinir Senha' }}
    </button>

    <p v-if="error" class="text-red-500 text-sm mt-3">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import InputField from '@/components/InputField.vue'
import MailIcon from '@/components/icons/MailIcon.vue'

const props = defineProps({
  modelValue: String,
  loading: Boolean,
  error: String
})
const emit = defineEmits(['update:modelValue', 'submitted'])

const localEmail = ref(props.modelValue)
watch(localEmail, val => emit('update:modelValue', val))
</script>
