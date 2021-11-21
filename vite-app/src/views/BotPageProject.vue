<script setup>
import BotContent from '../components/BotContent.vue';

const { project } = defineProps([ 'project' ]);
const markdown = project.page;

</script>


<template>
<BotContent :markdown="markdown"></BotContent>
</template>


<style scoped>
</style>