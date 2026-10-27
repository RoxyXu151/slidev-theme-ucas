import { computed, reactive, unref } from 'vue'
import { useSlideContext } from '@slidev/client'
import blue from '../assets/skyline-blue.png'
import red from '../assets/skyline-red.png'
import green from '../assets/skyline-green.png'
import tech from '../assets/campus-tech.webp'
import gate from '../assets/campus-gate.webp'
import night from '../assets/campus-night.webp'
import autumn from '../assets/campus-autumn.webp'
import sunset from '../assets/campus-sunset.webp'
import ime from '../assets/ime-lab-strip.webp'

export const presets = {
  'minimal-blue': { primary: '#2e3c63', accent: '#5399d4', pale: '#e6f1f9', skyline: blue, photo: gate },
  'minimal-red': { primary: '#800202', accent: '#d43e43', pale: '#fff0f0', skyline: red, photo: gate },
  'minimal-green': { primary: '#3d6499', accent: '#5ab886', pale: '#f0f7dc', skyline: green, photo: gate },
  tech: { primary: '#174994', accent: '#6d9fec', pale: '#eaf0f9', photo: tech },
  diagonal: { primary: '#314371', accent: '#607bb2', pale: '#edf0f8', photo: gate },
  night: { primary: '#e67823', accent: '#fcb66d', pale: '#1b2737', photo: night },
  autumn: { primary: '#af5819', accent: '#e38239', pale: '#fff3e7', photo: autumn },
  sunset: { primary: '#ac292c', accent: '#e7797e', pale: '#fff2ed', photo: sunset },
  ime: { primary: '#000066', accent: '#0b5fa5', pale: '#edf4fa', photo: ime },
}

export function useUcasTheme() {
  const context = reactive(useSlideContext())
  const options = computed(() => ({ style: 'minimal-blue', footer: '中国科学院大学', showPageNumber: true, navigation: 'top', sections: [], ...context.$slidev.themeConfigs, ...unref(context.$frontmatter) }))
  const styleName = computed(() => Object.hasOwn(presets, options.value.style) ? options.value.style as keyof typeof presets : 'minimal-blue')
  const preset = computed(() => presets[styleName.value])
  const dark = computed(() => styleName.value === 'night')
  const variables = computed(() => ({ '--ucas-primary': options.value.primary ?? preset.value.primary, '--ucas-accent': options.value.accent ?? preset.value.accent, '--ucas-pale': preset.value.pale }))
  return { options, context, preset, styleName, dark, variables }
}
