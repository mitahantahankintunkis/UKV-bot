<script setup>
import BotContent from '../components/BotContent.vue';
import BotHeader from '../components/BotHeader.vue';
//import BotFloatingButton from '../components/BotFloatingButton.vue';
//import ChatWindow from '../components/ChatWindow.vue';
import { ref } from '@vue/reactivity';
import { inject, onBeforeMount, onMounted } from '@vue/runtime-core';
import { useRoute } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';


// Used to hide the chat window
const chatOpen = ref(false);
const dataLoaded = ref(false);
const markdown = ref('');
const botNodes = ref([]);
const botEdges = ref([]);

const db = inject('db');
const route = useRoute();
const projectName = route.params.project;

async function getData() {
    if (!db) return;

    const docRef = doc(db, 'projects', projectName);
    const docSnap = await getDoc(docRef);

    dataLoaded.value = true;

    if (docSnap.exists()) {
        const data = docSnap.data();

        markdown.value = data['page-markdown'] || '';
        botNodes.value = data['bot-nodes'] || [];
        botEdges.value = data['bot-edges'] || [];
    } else {
        markdown.value = '# 404\nVirheellinen hankkeen nimi';
    }
}
getData();

function toggleChat() {
    chatOpen.value = !chatOpen.value;
}
</script>


<template>
    <BotHeader></BotHeader>
    <main>
        <div v-if="!dataLoaded">Ladataan...</div>
        <BotContent v-else :markdown="markdown"></BotContent>

        <!--
        <ChatWindow @close="toggleChat" v-if="chatOpen"></ChatWindow>
        <BotFloatingButton @click="toggleChat" v-else></BotFloatingButton>
        -->
    </main>
</template>


<style scoped>
main {
    width: 50vw;
    margin: 15rem auto 0 auto;
}
</style>
