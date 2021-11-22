<script setup>
import Markdown from '../components/Markdown.vue';


const emit = defineEmits([ 'download', 'upload', 'load', 'save', 'info' ]);
const props = defineProps([ 'project' ]);

function textChanged(e) {
    emit('info', 0, 'Tallentamattomia muutoksia');
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
            <button @click="emit('download')">Lataa</button>
            <button @click="emit('upload')">Tallenna</button>
        </div>
    </div>

    <div class="editor">
        <div class="left">
            <textarea @input="textChanged" autocomplete="off" autocorrect="off" spellcheck="false" v-model="props.project.page"></textarea>
        </div>
        <div class="right">
            <div class="rendered">
                <Markdown :key="props.project.page" :markdown="props.project.page"></Markdown>
            </div>
        </div>
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

.controls {
    display: flex;
    align-content: center;
    width: fit-content;
    margin: 0 auto;
    gap: 0.5rem;
}

button {
    width: 10rem;
}
</style>
