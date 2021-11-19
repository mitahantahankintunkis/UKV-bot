<script setup>
import BotContent from '../components/BotContent.vue';
import DOMPurify from 'dompurify';
import Markdown from '../components/Markdown.vue';
import { marked } from 'marked';
import { ref } from '@vue/reactivity';


const markdown = ref(
`# Esimerkki markdownin syntaksista
## Alaotsikko
### Alempi otsikko
- Lista
- Linkki [nimi](example.com)
- Kuva ![kuvaus jos ei lataudu](https://i.imgur.com/4vNedV6.jpeg)`);

function textChanged(e) {
    markdown.value = e.target.value;
}
</script>


<template>
    <div class="content">
        <div class="left">
            <div>Tekstin sisältö</div>
            <textarea @input="textChanged" autocomplete="off" autocorrect="off" spellcheck="false" v-model="markdown"></textarea>
        </div>
        <div class="right">
            <div>Sivuston näkymä</div>
            <div class="rendered">
                <BotContent :key="markdown" :markdown="markdown"></BotContent>
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
    resize: none;
}

.rendered {
    height: 100%;
    overflow-y: auto;
}
</style>
