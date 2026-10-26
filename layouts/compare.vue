<script setup lang="ts">import UcasFrame from '../components/UcasFrame.vue'</script>
<template><UcasFrame kind="compare"><div class="ucas-heading"><slot /></div><div class="ucas-comparison"><div><slot name="left" /></div><div><slot name="right" /></div></div><div v-if="$slots.note" class="ucas-note"><slot name="note" /></div></UcasFrame></template>
