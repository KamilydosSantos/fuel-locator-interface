<template>
  <div class="relative p-6 max-w-2xl mx-auto">
    <button
      @click="router.push({ name: 'map' })"
      class="absolute top-4 left-4 p-2 border border-gray-100 rounded-full bg-white shadow-md hover:bg-gray-100 transition z-50"
    >
      <ArrowLeft class="w-6 h-6 text-gray-700" />
    </button>

    <h1 class="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
      Solicitar para se tornar colaborador
    </h1>

    <div v-if="hasPendingRequest" class="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500 border border-gray-100">
        Você já possui uma solicitação recente pendente. Aguarde a aprovação.
    </div>

    <div v-else class="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <p class="text-gray-600 mb-6">
        Preencha seus dados para que o administrador possa aprovar sua solicitação.
      </p>

      <InputField
        placeholder="(11) 99999-9999"
        type="text"
        v-model="form.phone"
        :icon="PhoneIcon"
        required
        class="mb-4"
        @input="maskPhone"
      />

      <InputField
        placeholder="000.000.000-00"
        type="text"
        v-model="form.cpf"
        :icon="IdentifierIcon"
        required
        class="mb-4"
        @input="maskCPF"
      />

      <button
        @click="submitRequest"
        :disabled="loading"
        class="w-full h-11 py-3 text-white font-semibold rounded-2xl bg-primary hover:bg-primary-hover transition"
      >
        {{ loading ? 'Enviando...' : 'Enviar' }}
      </button>

      <p v-if="success" class="text-green-600 mt-4 text-center">
        Solicitação enviada com sucesso!
      </p>

      <p v-if="error" class="text-red-600 mt-4 text-center">
        Ocorreu um erro ao enviar a solicitação.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/services/api.js";
import { ArrowLeft } from "lucide-vue-next";
import InputField from '@/components/InputField.vue'
import IdentifierIcon from "@/components/icons/IdentifierIcon.vue"
import PhoneIcon from "@/components/icons/PhoneIcon.vue"

const router = useRouter();

const form = ref({ phone: "", cpf: "" });
const loading = ref(false);
const success = ref(false);
const error = ref(false);
const hasPendingRequest = ref(false);

const checkPendingRequest = async () => {
  try {
    const response = await api.get("/role-requests/check");
    hasPendingRequest.value = response.data.hasPending;
  } catch (err) {
    console.error("Erro ao verificar solicitações pendentes", err);
  }
};

onMounted(() => {
  checkPendingRequest();
});

const maskPhone = (e) => {
  let val = e.target.value.replace(/\D/g, "");
  if (val.length > 11) val = val.slice(0, 11);

  if (val.length > 6) val = `(${val.slice(0, 2)})${val.slice(2, 7)}-${val.slice(7)}`;
  else if (val.length > 2) val = `(${val.slice(0, 2)})${val.slice(2)}`;
  else if (val.length > 0) val = `(${val}`;

  form.value.phone = val;
};

const maskCPF = (e) => {
  let val = e.target.value.replace(/\D/g, "");
  if (val.length > 11) val = val.slice(0, 11);

  if (val.length > 9) val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6, 9)}-${val.slice(9)}`;
  else if (val.length > 6) val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6)}`;
  else if (val.length > 3) val = `${val.slice(0, 3)}.${val.slice(3)}`;

  form.value.cpf = val;
};

const submitRequest = async () => {
  loading.value = true;
  success.value = false;
  error.value = false;

  try {
    await api.post("/role-requests/submit", { phone: form.value.phone, cpf: form.value.cpf });
    success.value = true;
    router.push({ name: "map", query: { success: "request_sent" }});
  } catch (e) {
    console.error(e);
    error.value = true;
  } finally {
    loading.value = false;
  }
};
</script>
