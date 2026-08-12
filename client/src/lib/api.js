// ============================================================
// NexoMente — api.js (modo LOCAL / estático)
// Reemplaza axios. Interfaz compatible: devuelve Promises.
// ============================================================
import {
  authLogin, authRegister, authLink,
  journalList, journalCreate, journalUpdate, journalDelete,
  patientsList, patientInsights,
  appointmentsList, appointmentCreate, appointmentUpdate, appointmentDelete,
  sessionNotesList, sessionNoteCreate, sessionNoteUpdate, sessionNoteDelete,
  goalsList, goalCreate, goalToggle, goalDelete,
  habitsList, habitCreate, habitUpdate, habitDelete, habitCorrelation,
  initDb, userUpdate,
} from './localDb'

initDb()

function currentUser() {
  try { return JSON.parse(localStorage.getItem('nexo_user')) } catch { return null }
}

// Envuelve el resultado en una Promise resuelta (como axios)
function ok(data) { return Promise.resolve({ data }) }

// Crea un error con .response igual que axios y lo rechaza
function fail(message, status = 400) {
  const err = new Error(message)
  err.response = { status, data: { error: message } }
  return Promise.reject(err)
}

// Envuelve operaciones síncronas que pueden lanzar
async function run(fn) {
  try { return ok(await fn()) } catch (e) {
    return fail(e.message, e.status || 400)
  }
}

const api = {
  get: async (url) => {
    const user = currentUser()

    if (url.startsWith('/journal')) {
      const patientId = url.includes('patientId=') ? url.split('patientId=')[1] : null
      return ok({ entries: journalList(user?.id, user?.role, patientId) })
    }
    if (url === '/habits/correlation') {
      return ok(habitCorrelation(user?.id))
    }
    if (url === '/habits') {
      return ok({ habits: habitsList(user?.id) })
    }
    if (url === '/patients') {
      if (!user || user.role !== 'PSYCHOLOGIST') return fail('No autorizado', 403)
      return ok({ patients: patientsList(user.id) })
    }
    if (url.match(/^\/patients\/.+\/insights$/)) {
      const patientId = url.split('/')[2]
      return ok(patientInsights(user?.id, patientId))
    }
    if (url === '/appointments') {
      return ok({ appointments: appointmentsList(user?.id, user?.role) })
    }
    if (url.startsWith('/session-notes/')) {
      const patientId = url.split('/session-notes/')[1]
      return ok({ notes: sessionNotesList(patientId) })
    }
    if (url.startsWith('/goals/')) {
      const patientId = url.split('/goals/')[1]
      return ok({ goals: goalsList(patientId) })
    }
    return fail(`Ruta no encontrada: GET ${url}`, 404)
  },

  post: async (url, body) => {
    const user = currentUser()

    if (url === '/auth/login') {
      return run(() => authLogin(body.email, body.password))
    }
    if (url === '/auth/register') {
      return run(() => authRegister(body.name, body.email, body.password, body.role))
    }
    if (url === '/auth/link') {
      return run(() => authLink(user?.id, body.inviteCode))
    }
    if (url === '/journal') {
      return run(() => { const entry = journalCreate(user?.id, body); return { entry } })
    }
    if (url === '/habits') {
      return run(() => { const habit = habitCreate(user?.id, body); return { habit } })
    }
    if (url === '/appointments') {
      return ok({ appointment: appointmentCreate(user?.id, body) })
    }
    if (url.startsWith('/session-notes/')) {
      const patientId = url.split('/session-notes/')[1]
      return ok({ note: sessionNoteCreate(user?.id, patientId, body) })
    }
    if (url.startsWith('/goals/')) {
      const patientId = url.split('/goals/')[1]
      return ok({ goal: goalCreate(user?.id, patientId, body) })
    }
    return fail(`Ruta no encontrada: POST ${url}`, 404)
  },

  put: async (url, body) => {
    const user = currentUser()

    if (url === '/auth/user') {
      if (!user) return fail('No autorizado', 401)
      return run(() => {
        const updatedUser = userUpdate(user.id, body)
        return { user: updatedUser }
      })
    }

    if (url.startsWith('/habits/')) {
      const habitId = url.split('/habits/')[1]
      return run(() => { const habit = habitUpdate(user?.id, habitId, body); return { habit } })
    }
    if (url.startsWith('/journal/')) {
      const entryId = url.split('/journal/')[1]
      return run(() => { const entry = journalUpdate(user?.id, entryId, body); return { entry } })
    }
    if (url.startsWith('/appointments/')) {
      const apptId = url.split('/appointments/')[1]
      return ok({ appointment: appointmentUpdate(user?.id, apptId, body) })
    }
    if (url.startsWith('/session-notes/note/')) {
      const noteId = url.split('/session-notes/note/')[1]
      return run(() => { const note = sessionNoteUpdate(user?.id, noteId, body); return { note } })
    }
    return fail(`Ruta no encontrada: PUT ${url}`, 404)
  },

  patch: async (url) => {
    if (url.includes('/toggle')) {
      const goalId = url.split('/goals/')[1].replace('/toggle', '')
      return ok({ goal: goalToggle(goalId) })
    }
    return fail(`Ruta no encontrada: PATCH ${url}`, 404)
  },

  delete: async (url) => {
    const user = currentUser()

    if (url.startsWith('/journal/')) {
      journalDelete(user?.id, url.split('/journal/')[1])
      return ok({ ok: true })
    }
    if (url.startsWith('/appointments/')) {
      appointmentDelete(user?.id, url.split('/appointments/')[1])
      return ok({ ok: true })
    }
    if (url.startsWith('/session-notes/note/')) {
      sessionNoteDelete(user?.id, url.split('/session-notes/note/')[1])
      return ok({ ok: true })
    }
    if (url.startsWith('/habits/')) {
      habitDelete(user?.id, url.split('/habits/')[1])
      return ok({ ok: true })
    }
    if (url.startsWith('/goals/')) {
      goalDelete(url.split('/goals/')[1])
      return ok({ ok: true })
    }
    return fail(`Ruta no encontrada: DELETE ${url}`, 404)
  },
}

export default api
