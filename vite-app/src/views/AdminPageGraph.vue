<script setup>
import { nanoid } from 'nanoid';
import NodeEditor from '../components/NodeEditor.vue';

const props = defineProps([ 'project' ]);
</script>


<template>
    <NodeEditor :project="props.project"></NodeEditor>
</template>


<style scoped>
</style>