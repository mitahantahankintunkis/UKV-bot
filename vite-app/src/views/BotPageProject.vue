<script setup>
import Markdown from '../components/Markdown.vue';

const { project } = defineProps([ 'project' ]);
const markdown = project.page;

</script>


<template>
<Markdown :markdown="markdown"></Markdown>
</template>


<style scoped>
</style>