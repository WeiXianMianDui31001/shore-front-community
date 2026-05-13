const fs = require('fs')
const path = require('path')

const dirs = [
  path.join(__dirname, 'src/views'),
  path.join(__dirname, 'src/components')
]

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'))
  for (const file of files) {
    const fp = path.join(dir, file)
    let content = fs.readFileSync(fp, 'utf-8')

    // Fix duplicate class attributes: class="page-container" class="xxx" -> class="page-container xxx"
    // Also handle class="xxx" class="page-container"
    const dupPattern = /class="([^"]+)"\s+class="([^"]+)"/g
    if (dupPattern.test(content)) {
      content = content.replace(dupPattern, (match, c1, c2) => {
        return `class="${c1} ${c2}"`
      })
      fs.writeFileSync(fp, content, 'utf-8')
      console.log(`Fixed: ${file}`)
    }
  }
}

console.log('Done.')
