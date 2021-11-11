<script setup>
import { useRouter } from 'vue-router';
import { ref } from '@vue/reactivity';
import { doc, getDoc } from 'firebase/firestore';
import { inject } from '@vue/runtime-core';
import { getUser, projectNameToId } from '../utils';


const router = useRouter();
const user = getUser();
const db = inject('db');

const message = ref(null);
const projectsLoaded = ref(false);
const projects = ref([]);


async function getProjects() {
    if (!db || !user) return;

    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    projectsLoaded.value = true;

    if (docSnap.exists()) {
        const data = docSnap.data();
        projects.value = data['projects'] || [];
    }
}
getProjects();


function createProject() {
    // Using prompt since this feature isn't going to be used
    // too many times
    const projectName = prompt('Projektin nimi');

    if (!projectName || projectName.length === 0) {
        message.value = 'Virheellinen nimi';
        return;
    }

    const projectId = projectNameToId(projectName);
    console.log(projectId);
    router.push(`/admin/${projectId}`);
}
</script>


<template>
    <main>
        <div class="cont">
            <h2>Valitse projekti</h2>

            <h3 v-if="!projectsLoaded">Ladataan...</h3>
            <ul v-else>
                <li v-for="p in projects" :key="p">
                    <a :href="`/admin/${projectNameToId(p)}`">{{ p }}</a>
                </li>
            </ul>

            <button @click="createProject">Luo uusi</button>
            <h4 v-if="message">{{ message }}</h4>
        </div>
    </main>
</template>


<style scoped>
main {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: #eee;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
}

.cont {
    max-width: 30rem;
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    background-color: white;
}

h2 {
    margin-bottom: 2rem;
    width: 100%;
    text-align: center;
}

input {
    height: 2rem;
    border: none;
    border-bottom: 1px solid gray;
}

button {
    height: 2rem;
    margin-top: 3rem;
    background-color: rgb(123, 159, 180);
    border: none;
    cursor: pointer;
    text-transform: uppercase;
    border-radius: 2px;
    transition: background-color 100ms;
}

button:hover {
    background-color: rgb(165, 189, 202);
}

h4 {
    color: crimson;
    text-align: center;
    margin-top: 2rem;
}

ul {
    list-style: none;
}

.projectlink {
    cursor: pointer;
}
</style>