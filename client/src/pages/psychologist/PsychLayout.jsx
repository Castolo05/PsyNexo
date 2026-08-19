import { useState, useEffect } from 'react'
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, LogOut, ChevronRight, Moon, Sun } from 'lucide-react'

export default function PsychLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('nexo_dark_psych') === 'true')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('nexo_dark_psych', darkMode)
  }, [darkMode])

  const navItems = [
    { to: '/psych', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/psych/patients', icon: <Users size={18} />, label: 'Mis Pacientes' },
  ]

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex transition-colors duration-300">
      {/* Sidebar — solo desktop */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-col py-6 px-4 shrink-0 hidden lg:flex transition-colors duration-300 sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <img src="/logo.png" alt="SOMA — Plataforma de bienestar mental" className="w-9 h-9 rounded-xl shadow-sm" />
          <span className="font-bold text-gray-900 dark:text-white text-lg">SOMA</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {icon}
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Código de invitación + controles */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
          {user?.inviteCode && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl px-3 py-2.5">
              <div className="text-xs text-indigo-400 font-medium">Código de invitación</div>
              <div className="font-mono font-bold text-indigo-700 dark:text-indigo-300 tracking-widest">{user.inviteCode}</div>
            </div>
          )}

          <div className="px-1">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>

          {/* Toggle modo oscuro */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        {/* Top bar móvil */}
        <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SOMA — Plataforma de bienestar mental" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="font-bold text-gray-800 dark:text-white">SOMA</span>
          </div>
          <div className="flex gap-1 items-center">
            {navItems.map(({ to, icon }) => (
              <Link
                key={to}
                to={to}
                className={`p-2 rounded-lg transition-colors ${
                  location.pathname === to
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {icon}
              </Link>
            ))}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
