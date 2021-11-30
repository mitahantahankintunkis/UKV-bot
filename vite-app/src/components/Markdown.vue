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
div {
    margin-bottom: 5rem;
}

div:deep(img) {
    margin: 1rem;
    text-align: center;
    vertical-align: middle;
    max-width: 70vw;
}

div:deep(ul) {
    list-style-position: inside;
}

div:deep(h1),
div:deep(h2),
div:deep(h3),
div:deep(h4),
div:deep(h5) {
    font-weight: 600;
    color: #333;
}

div:deep(h1),
div:deep(h2),
div:deep(h3),
div:deep(h4),
div:deep(h5) {
    margin: 1em 0;
}

div:deep(p) {
    margin: 1rem 0;
}
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