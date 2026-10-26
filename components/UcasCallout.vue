<script setup lang="ts">defineProps<{ title?: string; tone?: 'accent' | 'primary' }>()</script>
<template><aside class="ucas-callout" :class="{ 'ucas-callout-accent': tone === 'accent' }"><h3 v-if="title">{{ title }}</h3><slot /></aside></template>
