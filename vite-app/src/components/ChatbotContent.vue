<script setup>
import ChatBubble from './ChatBubble.vue';
import { ref } from '@vue/reactivity';
import { inject, nextTick } from '@vue/runtime-core';
import { useRoute } from 'vue-router';
import { nanoid } from 'nanoid';
import { addDoc, arrayUnion, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from '@firebase/firestore';


const route = useRoute();
const { project, editmode } = defineProps([ 'project', 'editmode' ]);
const emit = defineEmits([ 'close', 'askContacts' ]);
const db = inject('db');
//const conversationId = ref(nanoid());
const projectName = route.params.project;
let docRef = ref(null);

let nodes = project.nodes || [];
let edges = project.edges || [];

const startNode = {
    id: 'asdf',
    label: 'Voit kokeilla miten vasemmalla näkyvät keskustelupolut toimivat täällä',
    class: 'unknown'
};


async function uploadResponse(node) {
    if (!db || !node) return;

    // Creates the conversation
    if (!docRef.value) {
        docRef.value = doc(db, 'projects', projectName, 'conversations', nanoid());

        await setDoc(docRef.value, {
            responses: [ node ],
            timestamp: serverTimestamp(),

        }).catch((e) => {
            console.error(e);
        });

        return;
    }

    // Updates the conversation
    await updateDoc(docRef.value, {
        responses: arrayUnion(node),

    }).catch((e) => {
        console.error(e);
    });
}

// Finds conversation start
function getRoot() {
    const notRoot = new Set();
    for (let edge of edges) notRoot.add(edge.to);

    for (let node of nodes) {
        if (notRoot.has(node.id)) continue;
        return node;
    }
}

// Adds the starting node to the tree
let root = getRoot();
nodes = [ startNode ].concat(nodes);

if (editmode && root) {
    const edge = { from: startNode.id, to: root.id };
    edges = [ edge ].concat(edges);
    root = startNode;
}

const curNode = ref(null);
const history = ref([]);
const replies = ref([]);
const canReply = ref(false);


function updateReplies() {
    if (!curNode.value) return;

    replies.value = [];

    for (let edge of edges) {
        if (edge.from !== curNode.value.id) continue;

        const node = nodes.find((n) => n.id === edge.to && (n.class === 'user' || n.class === 'contacts'));
        if (node) replies.value.push(node);
    }

    // Sorts replies
    replies.value.sort((a, b) => {
        if (a.pos.y === b.pos.y) return a.pos.x > b.pos.x;
        return a.pos.y > b.pos.y;
    })
}

function autoScroll() {
    nextTick(() => {
        const messages = document.querySelectorAll('.message');
        if (messages.length === 0) return;

        messages[messages.length - 1].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
}

async function reply(node) {
    if (!node) return;
    if ((node.class === 'user' || node.class === 'contacts') && !canReply.value) return;

    const parent = curNode.value;
    canReply.value = false;
    curNode.value = node;
    history.value.push(node);
    autoScroll();

    // Stores the reply to the database
    if (node.class === 'user') {
        uploadResponse({
            id: node.id,
            label: node.label,
            parent: parent ? parent.id : ':root:',
        });
    }

    // Contact info
    if (node.class === 'contacts') {
        await new Promise((r) => setTimeout(r, 1000));
        await new Promise((resolve, reject) => {
            emit('askContacts', (contactsEncrypted) => {
                uploadResponse({
                    id: node.id,
                    label: contactsEncrypted,
                    parent: parent.id,
                });
                resolve();
            });
        });
    }

    // Chooses the next node
    let nextNode;

    for (let edge of edges) {
        if (edge.from !== node.id) continue;

        nextNode = nodes.find((n) => n.id === edge.to);

        // The bot always chooses to reply to itself if it can,
        // even if it skips some user replies
        if (nextNode.class === 'bot') break;
    }

    if (nextNode && nextNode.class === 'bot') {
        setTimeout(() => {
            reply(nextNode);
        }, 400);
    } else {
        updateReplies();
        canReply.value = true;
    }
}

function reset() {
    docRef.value = null;
    curNode.value = null;
    reply(root);
    autoScroll();
}

reset();
</script>


<template>
<div class="chat-window">
    <div class="chat-header" :style="{ 'border-radius': editmode ? '0' : `0.5rem 0.5rem 0 0` }">
        <div class="chat-header-left">
            <font-awesome-icon color="#eeeeee" icon="user-circle" />
            <p class="chat-title">{{ projectName.toUpperCase() }}botti</p>
        </div>
        <div class="chat-header-right">
            <font-awesome-icon @click="reset" color="#eeeeee" icon="redo" />
            <font-awesome-icon @click="emit('close')" color="#eeeeee" icon="times" />
        </div>
    </div>

    <div class="chat-content">
        <div class="history">
            <div class="history-bubbles">
                <ChatBubble v-for="msg in history" :key="msg.id" :owner="msg.class" :message="msg.label"></ChatBubble>
            </div>
        </div>

        <div class="controls">
            <div class="replies">
                <div v-for="node in replies" :key="node.id" @click="reply(node)" class="reply">
                    {{ node.label }}
                </div>
            </div>
        </div>
    </div>
</div>
</template>


<style scoped>
.chat-window {
    width: 30rem;
    max-width: calc(100vw - 2rem);
    height: 100%;
    background: white;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.chat-header {
    height: 3.6rem;
    background-color: #16a8cd;
    color: white;
    display: flex;
    justify-content: space-between;
}

.chat-header-left {
    display: flex;
}

.chat-header-left > svg {
    width: 2rem;
    height: 2rem;
    margin: 0.9rem 0.9rem 0 0.9rem;
}

.chat-header-right > svg {
    width: 1.4rem;
    height: 1.4rem;
    margin: 1.1rem 0.9rem 0 0;
    cursor: pointer;
}

.chat-title {
    color: #eee;
    font-weight: 500;
    margin-left: 1rem;
    align-self: center;
}

.chat-content {
    height: calc(100% - 3.6rem);
}

.history {
    height: 70%;
    overflow-y: scroll;
    width: 100%;
}

.history-bubbles {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    width: 100%;
}

.controls {
    height: 30%;
    overflow-y: scroll;
    border-top: 1px solid gray;
}

.replies {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
}

.reply {
    padding: 0.5rem 1rem;
    background-color: #e6deeb;
    background-color: #eeeeee;
    color: #003a49;
    border-radius: 0.5rem;
    text-align: center;
    cursor: pointer;
    transition: background-color 50ms;
}

.reply:hover {
    background-color: #f0ebf3;
    background-color: #f3f3f3;
}
</style>