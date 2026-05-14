/**
 * 浏览器内嵌 PDF / 新窗口打开用的地址。
 * 后端若返回 http://localhost:8080/exports/...，iframe 会直连 8080；只开前端时易「拒绝连接」。
 * 对回环地址改为同源路径 /exports/...，由 Vite proxy 转发到后端。
 * 非回环的绝对 URL（如独立 CDN）原样返回。
 */
export function resolvePdfViewUrl(raw) {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s) return null
  if (s.startsWith('/exports/')) return s
  try {
    const base = typeof window !== 'undefined' ? window.location.href : 'http://localhost/'
    const u = new URL(s, base)
    if (!u.pathname.startsWith('/exports/')) return s
    const h = u.hostname.toLowerCase()
    const loopback = h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
    if (loopback) return `${u.pathname}${u.search}${u.hash}`
    return s
  } catch {
    return s
  }
}
