<script setup>
import BotHeader from '../components/BotHeader.vue';
import BotFloatingButton from '../components/BotFloatingButton.vue';
import ChatbotContent from '../components/ChatbotContent.vue';
import NotificationBubble from '../components/NotificationBubble.vue';
import { ref } from '@vue/reactivity';
import { inject, nextTick, onBeforeMount, onMounted } from '@vue/runtime-core';
import { useRoute } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import BotSidebar from '../components/BotSidebar.vue';


// Used to hide the chat window
const chatOpen = ref(false);
const dataLoaded = ref(false);
const project = ref({});
const promptOpen = ref(false);
const notificationVisible = ref(true);
const sidebarVisible = ref(false);

const db = inject('db');
const route = useRoute();
const projectName = route.params.project || 'dallatten';

const contactCallback = ref(null);


function contactSubmit(data) {
    if (contactCallback.value) contactCallback.value(data);
    promptOpen.value = false;
}

function askContacts(callback) {
    contactCallback.value = callback;
    promptOpen.value = true;
}

function hideNotification() {
    notificationVisible.value = false;
}

// Gets project settings from firestore
async function getData() {
    if (!db) return;

    dataLoaded.value = false;

    const docRef = doc(db, 'projects', projectName);
    const docSnap = await getDoc(docRef)
        .catch((e) => {
            console.error(e);
            project.value = {
                nodes: [],
                edges: [],
                page: '### Virhe sivuston sisältöä haettaessa.\nKoita päivittää sivusto uudestaan.',
            };
        });

    dataLoaded.value = true;

    if (docSnap && docSnap.exists() && docSnap.data()) {
        project.value = docSnap.data();

    } else {
        project.value = {
            nodes: [],
            edges: [],
            page: '### Virhe sivuston sisältöä haettaessa.\nKoita päivittää sivusto uudestaan.',
        };
    }
}
getData();

function toggleChat() {
    chatOpen.value = !chatOpen.value;
}

function toggleSidebar() {
    sidebarVisible.value = !sidebarVisible.value;
}

// Opens the chat
nextTick(() => {
    setTimeout(() => {
        chatOpen.value = true;
    }, 2000);
});
</script>


<template>
    <main>
        <BotHeader @toggle-sidebar="toggleSidebar"></BotHeader>

        <div class="banner-wrapper">
            <img class="banner" src="/assets/banner.png" alt="Banneri">
        </div>

        <div class="text-content">
            <div v-if="!dataLoaded">Ladataan...</div>
            <router-view v-else :project="project" :key="project.timestamp"></router-view>
        </div>

        <div class="floating">
            <BotFloatingButton @click="toggleChat"></BotFloatingButton>

            <div v-if="notificationVisible" class="notification notification-floating">
                <NotificationBubble></NotificationBubble>
            </div>
        </div>

        <transition name="slide-in">
            <div v-if="chatOpen" @click="hideNotification" class="chatbot-window">
                <ChatbotContent @close="toggleChat" @askContacts="askContacts" :project="project" :key="dataLoaded" :editmode="false"></ChatbotContent>

                <div v-if="notificationVisible" class="notification notification-chat">
                    <NotificationBubble></NotificationBubble>
                </div>
            </div>
        </transition>

        <BotSidebar v-if="sidebarVisible" @toggle-sidebar="toggleSidebar"></BotSidebar>
    </main>

    <!--
    <ContactPrompt v-if="promptOpen" @submit="contactSubmit"></ContactPrompt>
    -->
</template>


<style scoped>
main {
    width: min(100vw, 50rem);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

.banner-wrapper {
    direction: rtl;
    overflow: hidden;
}

.banner {
    width: fit-content;
    min-width: 100%;
    height: auto;
}

.text-content {
    padding: 0 2rem 2rem 2rem;
}

.chatbot-window {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    height: calc(100vh - 2rem);
    max-height: 50rem;
    border-radius: 0.5rem 0.5rem 0 0;
    animation: slide-in 200ms ease forwards 0s;
    box-shadow: #00000044 0px 0px 8px;
}

.notification-chat {
    position: absolute;
    top: 0.2rem;
    left: 2rem;
}

.notification-floating {
    position: absolute;
    right: 1rem;
    bottom: 4.6rem;
}

.slide-in-enter-active, .slide-in-leave-active {
    transition: bottom 200ms ease;
}

.slide-in-enter-from, .slide-in-leave-to {
    bottom: -100vh;
}
</style>
