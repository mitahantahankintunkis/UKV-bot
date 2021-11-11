<script>
export default {
    updated() {
        this.$nextTick(function() {
            const bubbles = document.querySelectorAll('.bubble');
            bubbles[bubbles.length - 1].scrollIntoView({ behavior: 'smooth' });
        });
    },
};
</script>


<script setup>
import { toRefs } from "@vue/reactivity";
import ChatBubble from "./ChatBubble.vue";

const props = defineProps({
    history: Array,
});

const { history } = toRefs(props);
</script>


<template>
<div class="cont">
    <ChatBubble class="bubble" v-for="msg in history" :key="msg.id" :own="msg.own" :message="msg.message"></ChatBubble>
</div>
</template>


<style scoped>
.cont {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    width: 100%;
}
</style>