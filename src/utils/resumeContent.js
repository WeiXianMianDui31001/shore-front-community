export function parseStructureJson(structureJson) {
  try {
    const arr = JSON.parse(structureJson)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function mergeSampleRow(fields, sample) {
  const row = emptyItemFromFields(fields)
  if (!sample) return row
  for (const f of fields ?? []) {
    const v = sample[f]
    if (v != null && String(v).length > 0) row[f] = String(v)
  }
  return row
}

function initialItemsFromDef(d) {
  const fields = d.fields ?? []
  const samples = d.sampleItems
  if (Array.isArray(samples) && samples.length > 0) {
    return samples.map((s) => mergeSampleRow(fields, s))
  }
  return [emptyItemFromFields(fields)]
}

export function buildEmptyContentRoot(defs) {
  const sections = []
  for (const d of defs) {
    sections.push({
      key: d.key,
      title: d.title,
      layout: d.layout,
      items: initialItemsFromDef(d),
    })
  }
  return { sections }
}

export function parseContentJson(raw) {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function stringifyContent(root) {
  return JSON.stringify(root)
}

function emptyItemFromFields(fields) {
  const row = {}
  for (const f of fields ?? []) row[f] = ''
  return row
}

export function alignSectionsWithDefs(defs, existing) {
  const byKey = new Map(existing.map((s) => [s.key, s]))
  const out = []
  for (const d of defs) {
    let s = byKey.get(d.key)
    if (!s) {
      s = {
        key: d.key,
        title: d.title,
        layout: d.layout,
        items: initialItemsFromDef(d),
      }
    } else {
      s = { ...s, title: d.title, layout: d.layout ?? s.layout }
      if (!s.items.length) s.items = initialItemsFromDef(d)
      for (const it of s.items) {
        for (const f of d.fields ?? []) {
          if (!(f in it)) it[f] = ''
        }
      }
    }
    out.push(s)
  }
  return out
}
