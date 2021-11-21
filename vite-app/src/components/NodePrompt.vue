<script setup>
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ref } from '@vue/reactivity';


const props = defineProps([ 'node' ]);
const emit = defineEmits([ 'submit' ]);

const markdown = ref(props.node.label || '');
const type = ref(props.node.class || 'bot');

function cancel() {
    emit('submit', null);
}

function submit() {
    emit('submit', {
        label: markdown.value,
        class: type.value,
    });
}

</script>


<template>
    <div class="background">
        <div class="dialog">
            <div>
                <h3>Viestin asetukset</h3>
            </div>

            <div class="settings-row">
                <div class="settings-left">
                    <label for="node-type">Tyyppi</label>
                </div>
                <div class="settings-right">
                    <select name="node-type" id="node-type" v-model="type">
                        <option value="bot">Botin viesti</option>
                        <option value="user">Käyttäjän viesti</option>
                    </select>
                </div>
            </div>

            <div class="settings-row">
                <div class="settings-left">
                    <label for="markdown">Sisältö</label>
                    <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" target="_blank" rel="noopener noreferrer">
                        Syntaksin ohjeet
                    </a>
                </div>
                <div class="settings-right">
                    <textarea name="markdown"
                        autocomplete="off"
                        autocorrect="off"
                        spellcheck="false"
                        placeholder="*Kommentin teksti (markdown)...*"
                        v-model="markdown">
                    </textarea>
                </div>
            </div>

            <div class="buttons">
                <button class="btn-cancel" @click="cancel">Peruuta</button>
                <button class="btn-submit" @click="submit">Tallenna</button>
            </div>
        </div>
    </div>
</template>


<style scoped>
.background {
    position: fixed;
    background-color: #00000066;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
}

.dialog {
    background-color: white;
    width: 50%;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    padding: 2rem;
    border-radius: 0.5rem;
    gap: 2rem;
}

.dialog > * {
    display: flex;
    width: 100%;
}

.settings-left {
    width: 20%;
}

.settings-right {
    width: 80%;
}

.settings-left > *, .settings-right > * {
    width: 100%;
    display: flex;
    flex-direction: column;
}

select {
    height: 2rem;
    background-color: white;
    border: none;
    border-bottom: 1px solid #aaa;
    cursor: pointer;
}

a {
    font-size: 0.8rem;
}

h3 {
    text-align: center;
    width: 100%;
    margin-bottom: 1rem;
}

textarea {
    resize: none;
    overflow-y: auto;
    height: 10rem;
}

.buttons {
    gap: 0.2rem;
    justify-content: end;
}

.btn-cancel {
    background-color: #eee;
    color: #444;
}
</style>