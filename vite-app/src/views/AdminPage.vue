<script setup>
import AdminHeader from '../components/AdminHeader.vue';
import { useRoute, useRouter } from 'vue-router';
import { inject } from '@vue/runtime-core';
import { ref } from '@vue/reactivity';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getUser } from '../utils';


const router = useRouter();
const route = useRoute();

const user = getUser();
const db = inject('db');

const projectData = ref({});
const dataLoaded = ref(false);

// Sets initial data
async function setData() {
    const projectName = route.params.project;
    const docRef = doc(db, 'projects', projectName);

    const projectData = {
        nodes: [],
        edges: [],
        page: '# TODO',
        readonly: false,
        timestamp: serverTimestamp(),
    };

    await setDoc(docRef, projectData).catch((e) => {
        console.error(e);
        router.push('/admin/');
    });

    return projectData;
}

// Gets project settings from firestore
async function getData() {
    if (!db || !user) return;

    dataLoaded.value = false;

    const projectName = route.params.project;
    const docRef = doc(db, 'projects', projectName);
    await getDoc(docRef)
        .then(async (docSnap) => {
            dataLoaded.value = true;

            if (docSnap.exists()) {
                projectData.value = docSnap.data() || {};
            } else {
                projectData.value = await setData();
            }

        })
        .catch((e) => {
            console.error(e);
            router.push('/admin/');
        });
}
getData();

</script>


<template>
    <AdminHeader></AdminHeader>

    <main>
        <router-view @refreshData="getData" :project="projectData" :key="dataLoaded"></router-view>
    </main>
</template>


<style scoped>
main {
    width: 100%;
    margin: 3.6rem auto 0 auto;
}
</style>