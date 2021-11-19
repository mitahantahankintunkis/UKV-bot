<script setup>
import { toRefs } from "@vue/reactivity";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps({
    message: String,
    owner: String,
});

const { message, owner } = toRefs(props);

// Safely parses markdown into HTML
function parseMessage() {
    const html = marked(message.value);
    return DOMPurify.sanitize(html);
}
</script>


<template>
<div class="message" :class="`${owner}-msg`">
    <div v-html="parseMessage()"></div>
</div>
</template>


<style scoped>
.message {
    max-width: 70%;
    margin: 0.5rem;
    padding: 0.5rem 1rem;
    color: #003a49;

    background-color: #ddd;
    border-radius: 1rem 1rem 1rem 1rem;
    text-align: center;
    align-self: center;
}

.user-msg {
    background-color: #eeeeee;
    border-radius: 1rem 1rem 0 1rem;
    text-align: end;
    align-self: end;
}

.bot-msg {
    background-color: #8cc6d4;
    background-color: #b6d7df;
    border-radius: 1rem 1rem 1rem 0;
    width: max-content;
    text-align: start;
    align-self: flex-start;
}

.message:deep(img) {
    width: 90%;
    height: auto;
    margin: 1rem auto;
    display: block;
    text-align: center;
}

.message:deep(ul) {
    list-style-position: inside;
}

</style>