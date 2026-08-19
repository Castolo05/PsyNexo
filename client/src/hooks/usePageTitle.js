import { useEffect } from 'react'

/**
 * Setea el título del documento para cada página.
 * @param {string} title - Título específico de la página (sin "SOMA")
 * @example usePageTitle('Iniciar sesión') → "Iniciar sesión — SOMA"
 */
export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — SOMA` : 'SOMA — Tu espacio seguro'
    return () => {
      document.title = prev
    }
  }, [title])
}
