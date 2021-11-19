<script setup>
import BotContent from '../components/BotContent.vue';
import DOMPurify from 'dompurify';
import Markdown from '../components/Markdown.vue';
import { marked } from 'marked';
import { ref } from '@vue/reactivity';
import InfoBar from '../components/InfoBar.vue';
import { useRoute } from 'vue-router';
import { inject, onUnmounted } from '@vue/runtime-core';
import { doc, serverTimestamp, updateDoc } from '@firebase/firestore';


const emit = defineEmits([ 'refreshData' ]);
const props = defineProps([ 'project' ]);
const route = useRoute();
const db = inject('db');

const info = ref([ '', 'Ei muutoksia', '' ]);
const markdown = ref(props.project.page || '# TODO');
const saveIntervalID = ref(-1);

//`# Esimerkki markdownin syntaksista
//## Alaotsikko
//### Alempi otsikko
//- Lista
//- Linkki [nimi](example.com)
//- Kuva ![kuvaus jos ei lataudu](https://i.imgur.com/4vNedV6.jpeg)`);

function textChanged(e) {
    markdown.value = e.target.value;
    info.value[1] = 'Tallentamattomia muutoksia';
}

function save() {
    localStorage.setItem(`${route.params.project}-page`, markdown.value);
    info.value[1] = 'Tallennettu tietokoneen muistiin';
}

function load() {
    const page = localStorage.getItem(`${route.params.project}-page`);
    if (page) {
        markdown.value = page;
        info.value[1] = 'Kopio ladattu tietokoneen muistista';
    }
}

load();

onUnmounted(() => {
    clearInterval(saveIntervalID.value);
});

clearInterval(saveIntervalID.value);
saveIntervalID.value = setInterval(save, 1000 * 10);

function download() {
    localStorage.removeItem(`${route.params.project}-page`);
    emit('refreshData');
}

async function upload() {
    if (props.project && props.project.readonly) {
        info.value[2] = 'Ei onnistu. Projekti on lukutilassa';
        return;
    }

    const projectId = route.params.project;
    const docRef = doc(db, 'projects', projectId);

    info.value[1] = 'Lähetetään...';

    await updateDoc(docRef, {
        page: markdown.value,
        timestamp: serverTimestamp(),

    }).then(() => {
        save();
        info.value[1] = 'Sivusto päivitetty';

    }).catch((e) => {
        console.error(e);
        info.value[2] = 'Virhe lähetettäessä pilveen';
    });
}

</script>


<template>
    <div class="top">
        <h2>Välisivuston editori</h2>
        <p>
            Alla olevalla tekstieditorilla voit muokata botin taustalla näkyvää tekstiä.
            Teksti seuraa Markdown nimistä syntaksia, mistä löydät nopeat ohjeet
            <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" target="_blank" rel="noopener noreferrer">
                täältä.
            </a>
            Voit kirjoittaa Markdownia editorin vasemmalle puolelle ja oikealla puolellä näet miltä se tulee näyttämään sivustolla.
        </p>

        <div class="controls">
            <button @click="download">Lataa</button>
            <button @click="upload">Tallenna</button>
        </div>
    </div>

    <div class="editor">
        <div class="left">
            <textarea @input="textChanged" autocomplete="off" autocorrect="off" spellcheck="false" v-model="markdown"></textarea>
        </div>
        <div class="right">
            <div class="rendered">
                <BotContent :key="markdown" :markdown="markdown"></BotContent>
            </div>
        </div>
    </div>

    <div class="infobar">
        <InfoBar :info="info"></InfoBar>
    </div>
</template>


<style scoped>
.editor {
    display: flex;
    width: 100%;
    min-height: 50rem;
}

.editor > div {
    display: flex;
    flex-direction: column;
    width: 100%;
}

textarea {
    flex-grow: 1;
    resize: none;
}

.rendered {
    height: 100%;
}

.right {
    padding: 1rem;
    border-left: 1px solid gray;
}

.top {
    margin: 5rem auto;
    width: 70%;
    align-content: center;
    text-align: center;
}

.infobar {
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
}
</style>
