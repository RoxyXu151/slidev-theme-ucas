/** Public-directory assets must respect a consumer's deployment subpath. */
export function resolveUcasAsset(value: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return value
  const base = import.meta.env.BASE_URL
  return `${base.replace(/\/$/, '')}${value}`
}
