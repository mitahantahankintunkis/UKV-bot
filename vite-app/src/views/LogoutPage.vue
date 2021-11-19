<script setup>
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { ref } from '@vue/reactivity';
import { inject } from '@vue/runtime-core';


const router = useRouter();
const message = ref(null);
const auth = inject('auth');


function logout(e) {
    e.preventDefault();

    signOut(auth).then(() => {
        router.push('/login');
    })
    .catch((e) => {
        console.error(e);
        message.value = 'Virhe kirjautuessa ulos';
    });
}

</script>


<template>
    <main>
        <div class="cont">
            <h2>Kirjaudu ulos käyttäjältä</h2>
            <h3>{{ '<todo>' }}</h3>
            <button @click="logout">Kirjaudu ulos</button>
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
    padding-top: 2rem;;
}

h2 {
    width: 100%;
    text-align: center;
}

h3 {
    width: 100%;
    text-align: center;
}

h4 {
    color: crimson;
    text-align: center;
    margin-top: 2rem;
}
</style>