const fs = require('fs')
const path = require('path')

const dirs = [
  path.join(__dirname, 'src/views'),
  path.join(__dirname, 'src/components')
]

const replacements = [
  { from: /#2d5a87/g, to: '#6366f1' },
  { from: /#eee[^0-9a-f]/g, to: '#e2e8f0' },
  { from: /#ddd[^0-9a-f]/g, to: '#cbd5e1' },
  { from: /#fafafa/g, to: '#f8fafc' },
  { from: /background: linear-gradient\(160deg, #6366f1 0%, #6366f1 40%, #6366f1 100%\);/g, to: 'background: #f1f5f9;' },
  { from: /background: #eee;/g, to: 'background: #f1f5f9;' },
]

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'))
  for (const file of files) {
    const fp = path.join(dir, file)
    let content = fs.readFileSync(fp, 'utf-8')
    let changed = false
    for (const r of replacements) {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to)
        changed = true
      }
    }
    if (changed) {
      fs.writeFileSync(fp, content, 'utf-8')
      console.log(`Updated: ${file}`)
    }
  }
}

// Also update App.vue
const appVue = path.join(__dirname, 'src/App.vue')
let appContent = fs.readFileSync(appVue, 'utf-8')
if (/#eee/.test(appContent) || /#ddd/.test(appContent) || /#fafafa/.test(appContent)) {
  appContent = appContent.replace(/#eee[^0-9a-f]/g, '#e2e8f0').replace(/#ddd[^0-9a-f]/g, '#cbd5e1').replace(/#fafafa/g, '#f8fafc')
  fs.writeFileSync(appVue, appContent, 'utf-8')
  console.log('Updated: App.vue')
}

console.log('Done.')
