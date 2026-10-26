<script setup lang="ts">
import { useUcasTheme } from '../composables/useUcasTheme'
import UcasBrand from '../components/UcasBrand.vue'
const { options, styleName, preset, dark, variables } = useUcasTheme()
</script>
<template><div class="slidev-layout ucas-toc" :class="`ucas-style-${styleName}`" :style="variables"><template v-if="dark"><img class="ucas-background" :src="preset.photo" alt="" /><div class="ucas-shade" /></template><div class="ucas-toc-side"><UcasBrand :white="true" /><h1>{{ options.heading || '目录' }}</h1><p>CONTENTS</p></div><main class="ucas-toc-main"><slot /></main><img v-if="'skyline' in preset" class="ucas-skyline" :src="preset.skyline" alt="" /></div></template>
