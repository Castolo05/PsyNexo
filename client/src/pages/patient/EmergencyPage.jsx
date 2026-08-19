import { Phone, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle'

const LINES = [
  { country: '🇦🇷 Argentina', name: 'Centro de Asistencia al Suicida', number: '135', free: true },
  { country: '🇲🇽 México', name: 'SAPTEL', number: '55 5259-8121', free: true },
  { country: '🇨🇱 Chile', name: 'Salud Responde', number: '600 360 7777', free: true },
  { country: '🇪🇸 España', name: 'Teléfono de la Esperanza', number: '717 003 717', free: false },
  { country: '🌍 Internacional', name: 'Befrienders Worldwide', number: 'befrienders.org', free: true, isUrl: true },
]

export default function EmergencyPage() {
  usePageTitle('Ayuda de emergencia')
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Aviso importante */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={22} />
          <div>
            <h1 className="font-bold text-red-700 dark:text-red-400 text-lg">Aviso importante</h1>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1 leading-relaxed">
              <strong>SOMA no es un servicio de crisis ni emergencias.</strong> Si estás en peligro inmediato o experimentas pensamientos de hacerte daño, por favor comunícate con una línea de crisis o llama a emergencias (911).
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Líneas de ayuda</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Profesionales disponibles para escucharte, ahora mismo.</p>
      </div>

      <div className="space-y-3">
        {LINES.map(({ country, name, number, free, isUrl }) => (
          <div key={name} className="card flex items-center gap-4">
            <div className="w-11 h-11 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Phone size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 font-medium">{country}</div>
              <div className="font-semibold text-gray-800 dark:text-white text-sm">{name}</div>
              {isUrl ? (
                <a href={`https://${number}`} target="_blank" rel="noreferrer" className="text-red-500 font-bold text-sm hover:underline">
                  {number}
                </a>
              ) : (
                <a href={`tel:${number}`} className="text-red-500 font-bold text-sm hover:underline">
                  📞 {number}
                </a>
              )}
            </div>
            {free && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Gratis</span>}
          </div>
        ))}
      </div>

      <Link to="/patient" className="block text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        ← Volver al inicio
      </Link>
    </div>
  )
}
