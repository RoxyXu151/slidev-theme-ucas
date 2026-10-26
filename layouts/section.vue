<script setup lang="ts">
import { useUcasTheme } from '../composables/useUcasTheme'
import UcasBrand from '../components/UcasBrand.vue'
const { options, styleName, preset, dark, variables } = useUcasTheme()
</script>
<template><div class="slidev-layout ucas-section" :class="`ucas-style-${styleName}`" :style="variables"><template v-if="dark"><img class="ucas-background" :src="preset.photo" alt="" /><div class="ucas-shade" /></template><UcasBrand :white="dark || styleName === 'autumn'" /><div class="ucas-section-body"><span class="ucas-section-number">{{ options.number || '01' }}</span><div><slot /><p v-if="options.subtitle" class="ucas-section-subtitle">{{ options.subtitle }}</p></div></div><img v-if="'skyline' in preset" class="ucas-cover-skyline" :src="preset.skyline" alt="" /></div></template>
