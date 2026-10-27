<script setup lang="ts">
import { computed } from 'vue'
import { useUcasTheme } from '../composables/useUcasTheme'
import UcasBrand from './UcasBrand.vue'
import seal from '../assets/ucas-seal.png'
import imeSeal from '../assets/ime-seal.png'
import UcasImeFooter from './UcasImeFooter.vue'
defineProps<{ kind?: string }>()
const { options, context, preset, styleName, dark, variables } = useUcasTheme()
const navigation = computed(() => styleName.value === 'tech' && options.value.navigation === 'side' ? 'side' : 'top')
const whiteBrand = computed(() => dark.value || styleName.value.startsWith('minimal-') || styleName.value === 'tech' || styleName.value === 'autumn')
const sections = computed(() => Array.isArray(options.value.sections) ? options.value.sections : [])
</script>
<template>
  <div class="slidev-layout ucas-frame" :class="[`ucas-style-${styleName}`, `ucas-${kind || 'default'}`, `ucas-navigation-${navigation}`]" :style="variables" :data-ucas-section="options.section || undefined">
    <template v-if="dark"><img class="ucas-background" :src="preset.photo" alt="" /><div class="ucas-shade" /></template>
    <header class="ucas-header">
      <template v-if="styleName === 'ime'">
        <span class="ucas-ime-chevrons" aria-hidden="true"><i /><i /><i /></span>
        <span v-if="kind === 'section'" class="ucas-ime-section-label">{{ options.section || '章节' }}</span>
        <img class="ucas-ime-seal" :src="imeSeal" alt="中国科学院微电子研究所所徽" />
      </template>
      <template v-else-if="navigation === 'side'"><img class="ucas-nav-seal" :src="seal" alt="中国科学院大学校徽" /></template>
      <UcasBrand v-else :white="whiteBrand" />
      <nav v-if="sections.length && styleName !== 'ime'" class="ucas-navigation" aria-label="章节">
        <span v-for="(section, index) in sections" :key="index" :class="{ 'ucas-nav-active': Number(options.sectionIndex) === index + 1 }">{{ section }}</span>
      </nav>
      <span v-else-if="styleName !== 'ime'" class="ucas-section-label">{{ options.section || '中国科学院大学 · 学术报告' }}</span>
    </header>
    <main class="ucas-main"><slot /></main>
    <img v-if="'skyline' in preset" class="ucas-skyline" :src="preset.skyline" alt="" />
    <UcasImeFooter v-if="styleName === 'ime'" />
    <footer v-else-if="options.footer !== false" class="ucas-footer"><span>{{ options.footer }}</span><span v-if="options.showPageNumber" class="ucas-page">{{ context.$page }}<span class="ucas-page-total"> / {{ context.$nav.total }}</span></span></footer>
  </div>
</template>
