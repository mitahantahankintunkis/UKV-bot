<script setup>
import ChatBubble from './ChatBubble.vue';
import { ref } from "@vue/reactivity";
import { nextTick, onUpdated } from '@vue/runtime-core';


const { project } = defineProps([ 'project' ]);
const emit = defineEmits([ 'close' ]);

let nodes = project.nodes || [];
let edges = project.edges || [];

const startNode = {
    id: 'asdf',
    label: 'Voit kokeilla miten vasemmalla näkyvät keskustelupolut toimivat täällä',
    class: 'unknown'
};

let root = null;

// Determines root
const notRoot = new Set();

for (let edge of edges) notRoot.add(edge.to);
for (let node of nodes) {
    if (notRoot.has(node.id)) continue;
    root = node;
    break;
}

const curNode = ref(root ? root : startNode);
const history = ref([ startNode ]);
const replies = ref([]);

if (root) history.value.push(root);

function updateReplies() {
    if (!curNode.value) return;

    replies.value = [];

    for (let edge of edges) {
        if (edge.from !== curNode.value.id) continue;

        replies.value.push(nodes.find((n) => n.id === edge.to));
    }
}

function reply(node) {
    history.value.push(node);

    //for (let edge of edges) {
    //    if (edge.from === )
    //    curNode.value = node;
    //    updateReplies();
    //}
}

function reset() {
    if (root) {
        curNode.value = root;
        updateReplies();
    }
}

reset();

//nextTick(() => {
//    const messages = document.querySelectorAll('.message');
//    messages[messages.length - 1].scrollIntoView({ behavior: 'smooth' });
//});
</script>


<template>
<div class="chat-window">
    <div class="chat-header">
        <div class="chat-header-left">
            <font-awesome-icon color="#eeeeee" icon="user-circle" />
            <p class="chat-title">UKV-botti</p>
        </div>
        <div class="chat-header-right">
            <font-awesome-icon @click="reset" color="#eeeeee" icon="redo" />
            <font-awesome-icon @click="emit('close')" color="#eeeeee" icon="chevron-down" />
        </div>
    </div>


    <div class="history">
        <ChatBubble v-for="msg in history" :key="msg.id" :owner="msg.class" :message="msg.label"></ChatBubble>
    </div>

    <div class="controls">
        <div class="replies">
            <div v-for="node in replies" :key="node.id" @click="reply(node)" class="reply">
                {{ node.label }}
            </div>
        </div>
    </div>
</div>
</template>


<style scoped>
.chat-window {
    width: 30rem;
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

.history {
    height: 70%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
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
    justify-content: center;
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