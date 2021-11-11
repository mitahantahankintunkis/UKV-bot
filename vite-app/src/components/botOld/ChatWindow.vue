<script setup>
import ChatHistory from "./ChatHistory.vue";
import ChatControls from "./ChatControls.vue";
import { ref } from "@vue/reactivity";
import { inject } from "@vue/runtime-core";
import { nanoid } from 'nanoid';
import { addDoc, collection, serverTimestamp } from "@firebase/firestore";


const emit = defineEmits(['close']);
//const db = inject('db');

let id = 0;
const nodes = [
    { id: id++, label: 'Beep-boop, olen UKV-botti 🤖. Minulla olisi muutama kysymys Krapin bootcapmista', },
    { id: id++, label: 'Voit keskustella minun kanssani painamalla alla olevia vaihtoehtoja. Kaikki vastaukset ovat täysin anonyymejä, jotenka voit vastata niihin huoletta', },
    { id: id++, label: 'Työstimme eilen oppiraportteja. Missä vaiheessa arvioisit teidän raporttinne olevan?', },
    { id: id++, label: 'Miten arvioisitte eilisen illallisen?', },
    { id: id++, label: 'Monta tuntia sait nukuttua viime yönä?', },
    { id: id++, label: 'Hienoa!', },
    { id: id++, label: 'Muutaman päivän selviää hieman alhaisemmalla unimäärällä, mutta pidemmän päälle kannattaa nukkua yli kahdeksan tuntia päivässä. Jos päivän aikana alkaa väsyttämään, niin kannattaa harkita lyhyitä 10 minuutin päiväunia', },
    { id: id++, label: 'Yöunien suositeltu mitta on vähintään kahdeksan tuntia. Jo yhden tunnin ylimääräinen yöuni saa ihmeitä aikaan, olet virkeämpi, innovatiivisempi ja muisti lakkaa pätkimästä. Saat lisätietoa osoitteesta [example.com](https://example.com)', },
    { id: id++, label: 'Jos olet autolla matkassa, niin kannattaa ottaa päiväunet ennen lähtöä. Vähäisten yöunien vaikutus ajamiseen on verrattavissa humalatilaan', },
    { id: id++, label: 'Asteikolla 1-5, miten yleisesti arvioisit minun kanssani keskustelemista?', },
    { id: id++, label: 'Kiitos vastauksistasi, ja mukavaa päivänjatkoa!', },
];

id = 0;
const edges = [
    { id: id++, from: 0, to: 1, label: null, },

    { id: id++, from: 1, to: 2, label: 'Haluan vastata Krapin kyselyyn', },

    { id: id++, from: 2, to: 3, label: 'Sen on valmis', },
    { id: id++, from: 2, to: 3, label: 'Viimeistelyä vaille valmis', },
    { id: id++, from: 2, to: 3, label: 'Se on noin puolivälissä', },
    { id: id++, from: 2, to: 3, label: 'Vasta alkuvaiheissa', },

    { id: id++, from: 3, to: 4, label: '⭐⭐⭐⭐⭐', },
    { id: id++, from: 3, to: 4, label: '⭐⭐⭐⭐', },
    { id: id++, from: 3, to: 4, label: '⭐⭐⭐', },
    { id: id++, from: 3, to: 4, label: '⭐⭐', },
    { id: id++, from: 3, to: 4, label: '⭐', },

    { id: id++, from: 4, to: 5, label: 'Yli 8 tuntia', },
    { id: id++, from: 4, to: 6, label: '6-8 tuntia', },
    { id: id++, from: 4, to: 7, label: '4-6 tuntia', },
    { id: id++, from: 4, to: 8, label: 'Alle 4 tuntia', },

    { id: id++, from: 5, to: 9, label: null, },
    { id: id++, from: 6, to: 9, label: null, },
    { id: id++, from: 7, to: 9, label: null, },
    { id: id++, from: 8, to: 9, label: null, },

    { id: id++, from: 9, to: 10, label: '5', },
    { id: id++, from: 9, to: 10, label: '4', },
    { id: id++, from: 9, to: 10, label: '3', },
    { id: id++, from: 9, to: 10, label: '2', },
    { id: id++, from: 9, to: 10, label: '1', },
];

const curNode = ref(0);
const replies = ref([]);
const history = ref([]);
const canReply = ref(true);

// Gets and generates a random anonymous user id for the user
function getUid() {
    let uid = localStorage.getItem('uid');
    if (!uid) {
        uid = nanoid();
        localStorage.setItem('uid', uid);
    }

    return uid;
}

function saveToDb(from, to, label, edgeId) {
    const uid = getUid();
    try {
        const coll = collection(db, 'conversations');
        const docRef = addDoc(coll, {
            uid: uid,
            edge_id: edgeId,
            parent: from,
            next: to,
            message: label,
            timestamp: serverTimestamp(),
        });
    } catch(e) {
        console.error('Could not write to the database', e);
    }
}

// Sends the message found in node[id]
function botReply(id, continuation=false, depth=0) {
    canReply.value = false;

    const node = nodes.find((n) => n.id === id);
    const delay = continuation ? 100 : (Math.random() / 2 + 0.5) * 800;

    if (depth > 20) {
        console.error('Too many chained replies.');
        return;
    }

    setTimeout(() => {
        let failsafe = 0;

        const newReplies = edges.filter((e) => e.from === node.id);
        if (newReplies.length > 0 && !newReplies[0].label) {
            botReply(newReplies[0].to, continuation, depth+1);
        } else {
            replies.value = edges.filter((e) => e.from === node.id);
            canReply.value = true;
        }

        curNode.value = node.id;
        history.value.push({
            id: `n-${node.id}`,
            message: node.label,
            own: false,
        });
    }, delay);
}

function reply(id) {
    if (!canReply.value) return;
    canReply.value = false;
    const { id: edgeId, to, label } = edges.find((e) => e.id === id);

    //saveToDb(curNode.value, to, label, edgeId);

    history.value.push({
        id: `e-${id}`,
        message: label,
        own: true,
    });

    botReply(to);
}

function reload() {
    botReply(0);
}

botReply(0);
</script>


<template>
<div class="chat-window">
    <div class="chat-header">
        <div class="chat-header-left">
            <font-awesome-icon color="#eeeeee" icon="user-circle" />
            <p>UKV-botti</p>
        </div>
        <div class="chat-header-right">
            <font-awesome-icon @click="reload" color="#eeeeee" icon="redo" />
            <font-awesome-icon @click="emit('close')" color="#eeeeee" icon="chevron-down" />
        </div>
    </div>
    <div class="chat-content">
        <div class="chat-messages">
            <ChatHistory :history="history"></ChatHistory>
        </div>
        <div class="chat-controls">
            <ChatControls @click="reply" :replies="replies"></ChatControls>
        </div>
    </div>
</div>
</template>


<style scoped>
.chat-window {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 30rem;
    height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
    border-radius: 1rem;
    background-color: white;
    box-shadow: #c3c3c3 0px 0px 8px;
    transition: height 100ms;
}

.chat-header {
    height: 3.6rem;
    background-color: #16a8cd;
    border-radius: 1rem 1rem 0 0;
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

.chat-header > p {
    color: #eee;
    font-weight: 500;
    margin-left: 1rem;
    line-height: 1.9rem;
}

.chat-content {
    height: calc(100vh - 5.7rem);
}

.chat-messages {
    height: 70%;
    overflow-y: auto;
}

.chat-controls {
    height: 30%;
    border-top: 1px solid #dddddd;
    border-radius: 0 0 1rem 1rem;
    overflow-y: auto;
}

@media only screen 
  and (max-device-width: 560px) {

    .chat-window {
        width: calc(100vw - 2rem);
    }
}
</style>


<!--



//function createTree(id, message, replies=[]) {
//    return {
//        id,
//        message,
//        replies,
//    };
//}
//
//function createReply(id, reply, subtree={}) {
//    return {
//        id,
//        reply,
//        subtree,
//    };
//}
//
//let i = 0;
//let j = 0;
//
//const conversationTree = createTree(i++, 'Hei, kuinka voin auttaa', [
//    createReply(j++, 'Tarvitsen apua verkkokaupan luomisessa',
//        createTree(i++, 'Onko teidän yrityksellä jo verkkosivut?', [
//            createReply(j++, 'On', createTree(i++, 'Hyvä!')),
//            createReply(j++, 'Ei', createTree(i++, 'Kannattaa tehdä')),
//            createReply(j++, 'On tekeillä', createTree(i++, 'Kysykää teidän ohjelmoijilta')),
//        ]),
//    ),
//    createReply(j++, 'Miten saan nostettua työntekijöideni osaamistasoa?',
//        createTree(i++, 'Voitte kartoittaa ja nostaa teidän työntekijöiden osaamistasoa suorittamalla osaamiskartoituksen')),
//    createReply(j++, 'Miten saan päivitettyä HR-järjestelmäni ajantasalle?',
//        createTree(i++, 'Ottakaa yhteyttä konsultoijaan maija.meikäläinen@example.com')),
//]);
//
//const tree = ref(conversationTree);
//const replies = ref(conversationTree.replies);
//const history = ref([{
//        id: conversationTree.id,
//        message: conversationTree.message,
//        own: false,
//}]);

//const replies = ref([
//    { id: 0, message: 'Miksi et?' },
//    { id: 1, message: 'Kitti tästä' },
//    { id: 2, message: 'Haista home' },
//]);
//const history = ref([
//    { id: 0, message: 'Hei, kuinka voin auttaa?', own: false },
//    { id: 1, message: 'Tartten apua', own: true },
//    { id: 2, message: 'En halua auttaa', own: false },
//]);



//function reply(id) {
//    const reply = tree.value.replies.find((t) => t.id === id);
//    tree.value = reply.subtree;
//    history.value.push({
//        id,
//        message: reply.reply,
//        own: true,
//    });
//
//    setTimeout(() => {
//        history.value.push({
//            id: reply.subtree.id,
//            message: reply.subtree.message,
//            own: false,
//        });
//
//        replies.value = reply.subtree.replies;
//
//        if (reply.subtree.replies.length === 0) {
//            tree.value = conversationTree;
//            replies.value = conversationTree.replies;
//        }
//    }, 1000);
//
//}


let id = 0;
const nodes = [
    { id: id++, label: 'Beep-boop, olen UKV-botti 🤖. Kuinka voin auttaa?', },
    { id: id++, label: 'Miten menee?', },
    { id: id++, label: 'Miten arvostelisit Krapin pippalot?', },
    { id: id++, label: 'Mitä haluat tehdä huomenna?', },
    { id: id++, label: 'Kiitos vastauksista! Palaan keskustelun alkuun, jos haluat muuttaa vastauksiasi', },
];

id = 0;
const edges = [
    { id: id++, from: 0, to: 1, label: 'Haluan vastata Krapin kyselyyn', },
    { id: id++, from: 1, to: 2, label: 'Mainiosti!', },
    { id: id++, from: 1, to: 2, label: 'Hyvin', },
    { id: id++, from: 1, to: 2, label: 'Menettelee', },
    { id: id++, from: 1, to: 2, label: 'Hengissä vielä', },
    { id: id++, from: 2, to: 3, label: '5', },
    { id: id++, from: 2, to: 3, label: '4', },
    { id: id++, from: 2, to: 3, label: '3', },
    { id: id++, from: 2, to: 3, label: '2', },
    { id: id++, from: 2, to: 3, label: '1', },
    { id: id++, from: 3, to: 4, label: 'Työskennellä', },
    { id: id++, from: 3, to: 4, label: 'Jutella porukan kanssa', },
    { id: id++, from: 3, to: 4, label: 'Rentoutua', },
    { id: id++, from: 3, to: 4, label: 'Ryypätä', },
    { id: id++, from: 4, to: 0, label: 'Palaa alkuun', },
];

-->