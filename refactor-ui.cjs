const fs = require('fs')
const path = require('path')

const dirs = [
  path.join(__dirname, 'src/views'),
  path.join(__dirname, 'src/components')
]

const replacements = [
  // Colors - primary
  { from: /#1a3a5c/g, to: '#6366f1' },
  { from: /#0f2540/g, to: '#4f46e5' },
  // Colors - accent gold → indigo
  { from: /#c9a96e/g, to: '#6366f1' },
  { from: /#b8985a/g, to: '#4f46e5' },
  // Colors - backgrounds
  { from: /#f7f5f0/g, to: '#f8fafc' },
  { from: /#faf9f7/g, to: '#f8fafc' },
  { from: /#f5f3ef/g, to: '#f1f5f9' },
  { from: /#fffaf0/g, to: '#eef2ff' },
  // Colors - borders
  { from: /#ebe8e0/g, to: '#e2e8f0' },
  { from: /#e0ddd5/g, to: '#e2e8f0' },
  { from: /#e8e4dc/g, to: '#e2e8f0' },
  // Colors - light bg / tags
  { from: /#f0ece4/g, to: '#f1f5f9' },
  { from: /#faf8f4/g, to: '#f8fafc' },
  // Colors - text
  { from: /#1a1a1a/g, to: '#0f172a' },
  { from: /#2c2c2c/g, to: '#1e293b' },
  { from: /#333;/g, to: '#334155;' },
  { from: /#333 /g, to: '#334155 ' },
  { from: /#444;/g, to: '#475569;' },
  { from: /#444 /g, to: '#475569 ' },
  { from: /#555;/g, to: '#64748b;' },
  { from: /#555 /g, to: '#64748b ' },
  { from: /#5a5a5a/g, to: '#64748b' },
  { from: /#666;/g, to: '#64748b;' },
  { from: /#666 /g, to: '#64748b ' },
  { from: /#888;/g, to: '#94a3b8;' },
  { from: /#888 /g, to: '#94a3b8 ' },
  { from: /#999;/g, to: '#94a3b8;' },
  { from: /#999 /g, to: '#94a3b8 ' },
  { from: /#aaa;/g, to: '#cbd5e1;' },
  { from: /#aaa /g, to: '#cbd5e1 ' },
  // Colors - red/error
  { from: /#c0392b/g, to: '#ef4444' },
  { from: /#e74c3c/g, to: '#ef4444' },
  // Border radius
  { from: /border-radius: 20px/g, to: 'border-radius: 12px' },
  { from: /border-radius: 16px/g, to: 'border-radius: 12px' },
  { from: /border-radius: 14px/g, to: 'border-radius: 8px' },
  { from: /border-radius: 12px/g, to: 'border-radius: 8px' },
  { from: /border-radius: 10px/g, to: 'border-radius: 8px' },
  // Shadows
  { from: /0 8px 24px rgba\(26, 58, 92, 0\.08\)/g, to: '0 4px 12px rgba(0,0,0,0.05)' },
  { from: /0 20px 60px rgba\(0,0,0,0\.25\)/g, to: '0 16px 48px rgba(0,0,0,0.12)' },
  { from: /0 20px 60px rgba\(0,0,0,0\.2\)/g, to: '0 16px 48px rgba(0,0,0,0.12)' },
  { from: /0 2px 8px rgba\(0,0,0,0\.06\)/g, to: '0 1px 4px rgba(0,0,0,0.04)' },
  { from: /0 2px 8px rgba\(0,0,0,0\.04\)/g, to: '0 1px 4px rgba(0,0,0,0.04)' },
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
    } else {
      console.log(`Skipped: ${file}`)
    }
  }
}

console.log('Done.')
