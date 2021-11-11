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
                <li><a href="/logout">{{ route.params.project }}</a></li>
            </ul>
        </div>

        <div>
            <ul>
                <li><a href="#">Hallinta</a></li>
                <li><a href="#">Sivusto</a></li>
                <li><a href="#">Botti</a></li>
                <li><a href="#">Tilastotieto</a></li>
            </ul>
        </div>

        <div>
            <ul>
                <li><a href="/logout">Kirjaudu ulos</a></li>
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
    color: #ccc;
    text-decoration: none;
    line-height: 3.6rem;
}

</style>
