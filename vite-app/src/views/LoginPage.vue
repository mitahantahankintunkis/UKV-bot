<script setup>
import { useRouter } from 'vue-router';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from '@firebase/auth';
import { ref } from '@vue/reactivity';
import { inject } from '@vue/runtime-core';


const router = useRouter();
const message = ref(null);
const auth = getAuth(); // inject('auth');


function login(e) {
    e.preventDefault();

    const email = document.getElementById('email').value || '';
    const pwd = document.getElementById('pwd').value || '';

    setPersistence(auth, browserLocalPersistence).then(() => {
        return signInWithEmailAndPassword(auth, email, pwd).then((cred) => {
            router.push('/admin');
        }).catch((e) => {
            console.error(e);
            message.value = 'Virhe kirjautuessa sisään';
        });
    }).catch((e) => {
            console.error(e);
            message.value = 'Virheelliset tunnukset';
    });
}

</script>


<template>
    <main>
        <div class="cont">
            <h2>Kirjaudu sisään</h2>
            <form @submit="login">
                <input name="email" id="email" type="text" placeholder="Sähköposti" required>
                <input name="pwd" id="pwd" type="password" placeholder="Salasana" required>
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
</style>