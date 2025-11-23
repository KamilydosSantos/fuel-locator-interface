import { ref } from 'vue'

export function useCountdown(initial = 45) {
  const countdown = ref(0)
  let timer = null

  function start() {
    countdown.value = initial
    clearInterval(timer)
    timer = setInterval(() => {
      if (countdown.value > 0) countdown.value--
      else clearInterval(timer)
    }, 1000)
  }

  function clear() {
    clearInterval(timer)
  }

  return { countdown, start, clear }
}
