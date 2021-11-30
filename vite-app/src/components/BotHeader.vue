<script setup>

const emit = defineEmits([ 'toggleSidebar' ]);
</script>

<template>
    <header>
        <img class="logo" src="../assets/muuvo.jpg" alt="logo">

        <div class="hamburger-cont">
            <font-awesome-icon @click="emit('toggleSidebar')" class="hamburger" color="#444" icon="bars" />
        </div>

        <nav>
            <ul>
                <li>
                    <router-link :to="{ name: 'project' }">Etusivu</router-link>
                </li>
                <li>
                    <router-link :to="{ name: 'ukv' }">UKV</router-link>
                </li>
                <li>
                    <router-link :to="{ name: 'gdpr' }">Tietosuojaseloste</router-link>
                </li>
            </ul>
        </nav>
    </header>
</template>

<style scoped>
header {
    width: 100%;
    display: flex;
    align-content: space-between;
    align-items: flex-end;
    padding: 1rem;
    margin: 1rem 0;
}

.logo {
    width: auto;
    height: 6rem;
}

.hamburger-cont {
    display: none;
    align-self: center;
    width: 100%;
    height: 2rem;
    text-align: end;
}

.hamburger-cont svg {
    width: 2rem;
    height: 2rem;
    margin-right: 2rem;
    line-height: 2rem;
    cursor: pointer;
}

nav {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

ul {
    display: flex;
    list-style-type: none;
    gap: 3rem;
    justify-content: flex-end;
}

li {
    text-transform: uppercase;
    font-weight: 600;
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

@media only screen and (max-width: 600px) {
    nav {
        display: none;
    }

    .hamburger-cont {
        display: block;
    }
}

</style>
