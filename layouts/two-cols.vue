<script setup lang="ts">import UcasFrame from '../components/UcasFrame.vue'</script>
<template><UcasFrame kind="two-cols"><div class="ucas-heading"><slot /></div><div class="ucas-columns"><div><slot name="left" /></div><div><slot name="right" /></div></div><div v-if="$slots.note" class="ucas-note"><slot name="note" /></div></UcasFrame></template>
