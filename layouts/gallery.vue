<script setup lang="ts">import UcasFrame from '../components/UcasFrame.vue'</script>
<template><UcasFrame kind="gallery"><div class="ucas-heading"><slot /></div><div class="ucas-gallery-columns"><div><slot name="first" /></div><div><slot name="second" /></div><div><slot name="third" /></div></div><div v-if="$slots.note" class="ucas-note"><slot name="note" /></div></UcasFrame></template>
