import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { MOOD_ICONS, AVAILABLE_TAGS, formatDate, isEditable } from '../../lib/constants'
import MoodIcon from '../../components/MoodIcon'
import MoodCalendar from '../../components/MoodCalendar'
import { Trash2, ChevronDown, ChevronUp, Clock, Bookmark, BookmarkX, Filter } from 'lucide-react'

export default function HistoryPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [filterTag, setFilterTag] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    api.get('/journal')
      .then(({ data }) => setEntries(data.entries))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta entrada?')) return
    setDeleting(id)
    try {
      await api.delete(`/journal/${id}`)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar.')
    } finally {
      setDeleting(null)
    }
  }

  const handleDayClick = (date, dayEntries) => {
    setSelectedDay((prev) => {
      const isSame = prev?.toDateString() === date.toDateString()
      return isSame ? null : date
    })
    setFilterTag('')
  }

  let filtered = entries
  if (selectedDay) {
    filtered = filtered.filter((e) => {
      const d = new Date(e.createdAt)
      return d.toDateString() === selectedDay.toDateString()
    })
  }
  if (filterTag) filtered = filtered.filter((e) => e.tags?.includes(filterTag))

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => <div key={i} className="card h-20 bg-gray-100 dark:bg-gray-800" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Historial</h1>
        <p className="text-sm text-gray-400">{entries.length} entradas</p>
      </div>

      {/* ── Calendario de ánimo ── */}
      {entries.length > 0 && (
        <div>
          <MoodCalendar
            entries={entries}
            onDayClick={handleDayClick}
            selectedDate={selectedDay}
            mode="patient"
          />
          {selectedDay && (
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-xs text-sage-600 dark:text-sage-400 font-semibold">
                📅 {selectedDay.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <button onClick={() => setSelectedDay(null)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Ver todo
              </button>
            </div>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📔</div>
          <h2 className="text-xl font-bold text-gray-700 dark:text-white mb-2">Historial vacío</h2>
          <p className="text-gray-400">Tus anotaciones aparecerán aquí.</p>
        </div>
      ) : (
        <>
          {/* ── Filtros ── */}
          <div className="card shadow-none border-dashed space-y-2.5">
            <div className="flex flex-wrap gap-2 items-center">
              <Filter size={13} className="text-gray-400" />
              <select
                className="input-psych text-sm flex-1 min-w-[140px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={filterTag}
                onChange={(e) => { setFilterTag(e.target.value); setSelectedDay(null) }}
              >
                <option value="">Todas las etiquetas</option>
                {AVAILABLE_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {(filterTag || selectedDay) && (
                <button onClick={() => { setFilterTag(''); setSelectedDay(null) }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline">
                  Limpiar
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">{filtered.length} entradas</p>
          </div>

          {/* ── Lista ── */}
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                {selectedDay ? 'Sin anotaciones ese día.' : 'Sin entradas con estos filtros.'}
              </div>
            )}
            {filtered.map((entry) => {
              const canEdit = isEditable(entry.createdAt)
              const open = expanded === entry.id
              const config = MOOD_ICONS[entry.moodScore]

              return (
                <div
                  key={entry.id}
                  className="card cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3" onClick={() => setExpanded(open ? null : entry.id)}>
                    <div
                      className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: config?.bg, border: `1px solid ${config?.color}40` }}
                    >
                      <MoodIcon score={entry.moodScore} size={22} />
                      <span className="text-xs font-bold mt-0.5" style={{ color: config?.color }}>{entry.moodScore}/10</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold mb-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="capitalize" style={{ color: config?.color }}>
                          {new Date(entry.createdAt).toLocaleDateString('es-AR', { weekday: 'long' })}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">
                          {new Date(entry.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">{config?.label}</span>
                      </div>
                      {!open && <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{entry.content || '(Prefiere contarlo en sesión)'}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {canEdit && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                          disabled={deleting === entry.id}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                    </div>
                  </div>

                  {open && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                      {entry.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {entry.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                        </div>
                      )}
                        {!canEdit && (
                          <div className="mt-3">
                            <p className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} /> Solo editable en las primeras 24h</p>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
