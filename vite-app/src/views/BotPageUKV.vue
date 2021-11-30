<script setup>
import Markdown from '../components/Markdown.vue';
import { plainText as markdown } from '../assets/ukv.md';

const { project } = defineProps([ 'project' ]);

</script>


<template>
<Markdown :markdown="markdown"></Markdown>

<div class="logos">
    <img src="../assets/eu.png" alt="Rahoittaja">
    <img src="../assets/uia.png" alt="UIA">
    <img src="../assets/ukv-small.png" alt="UKV">
    <img src="../assets/metropolia.jpg" alt="Metropolia">
</div>
</template>


<style scoped>
.logos {
    display: grid;
    grid-template-columns: repeat(auto-fill, 150px);
    width: 100%;
    justify-content: space-around;
}
</style>