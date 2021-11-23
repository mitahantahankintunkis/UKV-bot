<script setup>
import { doc, increment, setDoc, updateDoc } from '@firebase/firestore';
import { inject } from '@vue/runtime-core';
import { useRoute } from 'vue-router';


const db = inject('db');
const route = useRoute();
const query = route.query;

// Sets initial data
async function redirect(path) {
    const url = new URL(path);

    let cleanUrl = url.host;
    if (url.path) cleanUrl += url.path;

    const docRef = doc(db, 'usage', 'redirections');

    await updateDoc(docRef, {
        redirections: increment(1),

    }).then((e) => {
        // TODO - Unsafe redirect
        try {
            window.location.assign(url);
        } catch(e) {
            console.error(e);
        }

    }).catch((e) => {
        const data = {};
        data[cleanUrl] = 1;

        setDoc(docRef, data)
            .catch(console.error);
    });
}

if (query.to) {
    //redirect(query.to);
}
</script>


<template>
    <div class="landing-cont">
        <div v-if="query.to">
            <h1>Ohjataan (keskeneräinen)...</h1>
            <p>Vaihtoehtoisesti klikkaa <a :href="query.to">tätä linkkiä</a></p>
        </div>
        <div v-else>
            <h1>204</h1>
            <h2>Ei sisältöä</h2>
        </div>
    </div>
</template>

<style scoped>
.landing-cont {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 5rem;
}

p {
    margin-top: 2rem;
}
</style>