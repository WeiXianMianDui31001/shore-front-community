const fs = require('fs')
const path = require('path')

const dirs = [
  path.join(__dirname, 'src/views'),
  path.join(__dirname, 'src/components')
]

// Files already manually refactored - skip
const skipFiles = new Set([
  'PostListView.vue', 'LoginView.vue', 'ProfileView.vue', 'RoomLobbyView.vue'
])

const colorReplacements = [
  // Be careful with order - more specific first
  { from: /#4f46e5/g, to: 'var(--primary-hover)' },
  { from: /#6366f1/g, to: 'var(--primary)' },
  { from: /#f8fafc/g, to: 'var(--bg)' },
  { from: /#f1f5f9/g, to: 'var(--bg)' },
  { from: /#eef2ff/g, to: 'var(--primary-light)' },
  { from: /#e2e8f0/g, to: 'var(--border)' },
  { from: /#cbd5e1/g, to: 'var(--border-hover)' },
  { from: /#0f172a/g, to: 'var(--text)' },
  { from: /#1e293b/g, to: 'var(--text)' },
  { from: /#334155/g, to: 'var(--text-secondary)' },
  { from: /#475569/g, to: 'var(--text-secondary)' },
  { from: /#64748b/g, to: 'var(--text-secondary)' },
  { from: /#94a3b8/g, to: 'var(--text-muted)' },
  { from: /#ef4444/g, to: 'var(--danger)' },
  { from: /#dc2626/g, to: 'var(--danger)' },
  { from: /#22c55e/g, to: 'var(--success)' },
  { from: /#16a34a/g, to: 'var(--success)' },
  { from: /#f59e0b/g, to: 'var(--warning)' },
  { from: /#d97706/g, to: 'var(--warning)' },
  { from: /#2563eb/g, to: '#2563eb' }, // Keep blue as-is (role colors)
  { from: /#ea580c/g, to: '#ea580c' }, // Keep orange as-is
]

const radiusReplacements = [
  { from: /border-radius: 12px/g, to: 'border-radius: var(--radius-lg)' },
  { from: /border-radius: 8px/g, to: 'border-radius: var(--radius-md)' },
  { from: /border-radius: 6px/g, to: 'border-radius: var(--radius-sm)' },
  { from: /border-radius: 50%/g, to: 'border-radius: var(--radius-full)' },
]

const shadowReplacements = [
  { from: /0 4px 12px rgba\(0,0,0,0\.05\)/g, to: 'var(--shadow-md)' },
  { from: /0 1px 4px rgba\(0,0,0,0\.04\)/g, to: 'var(--shadow-sm)' },
  { from: /0 16px 48px rgba\(0,0,0,0\.12\)/g, to: 'var(--shadow-lg)' },
]

// Background #fff -> var(--surface), but only in CSS property values
const whiteBgReplacements = [
  { from: /background: #fff;/g, to: 'background: var(--surface);' },
  { from: /background: #fff /g, to: 'background: var(--surface) ' },
  { from: /background-color: #fff;/g, to: 'background-color: var(--surface);' },
  { from: /background-color: #fff /g, to: 'background-color: var(--surface) ' },
]

// White text color -> var(--text-on-primary)
const whiteTextReplacements = [
  { from: /color: #fff;/g, to: 'color: var(--text-on-primary);' },
  { from: /color: #fff /g, to: 'color: var(--text-on-primary) ' },
]

const allReplacements = [
  ...colorReplacements,
  ...radiusReplacements,
  ...shadowReplacements,
  ...whiteBgReplacements,
  ...whiteTextReplacements,
]

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'))
  for (const file of files) {
    if (skipFiles.has(file)) {
      console.log(`Skip: ${file}`)
      continue
    }

    const fp = path.join(dir, file)
    let content = fs.readFileSync(fp, 'utf-8')
    let changed = false

    // Replace colors/styles in CSS
    for (const r of allReplacements) {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to)
        changed = true
      }
    }

    // Add page-container class to outermost div if not login/room
    if (!file.includes('Login') && !file.includes('RoomDetail')) {
      const templateMatch = content.match(/<template>[\s\S]*?<div([^>]*)class="([^"]*)"/)
      if (templateMatch && !templateMatch[2].includes('page-container') && !templateMatch[2].includes('login-page') && !templateMatch[2].includes('room-detail')) {
        // Find first div in template
        content = content.replace(
          /<template>\s*\n\s*<div/,
          '<template>\n  <div class="page-container"'
        )
        changed = true
      }
    }

    if (changed) {
      fs.writeFileSync(fp, content, 'utf-8')
      console.log(`Updated: ${file}`)
    } else {
      console.log(`No change: ${file}`)
    }
  }
}

console.log('Done.')
