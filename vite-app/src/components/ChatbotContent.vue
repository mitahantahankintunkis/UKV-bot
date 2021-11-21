<script setup>
import ChatBubble from './ChatBubble.vue';
import { ref } from '@vue/reactivity';
import { nextTick } from '@vue/runtime-core';
import { useRoute } from 'vue-router';


const route = useRoute();
const { project, editmode } = defineProps([ 'project', 'editmode' ]);
const emit = defineEmits([ 'close' ]);

let nodes = project.nodes || [];
let edges = project.edges || [];

const startNode = {
    id: 'asdf',
    label: 'Voit kokeilla miten vasemmalla näkyvät keskustelupolut toimivat täällä',
    class: 'unknown'
};

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

        const node = nodes.find((n) => n.id === edge.to && n.class === 'user');
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

function botReply() {
    canReply.value = true;
}

function reply(node) {
    if (!node) return;
    if (node.class === 'user' && !canReply.value) return;

    canReply.value = false;
    curNode.value = node;
    history.value.push(node);
    autoScroll();

    // Checking if the bot can reply to the current node
    const botReply = () => {
        for (let edge of edges) {
            if (edge.from === node.id) {
                const nextNode = nodes.find((n) => n.id === edge.to);
                if (nextNode.class === 'bot') return nextNode;
            }
        }
    }

    const botNode = botReply();

    if (botNode) {
        setTimeout(() => {
            reply(botNode);
        }, 400); //(Math.random() / 2 + 0.5) * 800);
    } else {
        updateReplies();
        canReply.value = true;
    }
}

function reset() {
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
            <p class="chat-title">{{ route.params.project.toUpperCase() }}botti</p>
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