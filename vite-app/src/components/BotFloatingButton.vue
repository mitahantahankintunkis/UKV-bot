<script setup>
const emit = defineEmits(['click']);
</script>


<template>
<div @click="emit('click')" class="circle-button">
    <font-awesome-icon color="white" icon="comment-alt" />
</div>
</template>


<style scoped>
.circle-button > svg {
    width: 2.8rem;
    height: 2.8rem;
    padding: 1.1rem;
}

.circle-button {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    width: 5rem;
    height: 5rem;
    border-radius: 2.5rem;
    background-color: #16a8cd;
    cursor: pointer;
    transition: background-color 50ms;
}

.circle-button:hover {
    background-color: #77d5ec;
}
</style>