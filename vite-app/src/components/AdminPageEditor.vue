<script setup>
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ref } from '@vue/reactivity';


const markdownStart = 
`# Esimerkki markdownin syntaksista
## Alaotsikko
### Alempi otsikko
- Lista
- Linkki [nimi](example.com)
- Kuva ![kuvaus jos ei lataudu](https://i.imgur.com/4vNedV6.jpeg)`;

const cleanedHtml = ref('');

function parseMarkdown(markdown) {
    const html = marked(markdown || '');
    cleanedHtml.value = DOMPurify.sanitize(html);
    console.log(cleanedHtml.value);
}

function textChanged(e) {
    parseMarkdown(e.target.value);
}

parseMarkdown(markdownStart);
</script>


<template>
    <div class="content">
        <div class="left">
            <div>Tekstin sisältö</div>
            <textarea @input="textChanged" autocomplete="off" autocorrect="off" spellcheck="false" v-model="markdownStart"></textarea>
        </div>
        <div class="right">
            <div>Sivuston näkymä</div>
            <div class="rendered" v-html="cleanedHtml">
            </div>
        </div>
    </div>
</template>


<style scoped>
.content {
    display: flex;
    width: 100%;
    height: 80vh;
}

.content > div {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

textarea {
    height: 100%;
    overflow: auto;
}

.rendered {
    height: 100%;
    overflow-y: auto;
}

.rendered:deep(img) {
    width: 70%;
    height: auto;
}
</style>
