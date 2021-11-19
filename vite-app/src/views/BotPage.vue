<script setup>
import BotContent from '../components/BotContent.vue';
import BotHeader from '../components/BotHeader.vue';
import BotFloatingButton from '../components/BotFloatingButton.vue';
import ChatbotContent from '../components/ChatbotContent.vue';
import { ref } from '@vue/reactivity';
import { inject, onBeforeMount, onMounted } from '@vue/runtime-core';
import { useRoute } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';


// Used to hide the chat window
const chatOpen = ref(false);
const dataLoaded = ref(false);
const project = ref({});

const db = inject('db');
const route = useRoute();
const projectName = route.params.project;


// Gets project settings from firestore
async function getData() {
    if (!db) return;

    dataLoaded.value = false;

    const projectName = route.params.project;
    const docRef = doc(db, 'projects', projectName);
    await getDoc(docRef)
        .then((docSnap) => {
            dataLoaded.value = true;

            if (docSnap.exists()) {
                project.value = docSnap.data() || {};
            } else {
                project.value = {
                    nodes: [],
                    edges: [],
                    page: '### Virhe sivuston sisältöä haettaessa.\nKoita päivittää sivusto uudestaan.',
                };
            }

        })
        .catch((e) => {
            console.error(e);
            project.value = {
                nodes: [],
                edges: [],
                page: '### Virhe sivuston sisältöä haettaessa.\nKoita päivittää sivusto uudestaan.',
            };
        });
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
        <BotContent v-else :markdown="project.page"></BotContent>

        <div v-if="chatOpen" class="chatbot-window">
            <ChatbotContent @close="toggleChat" :project="project" :editmode="false"></ChatbotContent>
        </div>
        <BotFloatingButton v-else @click="toggleChat"></BotFloatingButton>
    </main>
</template>


<style scoped>
main {
    width: 50vw;
    margin: 15rem auto 0 auto;
}

.chatbot-window {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    height: calc(100vh - 2rem);
    border-radius: 1rem;
    box-shadow: #c3c3c3 0px 0px 8px;
}
</style>
