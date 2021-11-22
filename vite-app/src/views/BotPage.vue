<script setup>
import BotHeader from '../components/BotHeader.vue';
import BotFloatingButton from '../components/BotFloatingButton.vue';
import ChatbotContent from '../components/ChatbotContent.vue';
import ContactPrompt from '../components/ContactPrompt.vue';
import { ref } from '@vue/reactivity';
import { inject, nextTick, onBeforeMount, onMounted } from '@vue/runtime-core';
import { useRoute } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';


// Used to hide the chat window
const chatOpen = ref(false);
const dataLoaded = ref(false);
const project = ref({});
const promptOpen = ref(false);

const db = inject('db');
const route = useRoute();
const projectName = route.params.project;

const contactCallback = ref(null);


function contactSubmit(data) {
    if (contactCallback.value) contactCallback.value(data);
    promptOpen.value = false;
}

function askContacts(callback) {
    contactCallback.value = callback;
    promptOpen.value = true;
}

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

// Opens the chat
nextTick(() => {
    chatOpen.value = true;
});
</script>


<template>
    <BotHeader></BotHeader>
    <main>
        <div v-if="!dataLoaded">Ladataan...</div>

        <router-view v-else :project="project" :key="project.timestamp"></router-view>

        <BotFloatingButton @click="toggleChat"></BotFloatingButton>

        <transition name="slide-in">
            <div v-if="chatOpen" class="chatbot-window">
                <ChatbotContent @close="toggleChat" @askContacts="askContacts" :project="project" :key="dataLoaded" :editmode="false"></ChatbotContent>
            </div>
        </transition>
    </main>

    <ContactPrompt v-if="promptOpen" @submit="contactSubmit"></ContactPrompt>
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
    max-height: 50rem;
    border-radius: 0.5rem 0.5rem 0 0;
    animation: slide-in 200ms ease forwards 0s;
    box-shadow: #c3c3c3 0px 0px 8px;
}


.slide-in-enter-active, .slide-in-leave-active {
    transition: bottom 200ms ease;
}

.slide-in-enter-from, .slide-in-leave-to {
    bottom: -100vh;
}


/*
@keyframes slide-in {
    from { top: 100vh; }
    to { top: 1rem; }
}
*/
</style>
