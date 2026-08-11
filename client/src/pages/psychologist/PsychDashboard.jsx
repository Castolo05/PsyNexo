import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import { MOOD_ICONS, formatDateShort } from '../../lib/constants'
import MoodIcon from '../../components/MoodIcon'
import AppointmentCalendar from '../../components/AppointmentCalendar'
import { AlertTriangle, Users, ChevronRight, Copy, Check, CalendarDays } from 'lucide-react'

export default function PsychDashboard() {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('patients') // 'patients' | 'agenda'

  useEffect(() => {
    api.get('/patients')
      .then(({ data }) => setPatients(data.patients))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const copyCode = () => {
    navigator.clipboard.writeText(user?.inviteCode || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const alerts = patients.filter((p) => p.hasAlert)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Buen día, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} activo{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
        {user?.inviteCode && (
          <button
            onClick={copyCode}
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 rounded-xl px-4 py-2.5 transition-all"
          >
            <div>
              <div className="text-xs text-indigo-400 font-medium text-left">Tu código</div>
              <div className="font-mono font-bold text-indigo-700 dark:text-indigo-300 tracking-widest text-sm">{user.inviteCode}</div>
            </div>
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-indigo-400" />}
          </button>
        )}
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold mb-3">
            <AlertTriangle size={18} />
            {alerts.length} paciente{alerts.length > 1 ? 's' : ''} con ánimo bajo consecutivo
          </div>
          <div className="space-y-2">
            {alerts.map((p) => (
              <Link
                key={p.id}
                to={`/psych/patients/${p.id}`}
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-4 py-2.5 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <MoodIcon score={p.lastMood} size={18} />
                  <span className="font-medium text-gray-800 dark:text-white">{p.name}</span>
                </div>
                <ChevronRight size={16} className="text-red-400" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tabs: Pacientes / Mi Agenda */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        <button
          onClick={() => setTab('patients')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            tab === 'patients'
              ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Users size={16} /> Mis Pacientes
        </button>
        <button
          onClick={() => setTab('agenda')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            tab === 'agenda'
              ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <CalendarDays size={16} /> Mi Agenda
        </button>
      </div>

      {/* Contenido del tab */}
      {tab === 'patients' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <Users size={16} /> Pacientes activos
            </h2>
            <Link to="/psych/patients" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-psych h-16 bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="card-psych dark:bg-gray-800 text-center py-10">
              <Users size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Sin pacientes vinculados</p>
              <p className="text-gray-400 text-sm mt-1">Comparte tu código de invitación para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {patients.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  to={`/psych/patients/${p.id}`}
                  className="card-psych dark:bg-gray-800 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      {p.name}
                      {p.hasAlert && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                          ⚠ Alerta
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span>{p.totalEntries} entradas</span>
                      {p.lastEntryDate && <span>· Último: {formatDateShort(p.lastEntryDate)}</span>}
                    </div>
                  </div>
                  {p.lastMood && <MoodIcon score={p.lastMood} size={20} />}
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'agenda' && (
        <div className="animate-fade-in">
          <AppointmentCalendar patients={patients} />
        </div>
      )}
    </div>
  )
}
