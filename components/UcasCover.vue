<script setup lang="ts">
import { computed } from 'vue'
import { useUcasTheme } from '../composables/useUcasTheme'
import { resolveUcasAsset } from '../composables/resolveUcasAsset'
import UcasBrand from './UcasBrand.vue'
import UcasImeCover from './UcasImeCover.vue'
defineProps<{ ending?: boolean }>()
const { options, styleName, preset, variables } = useUcasTheme()
const minimal = computed(() => styleName.value.startsWith('minimal-'))
const photo = computed(() => options.value.image ? resolveUcasAsset(options.value.image) : preset.value.photo)
const whiteBrand = computed(() => ['night', 'autumn', 'sunset', 'diagonal'].includes(styleName.value))
</script>
<template>
  <UcasImeCover v-if="styleName === 'ime'" :ending="ending"><slot /></UcasImeCover>
  <div v-else class="slidev-layout ucas-cover" :class="[`ucas-style-${styleName}`, { 'ucas-ending': ending }]" :style="variables">
    <template v-if="!minimal"><img class="ucas-cover-photo" :src="photo" :alt="options.imageAlt || '原模板中的国科大校园照片'" /><div class="ucas-cover-wash" /></template>
    <UcasBrand :white="whiteBrand" />
    <div class="ucas-cover-content">
      <div class="ucas-cover-title"><slot /><p v-if="options.subtitle" class="ucas-cover-subtitle">{{ options.subtitle }}</p></div>
      <dl class="ucas-cover-meta">
        <div v-if="options.presenter"><dt>汇报人</dt><dd>{{ options.presenter }}</dd></div>
        <div v-if="options.advisor"><dt>指导教师</dt><dd>{{ options.advisor }}</dd></div>
        <div v-if="options.date"><dt>日期</dt><dd>{{ options.date }}</dd></div>
      </dl>
    </div>
    <img v-if="minimal && 'skyline' in preset" class="ucas-cover-skyline" :src="preset.skyline" alt="" />
  </div>
</template>
