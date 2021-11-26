<script setup>
import { useRouter } from 'vue-router';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from '@firebase/auth';
import { ref } from '@vue/reactivity';
import { inject } from '@vue/runtime-core';
import { getUser } from '../utils';


const router = useRouter();
const message = ref(null);
const email = ref('');
const pwd = ref('');
const auth = getAuth(); // inject('auth');
let user = getUser();

if (user) router.push('/admin/');

function login(e) {
    e.preventDefault();

    //const email = document.getElementById('email').value || '';
    //const pwd = document.getElementById('pwd').value || '';

    // TODO - Fix this hacky solution
    user = getUser();
    if (user && user.email === email.value) router.push('/admin/');

    setPersistence(auth, browserLocalPersistence).then(() => {
        return signInWithEmailAndPassword(auth, email.value, pwd.value).then((cred) => {
            router.push('/admin/');
        }).catch((e) => {
            console.error(e);
            message.value = 'Virheelliset tunnukset';
        });
    }).catch((e) => {
            console.error(e);
            message.value = 'Virhe kirjautuessa sisään';
    });
}

</script>


<template>
    <main>
        <div class="cont">
            <h2>Kirjaudu sisään</h2>
            <form @submit="login">
                <input v-model="email" name="email" id="email" type="text" placeholder="Sähköposti" required>
                <input v-model="pwd" name="pwd" id="pwd" type="password" placeholder="Salasana" required>
                <button type="submit">Kirjaudu sisään</button>
            </form>
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

form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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

h4 {
    color: crimson;
    text-align: center;
    margin-top: 2rem;
}
</style>