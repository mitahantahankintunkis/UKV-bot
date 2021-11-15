<script setup>
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ref } from '@vue/reactivity';


const props = defineProps(['markdown']);
const cleanedHtml = ref('');

function parseMarkdown(markdown) {
    const html = marked(markdown || '');
    cleanedHtml.value = DOMPurify.sanitize(html);
}

parseMarkdown(props.markdown || '');
</script>


<template>
    <div v-html="cleanedHtml"></div>
</template>


<style scoped>

div {
    width: 100%;
    height: 100%;
}

div:deep(img) {
    width: 70%;
    height: auto;
}
</style>
