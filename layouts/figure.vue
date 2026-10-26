<script setup lang="ts">
import UcasFrame from '../components/UcasFrame.vue'
import { useUcasTheme } from '../composables/useUcasTheme'
import { resolveUcasAsset } from '../composables/resolveUcasAsset'
const { options } = useUcasTheme()
</script>
<template><UcasFrame kind="figure"><div class="ucas-heading"><slot /></div><figure class="ucas-figure-stage"><img v-if="options.image" :src="resolveUcasAsset(options.image)" :alt="options.imageAlt || options.caption || ''" :style="{ objectFit: options.fit || 'contain' }" /><slot v-else name="figure" /><figcaption v-if="options.caption">{{ options.caption }}</figcaption></figure></UcasFrame></template>
