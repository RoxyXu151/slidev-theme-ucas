<script setup lang="ts">
import logo from '../assets/ucas-logo.png'
import whiteLogo from '../assets/ucas-logo-white.png'
defineProps<{ white?: boolean }>()
</script>
<template><img class="ucas-brand" :src="white ? whiteLogo : logo" alt="中国科学院大学 University of Chinese Academy of Sciences" /></template>
