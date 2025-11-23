<template>
  <div class="flex items-center justify-center h-screen bg-gray-100 px-4">
    <div
      class="relative w-full max-w-3xl h-[450px] rounded-3xl overflow-hidden shadow-xl"
    >
      <img
        src="/images/fundo_mapa_login.png"
        alt="imagem decorativa do mapa da aplicação com marcadores"
        class="absolute inset-0 w-full h-full object-cover object-center opacity-40"
      />

      <div
        class="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
      >
        <h1 class="text-6xl font-extrabold text-primary drop-shadow mb-4">
          404
        </h1>

        <p class="text-lg text-gray-700 font-medium mb-6">
          Página não encontrada.
        </p>

        <button
          @click="goBack"
          class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition shadow-lg"
        >
          Voltar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

function goBack() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role_id === 1) router.push("/admin-panel");
  else if (user.role_id === 2 || user.role_id === 3) router.push("/map");
  else router.push("/login");
}
</script>