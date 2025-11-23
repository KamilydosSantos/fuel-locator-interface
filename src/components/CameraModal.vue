<template>
  <div class="fixed inset-0 bg-black flex flex-col z-50">
    <div class="h-20 flex items-center justify-end px-4 bg-black">
      <button @click="exit" class="text-white text-3xl font-light">✕</button>
    </div>

    <div class="flex-1 relative bg-black overflow-hidden">
      <video
        v-show="!photo"
        ref="video"
        autoplay
        playsinline
        class="w-full h-full object-cover"
      ></video>

      <img
        v-if="photo"
        :src="photo"
        class="w-full h-full object-cover"
      />

      <canvas ref="canvas" class="hidden"></canvas>
    </div>

    <div class="h-32 flex items-center justify-center bg-black">
      <button
        v-if="!photo"
        @click="capture"
        class="relative flex items-center justify-center"
      >
        <div class="w-24 h-24 rounded-full bg-white flex items-center justify-center">
          <div class="w-20 h-20 rounded-full bg-black flex items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-white"></div>
          </div>
        </div>
      </button>

      <div v-else class="flex gap-20">

        <button
          @click="retake"
          class="text-white"
          title="Refazer"
        >
          <RemakeIcon class="w-14 h-14" />
        </button>

        <button
          @click="confirm"
          class="text-white"
          title="Avançar"
        >
          <ConfirmIcon class="w-14 h-14" />
        </button>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import RemakeIcon from "@/components/icons/RemakeIcon.vue";
import ConfirmIcon from "@/components/icons/ConfirmIcon.vue";

const emit = defineEmits(["close", "photo-taken"]);

const video = ref(null);
const canvas = ref(null);
const stream = ref(null);
const photo = ref(null);

onMounted(async () => {
  openCamera();
});

onUnmounted(() => {
  stopCamera();
});

async function openCamera() {
  try {
    let constraints = { video: true };

    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      constraints = { video: { facingMode: { ideal: "environment" } } };
    }

    stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    video.value.srcObject = stream.value;
  } catch (err) {
    alert("Não foi possível acessar a câmera.");
    emit("close");
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop());
  }
}

const capture = () => {
  const w = video.value.videoWidth;
  const h = video.value.videoHeight;

  canvas.value.width = w;
  canvas.value.height = h;

  const ctx = canvas.value.getContext("2d");
  ctx.drawImage(video.value, 0, 0, w, h);

  photo.value = canvas.value.toDataURL("image/jpeg");
};

const retake = () => {
  photo.value = null;
};

const confirm = () => {
  emit("photo-taken", photo.value);
  emit("close");
};

const exit = () => {
  emit("close");
};
</script>
