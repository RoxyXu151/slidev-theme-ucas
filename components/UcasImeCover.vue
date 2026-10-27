<script setup lang="ts">
import { useUcasTheme } from '../composables/useUcasTheme'
import UcasImeFooter from './UcasImeFooter.vue'
import header from '../assets/ime-header.png'
import logo from '../assets/ime-logo-white.png'
import strip from '../assets/ime-lab-strip.webp'
defineProps<{ ending?: boolean }>()
const { options, variables } = useUcasTheme()
</script>
<template>
  <div class="slidev-layout ucas-cover ucas-ime-cover ucas-style-ime" :class="{ 'ucas-ending': ending }" :style="variables">
    <header class="ucas-ime-cover-header">
      <img class="ucas-ime-header-artwork" :src="header" alt="" />
      <img class="ucas-ime-cover-logo" :src="logo" alt="中国科学院微电子研究所 Institute of Microelectronics of Chinese Academy of Sciences" />
      <span>{{ options.section || '中国科学院微电子研究所 · 学术报告' }}</span>
    </header>
    <div class="ucas-cover-content">
      <div class="ucas-cover-title"><slot /><p v-if="options.subtitle" class="ucas-cover-subtitle">{{ options.subtitle }}</p></div>
      <dl class="ucas-cover-meta">
        <div v-if="options.presenter"><dt>汇报人：</dt><dd>{{ options.presenter }}</dd></div>
        <div v-if="options.advisor"><dt>指导老师：</dt><dd>{{ options.advisor }}</dd></div>
        <div v-if="options.date" class="ucas-ime-cover-date"><dd>{{ options.date }}</dd></div>
      </dl>
    </div>
    <img class="ucas-ime-lab-strip" :src="strip" alt="原模板中的实验设备、晶圆与洁净室照片条" />
    <UcasImeFooter cover />
  </div>
</template>
