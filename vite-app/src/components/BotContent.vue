<script setup>
import { marked } from 'marked';
import DOMPurify from 'dompurify';


// Parses and cleans the passed markdown
const props = defineProps([ 'markdown' ]);
const html = marked(props.markdown || '');
const cleanedHtml = DOMPurify.sanitize(html);

</script>


<template>
    <div v-html="cleanedHtml"></div>
</template>


<style scoped>
/*
#app {
    font-family: 'Poppins', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

div:deep(h1) {
    font-weight: 600;
    color: #333333;
}
*/
</style>



<!--
Some file based stuff

//async function getCleanedHtml() {
    //console.log('Loading markdown...');

    //const markdownRef = firebaseRef(storage, 'muuvo/test.md');

    //const url = await getDownloadURL(markdownRef).catch((e) => {
    //    console.error('Failed to load content', e);
    //    const html = marked('Failed to load content. Please try again later');
    //    cleanedHtml.value = DOMPurify.sanitize(html);
    //});

    //// Sets caching for md files
    ////const metadata = await getMetadata(markdownRef);
    ////const newMetadata = await updateMetadata(markdownRef, {
    ////    ...metadata,
    ////    cacheControl: 'public,max-age=7200',
    ////    contentType: 'text/markdown',
    ////});

    //if (url) {
    //    const xhr = new XMLHttpRequest();
    //    xhr.responseType = 'blob';

    //    xhr.onload = async (event) => {
    //        const blob = xhr.response;
    //        if (blob.type !== 'text/markdown') return;

    //        const markdown = await blob.text();
    //        const html = marked(markdown);
    //        cleanedHtml.value = DOMPurify.sanitize(html);
    //    };

    //    xhr.open('GET', url);
    //    xhr.send();
    //}
//}
//getCleanedHtml();
-->