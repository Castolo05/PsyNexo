import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// El formulario de nota diaria ahora vive en el Dashboard (inicio).
// Esta ruta redirige allí para mantener compatibilidad con navegación previa.
export default function NewEntryPage() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/patient', { replace: true }) }, [navigate])
  return null
}
