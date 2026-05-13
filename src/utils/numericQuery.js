/**
 * 从路由 query 解析非负整数字符串（含雪花 id），避免 Number() 精度丢失。
 * @param {unknown} v
 * @returns {string | null}
 */
export function parseDigitsQuery(v) {
  if (v == null) return null
  const raw = Array.isArray(v) ? v[0] : v
  const s = String(raw).trim()
  if (!/^\d+$/.test(s)) return null
  return s
}
