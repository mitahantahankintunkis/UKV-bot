<script setup>
import AdminHeader from '../components/AdminHeader.vue';
//import AdminContent from '../components/AdminContent.vue';
import { useRoute, useRouter } from 'vue-router';
import { inject } from '@vue/runtime-core';
import { ref } from '@vue/reactivity';
import { doc, getDoc } from 'firebase/firestore';
import { getUser } from '../utils';


const router = useRouter();
const route = useRoute();

const user = getUser();
const db = inject('db');

const projectData = ref({});
const dataLoaded = ref(false);

async function getData() {
    if (!db || !user) return;

    const projectId = route.params.project;
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);

    dataLoaded.value = true;

    if (docSnap.exists()) {
        const data = docSnap.data();
        projectData.value = docSnap.data() || {};
    }
}
getData();
</script>


<template>
    <AdminHeader></AdminHeader>

    <main>
        <router-view :project="projectData" :key="dataLoaded"></router-view>
    </main>
</template>


<style scoped>
main {
    width: 100%;
    margin: 3.6rem auto 0 auto;
}
</style>