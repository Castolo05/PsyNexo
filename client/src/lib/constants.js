// NexoMente — Constantes globales (escala 1-10 con iconos Lucide)

// MOOD_ICONS: mapa de puntaje 1-10 → configuración visual
// Los iconos son nombres de componentes de lucide-react
// Se renderizan con el componente <MoodIcon score={n} />
export const MOOD_ICONS = {
  1:  { icon: 'CloudLightning', label: 'Terrible',    color: '#dc2626', bg: '#fef2f2', darkBg: '#450a0a' },
  2:  { icon: 'CloudRain',      label: 'Muy mal',     color: '#ea580c', bg: '#fff7ed', darkBg: '#431407' },
  3:  { icon: 'Cloud',          label: 'Mal',         color: '#d97706', bg: '#fffbeb', darkBg: '#451a03' },
  4:  { icon: 'Wind',           label: 'Regular',     color: '#ca8a04', bg: '#fefce8', darkBg: '#422006' },
  5:  { icon: 'Minus',          label: 'Neutro',      color: '#65a30d', bg: '#f7fee7', darkBg: '#1a2e05' },
  6:  { icon: 'CloudSun',       label: 'Bien',        color: '#16a34a', bg: '#f0fdf4', darkBg: '#052e16' },
  7:  { icon: 'Sun',            label: 'Bastante bien', color: '#059669', bg: '#ecfdf5', darkBg: '#022c22' },
  8:  { icon: 'Sparkles',       label: 'Muy bien',    color: '#0d9488', bg: '#f0fdfa', darkBg: '#042f2e' },
  9:  { icon: 'Star',           label: 'Excelente',   color: '#4f46e5', bg: '#eef2ff', darkBg: '#1e1b4b' },
  10: { icon: 'Zap',            label: 'Perfecto',    color: '#7c3aed', bg: '#faf5ff', darkBg: '#2e1065' },
}

// Color semáforo para gráficos (Recharts dot color)
export const MOOD_CHART_COLOR = (score) => {
  if (score <= 2) return '#dc2626'
  if (score <= 4) return '#d97706'
  if (score <= 6) return '#16a34a'
  if (score <= 8) return '#0d9488'
  return '#7c3aed'
}

export const AVAILABLE_TAGS = [
  'Ansiedad', 'Discusión', 'Insomnio', 'Logro',
  'Medicación', 'Ejercicio', 'Tristeza', 'Gratitud',
  'Trabajo', 'Familia', 'Pareja', 'Soledad',
]

export const MOOD_SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Helpers de fecha
export const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export const formatDateShort = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

export const formatTime = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export const isSameDay = (a, b) => {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
}

export const isEditable = (createdAt) => {
  const hours = (Date.now() - new Date(createdAt).getTime()) / 3600000
  return hours <= 24
}

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
