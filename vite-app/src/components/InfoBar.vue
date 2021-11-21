<script setup>
const props = defineProps([ 'info' ]);
</script>


<template>
    <div class="infobar">
        <div class="info fade-out" v-for="data in props.info" :key="data">
            {{ data }}
        </div>
    </div>
</template>


<style scoped>
.infobar {
    height: 2rem;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 2rem;
    background-color: white;
    border-top: 1px solid #aaa;
}

.info {
    line-height: 2rem;
    animation: fade-out 3s ease forwards 2s;
}

@keyframes fade-out {
    from { color: black; }
    to { color: #999; }
}
</style>