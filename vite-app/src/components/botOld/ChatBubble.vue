<script setup>
import { toRefs } from "@vue/reactivity";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps({
    message: String,
    own: Boolean,
});

const { message, own } = toRefs(props);

// Safely parses markdown into HTML
function parseMessage() {
    const html = marked(message.value);
    return DOMPurify.sanitize(html);
}
</script>


<template>
<div class="message" :class="{ 'own-msg': own, 'bot-msg': !own }">
    <div v-html="parseMessage()"></div>
</div>
</template>


<style scoped>
.message {
    max-width: 70%;
    margin: 0.5rem;
    padding: 0 1rem;
    color: #003a49;
}

.own-msg {
    background-color: #eeeeee;
    border-radius: 1rem 1rem 0 1rem;
    max-width: 70%;
    text-align: end;
    align-self: flex-end;
}

.bot-msg {
    background-color: #8cc6d4;
    background-color: #b6d7df;
    border-radius: 1rem 1rem 1rem 0;
    max-width: 70%;
    width: max-content;
}

</style>