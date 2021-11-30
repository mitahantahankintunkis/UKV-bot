<script setup>
</script>


<template>
    <div class="bubble pulse">
        !
    </div>
</template>


<style scoped>
.bubble {
    --notification-size: 1.5rem;
    text-align: center;
    height: var(--notification-size);
    width: var(--notification-size);
    line-height: var(--notification-size);
    border-radius: var(--notification-size);
    background-color: rgb(224, 22, 62);
    color: white;

}
.pulse {
  animation: pulse-animation ease-out 2s 5s 3;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0px rgba(224, 22, 62, 1);
  }
  50% {
    box-shadow: 0 0 0 0.5rem rgba(224, 22, 62, 0.0);
  }
  100% {
    box-shadow: 0 0 0 0.5rem rgba(224, 22, 62, 0.0);
  }
}
</style>