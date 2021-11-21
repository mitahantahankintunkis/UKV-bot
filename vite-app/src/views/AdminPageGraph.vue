<script setup>
import { nanoid } from 'nanoid';
import NodeEditor from '../components/NodeEditor.vue';

const emit = defineEmits([ 'download', 'upload', 'load', 'save', 'info' ]);
const props = defineProps([ 'project' ]);
</script>


<template>
    <NodeEditor
            @info="(i, value) => emit('info', i, value)"
            @upload="emit('upload')"
            @download="emit('download')"
            @load="emit('load')"
            @save="emit('save')"
            :project="props.project">

     </NodeEditor>
</template>


<style scoped>
</style>