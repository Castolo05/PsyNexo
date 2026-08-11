import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { formatDateShort } from '../../lib/constants'
import MoodIcon from '../../components/MoodIcon'
import { ChevronRight, AlertTriangle, Search } from 'lucide-react'

export default function PatientsList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/patients')
      .then(({ data }) => setPatients(data.patients))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Pacientes</h1>
        <p className="text-gray-400 text-sm mt-0.5">{patients.length} paciente{patients.length !== 1 ? 's' : ''} vinculado{patients.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="input-psych pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="card-psych h-20 bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-psych dark:bg-gray-800 text-center py-12">
          <p className="text-gray-400 text-sm">
            {search ? 'No se encontraron pacientes.' : 'Sin pacientes vinculados aún.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/psych/patients/${p.id}`}
              className="card-psych dark:bg-gray-800 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 text-lg shrink-0">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  {p.name}
                  {p.hasAlert && (
                    <span className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                      <AlertTriangle size={10} /> Alerta
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 truncate">{p.email}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {p.totalEntries} entradas
                  {p.lastEntryDate && ` · Última: ${formatDateShort(p.lastEntryDate)}`}
                </div>
              </div>
              {p.lastMood && <MoodIcon score={p.lastMood} size={22} />}
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
