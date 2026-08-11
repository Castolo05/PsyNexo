import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import { UserRound, Link2, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PatientProfile() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkMsg, setLinkMsg] = useState('')
  const [linkError, setLinkError] = useState('')

  const handleLink = async (e) => {
    e.preventDefault()
    setLinkMsg('')
    setLinkError('')
    setLinkLoading(true)
    try {
      const { data } = await api.post('/auth/link', { inviteCode: code })
      setLinkMsg(data.message)
      updateUser(data.user)
      setCode('')
    } catch (err) {
      setLinkError(err.response?.data?.error || 'Error al vincular.')
    } finally {
      setLinkLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mi Perfil</h1>

      {/* Info del usuario */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 bg-sage-100 dark:bg-sage-900/30 rounded-2xl flex items-center justify-center">
          <UserRound size={28} className="text-sage-500" />
        </div>
        <div>
          <div className="font-bold text-gray-800 dark:text-white text-lg">{user?.name}</div>
          <div className="text-sm text-gray-400">{user?.email}</div>
          <div className="text-xs text-sage-500 font-semibold mt-0.5">Paciente</div>
        </div>
      </div>

      {/* Vinculación con psicólogo */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-1 flex items-center gap-2">
          <Link2 size={18} /> Vinculación con psicólogo
        </h2>
        {user?.psychologistId ? (
          <div className="bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-300 rounded-xl px-4 py-3 text-sm font-medium">
            ✅ Ya estás vinculado con tu psicólogo
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Ingresa el código que te proporcionó tu psicólogo para vincular tus cuentas.
            </p>
            <form onSubmit={handleLink} className="flex gap-2">
              <input
                type="text"
                className="input flex-1 uppercase tracking-widest font-mono"
                placeholder="Ej: A1B2C3D4"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <button type="submit" className="btn-patient px-4 py-3 shrink-0" disabled={linkLoading || !code}>
                {linkLoading ? '...' : 'Vincular'}
              </button>
            </form>
            {linkMsg && <p className="text-green-600 dark:text-green-400 text-sm mt-2">{linkMsg}</p>}
            {linkError && <p className="text-red-500 text-sm mt-2">{linkError}</p>}
          </>
        )}
      </div>

      {/* Cerrar sesión */}
      <button
        onClick={() => { logout(); navigate('/login') }}
        className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 font-semibold py-3 rounded-2xl border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </div>
  )
}
