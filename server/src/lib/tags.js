// Helper para serializar/deserializar tags en SQLite
// SQLite no soporta arrays, usamos JSON strings

export const serializeTags = (tags) => {
  if (!tags) return '[]'
  if (typeof tags === 'string') return tags
  return JSON.stringify(tags)
}

export const parseTags = (tagsStr) => {
  if (!tagsStr) return []
  if (Array.isArray(tagsStr)) return tagsStr
  try { return JSON.parse(tagsStr) } catch { return [] }
}

// Enriquecer una entrada de diario (parsear tags)
export const parseEntry = (entry) => ({
  ...entry,
  tags: parseTags(entry.tags),
})

// Enriquecer múltiples entradas
export const parseEntries = (entries) => entries.map(parseEntry)
