<script setup>
</script>

<template>
    <router-view></router-view>
</template>

<style>

/*
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;

}
*/

#app {
    font-family: 'Poppins', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

*, *::before, *::after {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

button {
    height: 2rem;
    background-color: rgb(123, 159, 180);
    background-color: #008c7b;
    background-color: rgb(123, 159, 180);
    border: none;
    cursor: pointer;
    text-transform: uppercase;
    border-radius: 2px;
    transition: background-color 100ms;
    padding: 0 1rem;
    color: white;
}

button:hover {
    background-color: #00a99a;
    background-color: rgb(165, 189, 202);
}

ul {
    list-style-position: inside;
}
</style>
