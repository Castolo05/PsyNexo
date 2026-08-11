import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'
import { MOOD_ICONS, AVAILABLE_TAGS, formatDate, formatDateShort } from '../../lib/constants'
import MoodIcon from '../../components/MoodIcon'
import MoodChart from '../../components/MoodChart'
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Plus,
  Bookmark, Tag, AlertTriangle, Wifi, Target,
  CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp,
  Save, X, Filter, Calendar,
} from 'lucide-react'

// ── Ficha pre-sesión ──────────────────────────────────────
function PreSessionCard({ insights }) {
  if (!insights) return null
  const { avgThisWeek, avgLastWeek, trend, topTags, entriesThisWeek } = insights

  const trendNum = trend ? parseFloat(trend) : 0
  const TrendIcon = trendNum > 0 ? TrendingUp : trendNum < 0 ? TrendingDown : Minus
  const trendColor = trendNum > 0 ? 'text-emerald-600' : trendNum < 0 ? 'text-red-500' : 'text-gray-400'

  return (
    <div className="card-psych dark:bg-gray-800 border-l-4 border-l-indigo-400">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
          Ficha Pre-Sesión
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Promedio semana actual */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Esta semana</p>
          {avgThisWeek ? (
            <>
              <p className="text-2xl font-black text-gray-800 dark:text-white">{avgThisWeek}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <MoodIcon score={Math.round(parseFloat(avgThisWeek))} size={12} />
              </div>
            </>
          ) : <p className="text-gray-400 text-sm">—</p>}
        </div>

        {/* Tendencia vs semana anterior */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">vs. semana anterior</p>
          {trend ? (
            <div className={`flex items-center justify-center gap-1 ${trendColor}`}>
              <TrendIcon size={22} />
              <span className="text-2xl font-black">{trendNum > 0 ? '+' : ''}{trend}</span>
            </div>
          ) : <p className="text-gray-400 text-sm">Insuf. datos</p>}
        </div>
      </div>

      {/* Tags recurrentes */}
      {topTags?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 font-semibold mb-1.5 flex items-center gap-1"><Tag size={11} />Temas recurrentes (14 días)</p>
          <div className="flex flex-wrap gap-1.5">
            {topTags.map(({ tag, count }) => (
              <span key={tag} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700 font-medium">
                {tag} <span className="opacity-60">({count}x)</span>
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// ── Notas de sesión ───────────────────────────────────────
function SessionNotes({ patientId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [editing, setEditing] = useState(null) // noteId being edited
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/session-notes/${patientId}`)
      .then(({ data }) => setNotes(data.notes))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [patientId])

  const handleCreate = async () => {
    if (!newContent.trim()) return
    setSaving(true)
    try {
      const { data } = await api.post(`/session-notes/${patientId}`, {
        title: newTitle || `Sesión ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}`,
        content: newContent,
        sessionDate: new Date().toISOString(),
      })
      setNotes((prev) => [data.note, ...prev])
      setNewTitle(''); setNewContent(''); setCreating(false)
    } catch { alert('Error al crear nota.') }
    finally { setSaving(false) }
  }

  const handleUpdate = async (noteId) => {
    setSaving(true)
    try {
      const { data } = await api.put(`/session-notes/note/${noteId}`, { title: editTitle, content: editContent })
      setNotes((prev) => prev.map((n) => n.id === noteId ? data.note : n))
      setEditing(null)
    } catch { alert('Error al actualizar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (noteId) => {
    if (!confirm('¿Eliminar esta nota de sesión?')) return
    try {
      await api.delete(`/session-notes/note/${noteId}`)
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    } catch { alert('Error al eliminar.') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-1.5">
          <Calendar size={14} /> Notas de sesión
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded-full ml-1">{notes.length}</span>
        </h3>
        <button
          onClick={() => setCreating(!creating)}
          className="btn-psych text-xs py-1.5 px-3 flex items-center gap-1"
        >
          <Plus size={13} /> Nueva sesión
        </button>
      </div>

      {/* Formulario nueva nota */}
      {creating && (
        <div className="card-psych dark:bg-gray-800 mb-3 animate-slide-up border-l-4 border-l-indigo-400">
          <input
            className="input-psych dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2"
            placeholder={`Título (ej: Sesión ${new Date().toLocaleDateString('es-AR')})`}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="input-psych dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none h-32"
            placeholder="Notas de esta sesión, temas trabajados, tarea asignada..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => setCreating(false)} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1">
              <X size={13} /> Cancelar
            </button>
            <button onClick={handleCreate} disabled={saving || !newContent.trim()} className="btn-psych text-xs py-1.5 px-3 flex items-center gap-1">
              <Save size={13} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="animate-pulse space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}</div>}

      {!loading && notes.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">Sin notas de sesión. Crea la primera →</p>
      )}

      <div className="space-y-2">
        {notes.map((note) => {
          const isOpen = expanded === note.id
          const isEditing = editing === note.id
          return (
            <div key={note.id} className="card-psych dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => !isEditing && setExpanded(isOpen ? null : note.id)}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                    {note.title || 'Sin título'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(note.sessionDate).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditing(note.id); setEditTitle(note.title); setEditContent(note.content)
                      setExpanded(note.id)
                    }}
                    className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id) }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
                  {isEditing ? (
                    <>
                      <input
                        className="input-psych dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2 text-sm"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <textarea
                        className="input-psych dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none h-28 text-sm"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="flex gap-2 mt-2 justify-end">
                        <button onClick={() => setEditing(null)} className="btn-ghost text-xs py-1.5 px-3">Cancelar</button>
                        <button onClick={() => handleUpdate(note.id)} disabled={saving} className="btn-psych text-xs py-1.5 px-3 flex items-center gap-1">
                          <Save size={12} /> {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Objetivos terapéuticos ────────────────────────────────
function TherapyGoals({ patientId }) {
  const [goals, setGoals] = useState([])
  const [newGoal, setNewGoal] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api.get(`/goals/${patientId}`)
      .then(({ data }) => setGoals(data.goals))
      .catch(console.error)
  }, [patientId])

  const handleAdd = async () => {
    if (!newGoal.trim()) return
    try {
      const { data } = await api.post(`/goals/${patientId}`, { text: newGoal })
      setGoals((prev) => [...prev, data.goal])
      setNewGoal(''); setAdding(false)
    } catch { alert('Error al crear objetivo.') }
  }

  const handleToggle = async (goalId) => {
    try {
      const { data } = await api.patch(`/goals/${goalId}/toggle`)
      setGoals((prev) => prev.map((g) => g.id === goalId ? data.goal : g))
    } catch {}
  }

  const handleDelete = async (goalId) => {
    try {
      await api.delete(`/goals/${goalId}`)
      setGoals((prev) => prev.filter((g) => g.id !== goalId))
    } catch {}
  }

  const done = goals.filter((g) => g.completed).length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-1.5">
          <Target size={14} /> Objetivos terapéuticos
          {goals.length > 0 && <span className="text-xs text-gray-400 font-normal ml-1">{done}/{goals.length}</span>}
        </h3>
        <button onClick={() => setAdding(!adding)} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
          <Plus size={12} /> Añadir
        </button>
      </div>

      {adding && (
        <div className="flex gap-2 mb-3 animate-slide-up">
          <input
            className="input-psych dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-1 text-sm"
            placeholder="Ej: Caminar 3 veces por semana"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <button onClick={handleAdd} className="btn-psych text-xs py-2 px-3">Añadir</button>
          <button onClick={() => setAdding(false)} className="btn-ghost text-xs py-2 px-2"><X size={14} /></button>
        </div>
      )}

      {goals.length === 0 && !adding && (
        <p className="text-gray-400 text-sm text-center py-3">Sin objetivos definidos.</p>
      )}

      <div className="space-y-2">
        {goals.map((g) => (
          <div key={g.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
            g.completed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
          }`}>
            <button onClick={() => handleToggle(g.id)} className="shrink-0">
              {g.completed
                ? <CheckCircle2 size={18} className="text-emerald-500" />
                : <Circle size={18} className="text-gray-300 hover:text-emerald-400 transition-colors" />
              }
            </button>
            <span className={`text-sm flex-1 ${g.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
              {g.text}
            </span>
            <button onClick={() => handleDelete(g.id)} className="shrink-0 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Vista principal PatientDetail ─────────────────────────
export default function PatientDetail() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [entries, setEntries] = useState([])
  const [insights, setInsights] = useState(null)
  const [filterTag, setFilterTag] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch paciente por ID directo para mayor robustez
        const [pRes, jRes, iRes] = await Promise.allSettled([
          api.get('/patients'),
          api.get(`/journal?patientId=${id}`),
          api.get(`/patients/${id}/insights`),
        ])

        if (pRes.status === 'fulfilled') {
          const p = pRes.value.data.patients.find((p) => p.id === id)
          setPatient(p || null)
        }
        if (jRes.status === 'fulfilled') {
          setEntries(jRes.value.data.entries || [])
        }
        if (iRes.status === 'fulfilled') {
          setInsights(iRes.value.data)
        } else {
          console.warn('Insights no disponibles:', iRes.reason?.message)
        }
      } catch (err) {
        console.error('Error cargando PatientDetail:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  let filtered = entries
  if (filterTag) filtered = filtered.filter((e) => e.tags?.includes(filterTag))

  if (loading) {
    return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card-psych h-24 bg-gray-100 dark:bg-gray-800" />)}</div>
  }

  if (!patient) return <div className="text-center py-20 text-gray-400">Paciente no encontrado.</div>

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/psych/patients" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
            {patient.hasAlert && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">⚠ Ánimo bajo</span>}
            {patient.hasInactivityAlert && <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Wifi size={10} /> {patient.daysSinceLastEntry}d sin registrar</span>}
          </div>
          <p className="text-gray-400 text-xs">{patient.totalEntries} entradas totales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Columna principal */}
        <div className="xl:col-span-2 space-y-5">
          {/* Ficha pre-sesión */}
          <PreSessionCard insights={insights} />

          {/* Gráfico */}
          <div className="card-psych dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-indigo-500" />
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Evolución del ánimo</span>
            </div>
            <MoodChart entries={entries} mode="psych" height={180} defaultDays={14} />
          </div>

          {/* Entradas con filtro */}
          <div className="card-psych dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={14} className="text-gray-400" />
              <select
                className="input-psych text-sm flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
              >
                <option value="">Todas las etiquetas</option>
                {AVAILABLE_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {filterTag && <button onClick={() => setFilterTag('')} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline">Limpiar</button>}
            </div>
            <p className="text-xs text-gray-400 mb-3">{filtered.length} entradas</p>

            <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
              {filtered.map((entry) => {
                const config = MOOD_ICONS[entry.moodScore]
                const open = expanded === entry.id
                return (
                  <div key={entry.id} className={`rounded-xl border transition-all cursor-pointer ${open ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3 p-3" onClick={() => setExpanded(open ? null : entry.id)}>
                      <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: config?.bg }}>
                        <MoodIcon score={entry.moodScore} size={14} />
                        <span className="text-[9px] font-bold" style={{ color: config?.color }}>{entry.moodScore}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold" style={{ color: config?.color }}>{config?.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate capitalize">{formatDate(entry.createdAt)}</p>
                        {!open && <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{entry.content}</p>}
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-[100px] justify-end shrink-0">
                        {entry.tags?.slice(0, 2).map((t) => <span key={t} className="text-[9px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 px-1.5 py-0.5 rounded-full">{t}</span>)}
                      </div>
                      {open ? <ChevronUp size={13} className="text-gray-400 shrink-0" /> : <ChevronDown size={13} className="text-gray-400 shrink-0" />}
                    </div>
                    {open && (
                      <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-2 animate-fade-in">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                        {entry.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{entry.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">
          {/* Objetivos */}
          <div className="card-psych dark:bg-gray-800">
            <TherapyGoals patientId={id} />
          </div>

          {/* Notas de sesión */}
          <div className="card-psych dark:bg-gray-800">
            <SessionNotes patientId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}
