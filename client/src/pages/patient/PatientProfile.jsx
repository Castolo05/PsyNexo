import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import {
  UserRound, Link2, LogOut, Plus, Pencil, Trash2, Check, X, CheckCircle2,
  Phone, Camera, Cat, Dog, Rabbit, Bird, Snail, Turtle, Fish, Rat
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { HABIT_ICONS } from '../../lib/constants'

// Mapeo de animalitos para el avatar
const ANIMAL_ICONS = {
  Cat, Dog, Rabbit, Bird, Snail, Turtle, Fish, Rat
}

// Componente para renderizar el avatar
export function AvatarDisplay({ avatar, size = 28, className = "" }) {
  if (!avatar) return <UserRound size={size} className={className} />
  if (avatar.startsWith('data:image')) {
    return <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
  }
  if (avatar.startsWith('icon:')) {
    const iconName = avatar.split(':')[1]
    const IconComp = ANIMAL_ICONS[iconName] || UserRound
    return <IconComp size={size} className={className} />
  }
  return <UserRound size={size} className={className} />
}

export default function PatientProfile() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkMsg, setLinkMsg] = useState('')
  const [linkError, setLinkError] = useState('')

  // Edición de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const fileInputRef = useRef(null)

  // Hábitos
  const [habits, setHabits] = useState([])
  const [newText, setNewText] = useState('')
  const [newIcon, setNewIcon] = useState('CheckCircle')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editIcon, setEditIcon] = useState('')

  useEffect(() => {
    api.get('/habits').then(({ data }) => setHabits(data.habits)).catch(console.error)
  }, [])

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

  // Guardar perfil
  const handleSaveProfile = async () => {
    setProfileSaving(true)
    try {
      const { data } = await api.put('/auth/user', {
        name: editName,
        email: editEmail,
        password: editPassword || undefined,
        avatar: editAvatar
      })
      updateUser(data.user)
      setIsEditingProfile(false)
      setEditPassword('')
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar perfil')
    } finally {
      setProfileSaving(false)
    }
  }

  const openProfileEditor = () => {
    setEditName(user?.name || '')
    setEditEmail(user?.email || '')
    setEditAvatar(user?.avatar || '')
    setIsEditingProfile(true)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setEditAvatar(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleAddHabit = async () => {
    if (!newText.trim()) return
    try {
      const { data } = await api.post('/habits', { text: newText.trim(), icon: newIcon })
      setHabits(prev => [...prev, data.habit])
      setNewText('')
      setNewIcon('CheckCircle')
      setAdding(false)
    } catch { alert('Error al crear hábito.') }
  }

  const handleSaveEditHabit = async (id) => {
    try {
      const { data } = await api.put(`/habits/${id}`, { text: editText, icon: editIcon })
      setHabits(prev => prev.map(h => h.id === id ? data.habit : h))
      setEditingId(null)
    } catch { alert('Error al guardar.') }
  }

  const handleDeleteHabit = async (id) => {
    if (!confirm('¿Eliminar este hábito? Se quitará de las notas existentes.')) return
    try {
      await api.delete(`/habits/${id}`)
      setHabits(prev => prev.filter(h => h.id !== id))
    } catch { alert('Error al eliminar.') }
  }

  const IconSelector = ({ value, onChange }) => (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-sage-200">
      {Object.keys(HABIT_ICONS).map(iconName => {
        const Icon = HABIT_ICONS[iconName]
        return (
          <button
            key={iconName}
            onClick={() => onChange(iconName)}
            className={`p-2 rounded-xl shrink-0 transition-colors ${
              value === iconName
                ? 'bg-sage-400 text-white shadow-sm'
                : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-sage-50 dark:hover:bg-gray-600'
            }`}
          >
            <Icon size={18} />
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mi Perfil</h1>
        <Link
          to="/patient/emergency"
          className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold px-4 py-2 rounded-2xl transition-all shadow-sm"
        >
          <Phone size={16} />
          SOS
        </Link>
      </div>

      {/* Info del usuario o Edición */}
      {isEditingProfile ? (
        <div className="card space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-800 dark:text-white text-lg">Editar Perfil</h2>
            <button onClick={() => setIsEditingProfile(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          {/* Selector de Avatar */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Foto de Perfil</label>
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-sage-50 dark:bg-sage-900/30 rounded-full flex items-center justify-center overflow-hidden border-2 border-sage-200 dark:border-sage-800">
                <AvatarDisplay avatar={editAvatar} size={36} className="text-sage-500" />
              </div>
              <div className="flex gap-2">
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1">
                  <Camera size={14} /> Subir foto
                </button>
                <button onClick={() => setEditAvatar('')} className="btn-ghost text-xs py-1.5 px-3 text-red-500 hover:text-red-600">
                  Eliminar
                </button>
              </div>
            </div>
            
            <p className="text-xs text-center text-gray-400 mt-2">O elige un animalito:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.keys(ANIMAL_ICONS).map(name => {
                const AnimalIcon = ANIMAL_ICONS[name]
                const isActive = editAvatar === `icon:${name}`
                return (
                  <button
                    key={name}
                    onClick={() => setEditAvatar(`icon:${name}`)}
                    className={`p-2.5 rounded-xl transition-all ${
                      isActive ? 'bg-sage-400 text-white shadow-md scale-110' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <AnimalIcon size={20} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-peach-100 dark:border-gray-700">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
              <input className="input" value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <input className="input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nueva Contraseña (opcional)</label>
              <input className="input" type="password" placeholder="Dejar en blanco para no cambiar" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
            </div>
          </div>

          <button onClick={handleSaveProfile} disabled={profileSaving || !editName || !editEmail} className="btn-patient w-full mt-4">
            {profileSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      ) : (
        <div 
          onClick={openProfileEditor}
          className="card flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-sage-300 dark:hover:border-sage-700 transition-all group"
        >
          <div className="w-16 h-16 bg-sage-100 dark:bg-sage-900/30 rounded-full flex items-center justify-center overflow-hidden border border-sage-200 dark:border-sage-800">
            <AvatarDisplay avatar={user?.avatar} size={32} className="text-sage-500" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-800 dark:text-white text-lg group-hover:text-sage-600 transition-colors">{user?.name}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
            <div className="text-xs text-sage-500 font-semibold mt-0.5">Toca para editar perfil</div>
          </div>
        </div>
      )}

      {/* Gestión de hábitos */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Mis hábitos diarios</h2>
          <button
            onClick={() => setAdding(!adding)}
            className="flex items-center gap-1.5 text-sm font-semibold text-sage-600 dark:text-sage-400 hover:underline"
          >
            <Plus size={15} /> Añadir
          </button>
        </div>

        {/* Formulario nuevo hábito */}
        {adding && (
          <div className="bg-sage-50 dark:bg-sage-900/20 rounded-3xl p-4 space-y-3 animate-fade-in border border-sage-200 dark:border-sage-800">
            <IconSelector value={newIcon} onChange={setNewIcon} />
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Ej: Meditar 5 minutos"
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddHabit} disabled={!newText.trim()} className="btn-patient text-sm flex-1">
                Guardar hábito
              </button>
              <button onClick={() => setAdding(false)} className="btn-ghost text-sm rounded-full">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Lista de hábitos */}
        {habits.length === 0 && !adding && (
          <p className="text-sm text-gray-400 text-center py-4">
            Sin hábitos configurados. ¡Añadí el primero!
          </p>
        )}
        <div className="space-y-2">
          {habits.map(habit => {
            const IconComponent = HABIT_ICONS[habit.icon] || HABIT_ICONS.CheckCircle
            
            return (
              <div key={habit.id} className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-4 py-3 border border-transparent hover:border-gray-200 transition-colors">
                {editingId === habit.id ? (
                  <>
                    <IconSelector value={editIcon} onChange={setEditIcon} />
                    <div className="flex items-center gap-2">
                      <input
                        className="input flex-1 py-1.5 text-sm"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveEditHabit(habit.id)}
                      />
                      <button onClick={() => handleSaveEditHabit(habit.id)} className="p-2 text-sage-500 hover:bg-sage-50 dark:hover:bg-sage-900/20 rounded-xl">
                        <Check size={18} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                        <X size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sage-500 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-peach-100 dark:border-gray-600">
                      <IconComponent size={20} />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200">{habit.text}</span>
                    <button
                      onClick={() => { setEditingId(habit.id); setEditText(habit.text); setEditIcon(habit.icon) }}
                      className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Vinculación con psicólogo */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
          <Link2 size={18} /> Vinculación con psicólogo
        </h2>
        {user?.psychologistId ? (
          <div className="bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-800 text-sage-700 dark:text-sage-300 rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 size={18} className="text-sage-500" /> Ya estás vinculado con tu psicólogo
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Ingresa el código que te proporcionó tu psicólogo para vincular tus cuentas.
            </p>
            <form onSubmit={handleLink} className="flex gap-2">
              <input
                type="text"
                className="input flex-1 uppercase tracking-widest font-mono text-center"
                placeholder="Ej: A1B2C3D4"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <button type="submit" className="btn-patient px-5 shrink-0" disabled={linkLoading || !code}>
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
        className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 font-bold py-3.5 rounded-[20px] border-2 border-red-100 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </div>
  )
}
