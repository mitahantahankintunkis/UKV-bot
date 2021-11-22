<script setup>
import { useRoute } from 'vue-router';
import { getUser } from '../utils';


const route = useRoute();
const user = getUser();

</script>

<template>
    <header>
        <div>
            <ul>
                <li><router-link to="/admin">{{ route.params.project }}</router-link></li>
            </ul>
        </div>

        <div>
            <ul>
                <li><router-link :to="{ name: 'admin-management' }">Hallinta</router-link></li>
                <li><router-link :to="{ name: 'admin-editor' }">Sivusto</router-link></li>
                <li><router-link :to="{ name: 'admin-graph' }">Botti</router-link></li>
                <li><router-link :to="{ name: 'admin-anal' }">Tilastotieto</router-link></li>
            </ul>
        </div>

        <div>
            <ul>
                <li><router-link to="/logout">Kirjaudu ulos</router-link></li>
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
    height: 3.6rem;
    display: flex;
    background-color: #333;
    justify-content: space-between;
    padding: 0 2rem;
}

.logo {
    width: auto;
    height: 10rem;
}

.center {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

.right {
    height: 100%;
    justify-content: end;
}

ul {
    display: flex;
    list-style: none;
    gap: 3rem;
}

a {
    text-transform: uppercase;
    font-weight: 600;
    color: #888;
    text-decoration: none;
    line-height: 3.6rem;
}

a:hover {
    color: #ddd;
}

.router-link-exact-active {
    color: #ccc;
}

</style>
