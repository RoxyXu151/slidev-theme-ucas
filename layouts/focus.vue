<script setup lang="ts">import UcasFrame from '../components/UcasFrame.vue'</script>
<template><UcasFrame kind="focus"><div class="ucas-heading"><slot /></div><div class="ucas-focus-stage"><slot name="focus" /></div><div class="ucas-focus-explanation"><slot name="explanation" /></div><div v-if="$slots.note" class="ucas-note"><slot name="note" /></div></UcasFrame></template>
