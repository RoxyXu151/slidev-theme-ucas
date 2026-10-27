<script setup lang="ts">
import { useUcasTheme } from '../composables/useUcasTheme'
import UcasBrand from '../components/UcasBrand.vue'
import UcasFrame from '../components/UcasFrame.vue'
const { options, styleName, preset, dark, variables } = useUcasTheme()
// Resolve numbering into attributes: PowerPoint cannot evaluate CSS counter().
function numberItems(root: HTMLElement) {
  root.querySelectorAll('ol').forEach((list) => {
    const start = Number.parseInt(list.getAttribute('start') || '1', 10)
    Array.from(list.children).filter(item => item.tagName === 'LI').forEach((item, index) => {
      item.setAttribute('data-ucas-number', String(start + index).padStart(2, '0'))
      item.setAttribute('data-ucas-ordinal', ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][start + index - 1] || String(start + index))
      item.classList.toggle('ucas-ime-toc-active', start + index === Number(options.value.sectionIndex || 1))
    })
  })
}
const vNumberedToc = { mounted: numberItems, updated: numberItems }
</script>
<template>
  <UcasFrame v-if="styleName === 'ime'" kind="toc">
    <div class="ucas-heading"><h1>{{ options.heading || '汇报提纲' }}</h1></div>
    <div v-numbered-toc class="ucas-toc-main ucas-ime-toc"><slot /></div>
  </UcasFrame>
  <div v-else class="slidev-layout ucas-toc" :class="`ucas-style-${styleName}`" :style="variables"><template v-if="dark"><img class="ucas-background" :src="preset.photo" alt="" /><div class="ucas-shade" /></template><div class="ucas-toc-side"><UcasBrand :white="true" /><h1>{{ options.heading || '目录' }}</h1><p>CONTENTS</p></div><main v-numbered-toc class="ucas-toc-main"><slot /></main><img v-if="'skyline' in preset" class="ucas-skyline" :src="preset.skyline" alt="" /></div>
</template>
