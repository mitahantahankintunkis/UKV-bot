<script setup>
import Markdown from '../components/Markdown.vue';
import { plainText as markdown } from '../assets/ukv.md';

const { project } = defineProps([ 'project' ]);

</script>


<template>
<Markdown :markdown="markdown"></Markdown>
</template>


<style scoped>
</style>