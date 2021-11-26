<script setup>
import { useRoute } from 'vue-router';


const route = useRoute();
const query = route.query;

if (query.to) {
    // TODO - Unsafe redirect
    try {
        setTimeout(() => {
            window.location.href = query.to;
        }, 2000);
    } catch(e) {
        console.error(e);
    }
}
</script>


<template>
    <div class="landing-cont">
        <div v-if="query.to">
            <h1>Ohjataan...</h1>
            <p>Vaihtoehtoisesti voit klikata <a :href="query.to">tätä linkkiä</a></p>
        </div>
        <div v-else>
            <h1>204</h1>
            <h2>Ei sisältöä</h2>
        </div>
    </div>
</template>

<style scoped>
.landing-cont {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 5rem;
}

p {
    margin-top: 2rem;
}
</style>