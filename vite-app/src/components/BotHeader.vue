<script setup>
</script>

<template>
    <header>
        <img class="logo" src="../assets/ukv.png" alt="logo">
        <div class="links">
            <ul>
                <li>
                    <router-link :to="{ name: 'project' }">Hanke</router-link>
                </li>
                <li>
                    <router-link :to="{ name: 'ukv' }">UKV</router-link>
                </li>
                <li>
                    <router-link :to="{ name: 'gdpr' }">Tietosuojaseloste</router-link>
                </li>
            </ul>
        </div>
    </header>
</template>

<style scoped>
header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 10rem;
    width: 70vw;
    margin: 2rem auto 0 auto;
    display: flex;
}

.logo {
    width: auto;
    height: 10rem;
}

.links {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: end;
}

ul {
    display: flex;
    list-style-type: none;
    gap: 3rem;
    justify-content: end;
}

li {
    text-transform: uppercase;
    font-weight: 600;
}

a {
    color: #333;
    text-decoration: none;
}

</style>
