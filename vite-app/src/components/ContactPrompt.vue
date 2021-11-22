<script setup>
import { readKey, encrypt, createMessage } from 'openpgp/lightweight';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { ref } from '@vue/reactivity';


//const props = defineProps([ 'node' ]);
const emit = defineEmits([ 'submit' ]);

//const markdown = ref(props.node.label || '');
//const type = ref(props.node.class || 'bot');

const name = ref('');
const title = ref('');
const email = ref('');
const phone = ref('');
const consent1 = ref(false);
const consent2 = ref(false);
const message = ref('');

function cancel() {
    emit('submit', null);
}

async function pgpEncrypt(dataStr) {
    const publicKeyArmored = `-----BEGIN PGP PUBLIC KEY BLOCK-----

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
=YytS
-----END PGP PUBLIC KEY BLOCK-----`;

    const publicKey = await readKey({ armoredKey: publicKeyArmored });
    const encrypted = await encrypt({
        message: await createMessage({ text: dataStr }),
        encryptionKeys: publicKey,
    });

    return encrypted;
}

async function submit(e) {
    e.preventDefault();

    if (consent1.value !== true || !(/^.+@.+$/.test(email.value))) {
        message.value = 'Sinun tulee täyttää tähdellä merkityt kohdat';
        return;
    }

    const data = {
        name: name.value,
        title: title.value,
        email: email.value,
        phone: phone.value,
        messagingConsent: consent1.value,
        marketingConsent: consent2.value,
    };

    // TODO - encrypt
    const dataEncrypted = await pgpEncrypt(JSON.stringify(data));

    emit('submit', dataEncrypted);
}

</script>


<template>
    <div class="background">
        <div class="dialog">
            <div>
                <h3>Yhteystietolomake</h3>
                <p>
                    Antamasi yhteystiedot tallennetaan salattuina palvelimelle,
                    mistä ne poistetaan aikaan 01.01.2022 mennessä.
                    Yhteystietoja ei tulla jakamaan muille kuin MUUVO -hankkeen henkilökunnalle.
                    Lisätietoja saat lukemalla <router-link :to="{ name: 'gdpr' }">tietosuojaselosteen</router-link>
                </p>
            </div>

            <form @submit="submit">
                <div>
                    <label for="name">Nimi</label>
                    <input type="text" name="name" v-model="name">
                </div>

                <div>
                    <label for="title">Ammatinimike</label>
                    <input type="text" name="title" v-model="title">
                </div>

                <div>
                    <label for="email">Sähköposti*</label>
                    <input type="text" name="email" v-model="email" required >
                </div>

                <div>
                    <label for="phone">Puhelin</label>
                    <input type="text" name="phone" v-model="phone">
                </div>

                <div class="same-row">
                    <input type="checkbox" name="consent1" v-model="consent1" required>
                    <label for="consent1">Hyväksyn, että MUUVO-hankkeen henkilökunta voi ottaa yhteyttä antamiini yhteystietoihin*</label>
                </div>

                <div class="same-row">
                    <input type="checkbox" name="consent2" v-model="consent2">
                    <label for="consent2">Antamiini yhteystietoihin voi lähettää MUUVO-hankkeesta uutiskirjeitä, tiedotteita ja kutsuja tapahtumiin</label>
                </div>
            </form>

            <h4>{{ message }}</h4>

            <div class="buttons">
                <button class="btn-cancel" @click="cancel">Peruuta</button>
                <button class="btn-submit" @click="submit">Tallenna</button>
            </div>
        </div>
    </div>
</template>


<style scoped>
.background {
    position: fixed;
    background-color: #00000066;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
}

.dialog {
    background-color: white;
    width: 50%;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    padding: 2rem;
    border-radius: 0.5rem;
    gap: 2rem;
}
/*

.settings-left {
    width: 20%;
}

.settings-right {
    width: 80%;
}

.settings-left > *, .settings-right > * {
    width: 100%;
    display: flex;
    flex-direction: column;
}

select {
    height: 2rem;
    background-color: white;
    border: none;
    border-bottom: 1px solid #aaa;
    cursor: pointer;
}

a {
    font-size: 0.8rem;
}

textarea {
    resize: none;
    overflow-y: auto;
    height: 10rem;
}
*/

h3 {
    text-align: center;
    width: 100%;
    margin-bottom: 1rem;
}

h4 {
    color: crimson;
    text-align: center;
    margin-top: 0rem;
}

form {
    display: flex;
    flex-direction: column;
}

form > * {
    width: 100%;
}

form > div {
    display: flex;
    flex-direction: column;
    margin-bottom: 2rem;
}

form > div > label {
    width: 100%;
}

form > div > input {
    width: 100%;
    height: 1.5rem;
    border: none;
    border-bottom: 1px solid gray;
}

.same-row {
    display: flex;
    flex-direction: row;
}

.same-row > input {
    width: 1rem;
    height: 1rem;
    margin-right: 1rem;
    vertical-align: middle;
    align-self: center;
}

.buttons {
    gap: 0.2rem;
    display: flex;
    justify-content: end;
}

.btn-cancel {
    background-color: #eee;
    color: #444;
}
</style>