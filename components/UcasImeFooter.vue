<script setup lang="ts">
import { computed } from 'vue'
import { useUcasTheme } from '../composables/useUcasTheme'
import wordmark from '../assets/ime-wordmark.png'
defineProps<{ cover?: boolean }>()
const { options, context } = useUcasTheme()
const label = computed(() => ['中国科学院大学', '中国科学院微电子研究所'].includes(options.value.footer) ? 'www.ime.ac.cn' : options.value.footer)
</script>
<template>
  <footer v-if="options.footer !== false" class="ucas-footer ucas-ime-footer" :class="{ 'ucas-ime-footer-cover': cover }">
    <span class="ucas-ime-footer-label">{{ label }}</span>
    <span v-if="!cover && options.showPageNumber" class="ucas-ime-page">{{ context.$page }}</span>
    <img v-if="!cover" :src="wordmark" alt="中国科学院微电子研究所" />
  </footer>
</template>
