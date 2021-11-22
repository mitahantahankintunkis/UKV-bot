<script setup>
import AdminHeader from '../components/AdminHeader.vue';
import InfoBar from '../components/InfoBar.vue';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getUser } from '../utils';
import { inject, onUnmounted } from '@vue/runtime-core';
import { ref } from '@vue/reactivity';
import { useRoute, useRouter } from 'vue-router';


const router = useRouter();
const route = useRoute();

const user = getUser();
const db = inject('db');

const projectData = ref({});
const dataLoaded = ref(false);
const info = ref([ 'Ei muutoksia', '' ]);
const saveIntervalID = ref(-1);

const projectName = route.params.project;


// Updates infobar
function setInfo(i, value) {
    info.value[i] = value;
}

// Saves to localStorage
function saveProject(silent=false) {
    if (!user || !user.uid) {
        setInfo(1, 'Virheelliset tunnukset');
        return;
    }

    if (!silent) setInfo(0, 'Projekti tallennettu tietokoneen muistiin');
    const str = JSON.stringify(projectData.value);
    localStorage.setItem(`${user.uid}-project-${projectName}`, str);
}

// Loads from localStorage
function loadProject() {
    if (!user || !user.uid) {
        setInfo(1, 'Virheelliset tunnukset');
        return false;
    }

    const str = localStorage.getItem(`${user.uid}-project-${projectName}`);

    if (!str) {
        setInfo(0, 'Tallennettua projektia ei ole olemassa');
        return false;
    }

    const json = JSON.parse(str);

    if (!json) {
        setInfo(1, 'Virhe luettaessa projektia');
        return false;
    }
    setInfo(0, 'Projekti ladattu tietokoneen muistista');
    projectData.value = json;

    return true;
}

// Uploads the project to the cloud
async function uploadProject() {
    if (!db || !user) {
        setInfo(1, 'Virheelliset tunnukset');
        return;
    }

    if (projectData.value && projectData.value.readonly) {
        setInfo(1, 'Ei onnistu. Projekti on lukutilassa');
        return;
    }

    const docRef = doc(db, 'projects', projectName);

    setInfo(0, 'Lähetetään...');

    await updateDoc(docRef, {
        ...projectData.value,
        timestamp: serverTimestamp(),

    }).then(() => {
        setInfo(0, 'Sivusto päivitetty');
        saveProject(true);

    }).catch((e) => {
        console.error(e);
        setInfo(1, 'Virhe lähetettäessä pilveen');
    });
}

// Sets initial data
async function setData() {
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
        setInfo(1, 'Virhe luotaessa uutta projektia');
        router.push('/admin/');
    });

    setInfo(0, 'Projekti luotu onnistuneesti');

    return projectData;
}

// Gets project settings from firestore
async function downloadProject() {
    if (!db || !user) {
        setInfo(1, 'Virheelliset tunnukset');
        return;
    }

    dataLoaded.value = false;

    const projectName = route.params.project;
    const docRef = doc(db, 'projects', projectName);
    await getDoc(docRef)
        .then(async (docSnap) => {
            dataLoaded.value = true;

            if (docSnap.exists()) {
                setInfo(0, 'Projekti ladattu pilvestä');
                projectData.value = docSnap.data() || {};
            } else {
                setInfo(0, 'Luodaan uusi projekti...');
                projectData.value = await setData();
            }

            saveProject(true);
        })
        .catch((e) => {
            setInfo(1, 'Virhe luotaessa uutta projektia');
            console.error(e);
            router.push('/admin/');
        });
}

if (!loadProject()) downloadProject();

// Autosaving 
onUnmounted(() => {
    clearInterval(saveIntervalID.value);
});

clearInterval(saveIntervalID.value);
saveIntervalID.value = setInterval(saveProject, 1000 * 10);

</script>


<template>
    <AdminHeader></AdminHeader>

    <main>
        <router-view
            @info="setInfo"
            @upload="uploadProject"
            @download="downloadProject"
            @load="loadProject"
            @save="saveProject"
            :project="projectData"
            :key="dataLoaded">

        </router-view>

        <div class="infobar">
            <InfoBar :info="info"></InfoBar>
        </div>
    </main>
</template>


<style scoped>
main {
    width: 100%;
    margin: 3.6rem auto 0 auto;
}

.infobar {
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
}
</style>