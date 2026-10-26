<script setup lang="ts">
import UcasFrame from '../components/UcasFrame.vue'
import { useUcasTheme } from '../composables/useUcasTheme'
import { resolveUcasAsset } from '../composables/resolveUcasAsset'
const { options } = useUcasTheme()
</script>
<template><UcasFrame kind="image-left"><div class="ucas-heading"><slot name="title" /></div><div class="ucas-image-columns"><figure><img v-if="options.image" :src="resolveUcasAsset(options.image)" :alt="options.imageAlt || options.caption || ''" :style="{ objectFit: options.fit || 'contain' }" /><slot v-else name="image" /><figcaption v-if="options.caption">{{ options.caption }}</figcaption></figure><div><slot /></div></div></UcasFrame></template>
