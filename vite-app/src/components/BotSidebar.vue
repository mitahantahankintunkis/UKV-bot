<script setup>
const emit = defineEmits([ 'toggleSidebar' ]);
</script>

<template>
    <nav>
        <div @click="emit('toggleSidebar')" class="close">
            <font-awesome-icon class="close-icon" color="#444" icon="arrow-right" />
        </div>

        <ul>
            <li>
                <router-link @click="emit('toggleSidebar')" :to="{ name: 'project' }">Etusivu</router-link>
            </li>
            <li>
                <router-link @click="emit('toggleSidebar')" :to="{ name: 'ukv' }">UKV</router-link>
            </li>
            <li>
                <router-link @click="emit('toggleSidebar')" :to="{ name: 'gdpr' }">Tietosuojaseloste</router-link>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
nav {
    height: 100vh;
    width: 20rem;
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    position: fixed;
    right: 0;
    top: 0;
    background: white;
    border-left: 1px solid #ddd;
    box-shadow: 0 0 8px #00000044;
}

.close {
    width: 100%;
    padding: 2rem;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.close-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: block;
}

ul {
    display: flex;
    flex-direction: column;
    list-style-type: none;
    justify-content: flex-end;
}

li {
    font-weight: 600;
    padding: 2rem;
}

.router-link-exact-active {
    color: #333;
}

.router-link-exact-active::after {
    transform: scaleX(1);
}

a {
    position: relative;
    text-decoration: none;
    color: #333;
    transition: color 50ms;
}

a::after {
    position: absolute;
    content: "";
    width: 100%;
    height: 3px;
    top: 90%;
    left: 0;
    background: #0eabcc;
    transition: transform 50ms;
    transform: scaleX(0);
    transform-origin: center;
}

a:hover::after {
    transform: scaleX(1);
}

</style>
