<script setup>
import AdminHeader from '../components/AdminHeader.vue';
//import AdminContent from '../components/AdminContent.vue';
import { useRoute, useRouter } from 'vue-router';
import { inject } from '@vue/runtime-core';
import { ref } from '@vue/reactivity';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { getUser } from '../utils';


const emit = defineEmits([ 'download', 'upload', 'load', 'save', 'info' ]);
const props = defineProps([ 'project' ]);

const router = useRouter();
const route = useRoute();

const db = inject('db');

const projectData = ref({});
const dataLoaded = ref(false);

const visitorCount      = ref('?');
const conversationCount = ref('?');
const redirectedCount   = ref('?');
const contactsCount     = ref('?');
const conversations     = ref([]);


async function getData() {
    if (!db) {
        setInfo(1, 'DB ei ole olemassa (?)');
        return;
    }

    dataLoaded.value = false;

    const projectName = route.params.project;
    const coll = collection(db, 'projects', projectName, 'conversations');
    const q = query(coll);

    emit('info', 0, 'Ladataan tilastotietoa...');
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        conversations.value.push(doc.data());
    })

    conversationCount.value = conversations.value.length;

    emit('info', 0, 'Tilastotieto ladattu');
}

// Downloads conversations as a .csv file
function saveCSV() {
    if (!conversations.value || conversations.value.length === 0) return;

    const rows = [];
    const edges = props.project.edges;
    const nodes = props.project.nodes;
    const nodeParents = conversations.value.map((c) => c.responses.map((r) => r.parent)).flat();
    const nodesWithResponses = nodes.filter((n) => {
        return n.class === 'bot' && nodeParents.find((c) => c === n.id);
    });
    const indexLookup = new Map();

    for (let node of nodesWithResponses) {
        indexLookup.set(node.id, indexLookup.size);
    }

    rows.push(nodesWithResponses.map((n) => n.label));

    for (let conv of conversations.value) {
        const row = Array(nodesWithResponses.length).fill('');

        for (let msg of conv.responses) {
            const i = indexLookup.get(msg.parent);
            if (i === undefined) continue;

            row[i] = msg.label;
        }

        rows.push(row);
    }

    const strRows = rows.map((row) => row.map((c) => `"${c.replace('\n', '\\n')}"`));

    let data = strRows.map((row) => row.join(';'));
    data = [ data[0] ].concat(data.slice(1).sort());
    data = data.join('\n');

    const anchor = document.createElement("a");
    anchor.download = "keskustelut.csv";

    const blob = new Blob([data], {
        type: "text/plain",
    });

    anchor.href = window.URL.createObjectURL(blob);
    anchor.click();
}

getData();
</script>


<template>
    <main>
        <div class="anal-cont">
            <h1>Pahasti keskeneräinen</h1>

            <h2>Yleistietoa</h2>
            <div class="row">
                <div class="card">
                    <h3 class="card-title">Sivustolla käyneitä</h3>
                    <div class="card-content"><h4>{{ visitorCount }}</h4></div>
                </div>
                <div class="card">
                    <h3 class="card-title">Keskusteluja</h3>
                    <div class="card-content"><h4>{{ conversationCount }}</h4></div>
                </div>
                <div class="card">
                    <h3 class="card-title">Muuaalle ohjattuja</h3>
                    <div class="card-content"><h4>{{ redirectedCount }}</h4></div>
                </div>
                <div class="card">
                    <h3 class="card-title">Yhteystietoja</h3>
                    <div class="card-content"><h4>{{ contactsCount }}</h4></div>
                </div>
            </div>

            <h2>Keskustelut</h2>
            <div class="row">
                <div class="card">
                    <h3 class="card-title">Keskustelujen lataus, (väliaikainen, hieman rikki)</h3>
                    <div class="card-content">
                        <button @click="saveCSV">Lataa .csv muodossa</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>


<style scoped>

main {
    width: 100vw;
    min-height: calc(100vh - 3.6rem - 2rem);
    background: #eee;
}

.anal-cont {
    width: 70vw;
    margin: 3.6rem auto 0 auto;
}

h1, h2, h3, h4, h5 {
    font-weight: 600;
    color: #333;
    margin: 1em 0;
}

p {
    margin: 1rem 0;
}

ul {
    margin-left: 5rem;
    margin-top: 2rem;
}

.row {
    display: flex;
    width: 100%;
    gap: 0.5rem;
}

.card {
    background: white;
    border-radius: 4px;
    padding: 1rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    text-align: center;
}

.card-title {
    height: 3.5rem;
    display: block;
    align-self: center;
    margin: 0.5rem 0;
}

.card-content {

}

button {
    width: 100%;
}

h2 {
    margin-top: 3rem;
    margin-bottom: 1rem;
}
</style>