<template>
  <div>
    <h1 class="text-2xl md:text-3xl font-semibold text-primary mb-2">
      Enviamos um link para o seu e-mail.
    </h1>

    <p class="text-gray-600 mb-4">Verifique sua caixa de entrada e spam!</p>

    <p class="text-gray-500 text-sm mb-6">
      <template v-if="countdown > 0">
        Não recebeu? Reenvio disponível em
        <span class="font-semibold text-primary">{{ countdown }}</span>s.
      </template>
      <template v-else>
        Não recebeu? Clique abaixo para reenviar.
      </template>
    </p>

    <button
      class="w-full flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition text-white"
      :class="countdown > 0 ? 'bg-primary-disabled cursor-not-allowed' : 'bg-primary hover:bg-primary-contrast'"
      :disabled="countdown > 0"
      @click="$emit('resend')"
    >
      Reenviar e-mail
    </button>
  </div>
</template>

<script setup>
defineProps({
  countdown: Number
})
defineEmits(['resend'])
</script>
