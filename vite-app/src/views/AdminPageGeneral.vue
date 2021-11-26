<script setup>
import { useRoute } from 'vue-router';


const emit = defineEmits([ 'download', 'upload', 'load', 'save', 'info' ]);
const props = defineProps([ 'project' ]);
const route = useRoute();
const projectName = route.params.project;
const customerUrl = `/projekti/${projectName}`;


function todo() {
    emit('info', 1, 'TODO - ei implementoitu');
}

</script>


<template>
    <main class="admin-cont">
        <h1>{{ projectName }}-projektin hallintapaneeli</h1>
        <h2>
            <router-link :to="customerUrl">Yritysten linkki projektiin</router-link>
        </h2>

        <p>
            Tällä sivustolla voit hallinnoida projektin asetuksia sekä
            tarkastella projektin tuottamaa dataa. Voit valita yläpalkista erilaisia työkaluja projektin hallintaan:
            <ul>
                <li>
                    <router-link :to="{ name: 'admin-management' }">Hallinta:</router-link>
                    Tämä sivusto
                </li>
                <li>
                    <router-link :to="{ name: 'admin-editor' }">Sivusto:</router-link>
                    Botin takana olevan sivuston määrittely
                </li>
                <li>
                    <router-link :to="{ name: 'admin-graph' }">Botti:</router-link>
                    Botin keskustelupolkujen editori
                </li>
                <li>
                    <router-link :to="{ name: 'admin-anal' }">Tilastotieto:</router-link>
                    Sivuston tilastotiedon tarkkailu ja lataaminen
                </li>
            </ul>
        </p>

        <div v-if="props.project.readonly">
            <h2 class="notice">Projekti on lukutilassa</h2>
            <p>Voit käyttää hallintapaneelia vapaasti, mutta et voi päivittää yrityksille näkyvää sivustoa</p>
        </div>

        <div class="danger">
            <h2 class="notice">Danger zone</h2>
            <p>Projektille vaarallisia toimintoja</p>

            <div>
                <button @click="todo">Poista projekti</button>
                <button @click="todo">Poista projektin keskustelut</button>
            </div>
        </div>
    </main>
</template>


<style scoped>
.admin-cont {
    width: 70vw;
    margin: 3.6rem auto 0 auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 5rem;
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

.notice {
    color: crimson;
}

.danger {
    width: 70%;
    margin: 7rem auto 0 auto;
    text-align: center;
}

.danger > div {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>