import express from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate, requirePsychologist } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate, requirePsychologist)

const verifyOwnership = async (psychologistId, patientId) => {
  const p = await prisma.user.findFirst({
    where: { id: patientId, psychologistId, role: 'PATIENT' },
  })
  return !!p
}

// ── GET /api/session-notes/:patientId ─────────────────────
router.get('/:patientId', async (req, res) => {
  try {
    const owns = await verifyOwnership(req.user.id, req.params.patientId)
    if (!owns) return res.status(403).json({ error: 'Acceso denegado.' })

    const notes = await prisma.sessionNote.findMany({
      where: { psychologistId: req.user.id, patientId: req.params.patientId },
      orderBy: { sessionDate: 'desc' },
    })

    res.json({ notes })
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notas de sesión.' })
  }
})

// ── POST /api/session-notes/:patientId ────────────────────
router.post('/:patientId', async (req, res) => {
  try {
    const owns = await verifyOwnership(req.user.id, req.params.patientId)
    if (!owns) return res.status(403).json({ error: 'Acceso denegado.' })

    const { title, content, sessionDate } = req.body
    if (content === undefined) return res.status(400).json({ error: 'content es requerido.' })

    const note = await prisma.sessionNote.create({
      data: {
        psychologistId: req.user.id,
        patientId: req.params.patientId,
        title: title || '',
        content: content || '',
        sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
      },
    })

    res.status(201).json({ note })
  } catch (err) {
    res.status(500).json({ error: 'Error al crear nota.' })
  }
})

// ── PUT /api/session-notes/note/:noteId ───────────────────
router.put('/note/:noteId', async (req, res) => {
  try {
    const note = await prisma.sessionNote.findUnique({ where: { id: req.params.noteId } })
    if (!note) return res.status(404).json({ error: 'Nota no encontrada.' })
    if (note.psychologistId !== req.user.id) return res.status(403).json({ error: 'Acceso denegado.' })

    const { title, content, sessionDate } = req.body
    const updated = await prisma.sessionNote.update({
      where: { id: req.params.noteId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(sessionDate && { sessionDate: new Date(sessionDate) }),
      },
    })

    res.json({ note: updated })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar nota.' })
  }
})

// ── DELETE /api/session-notes/note/:noteId ────────────────
router.delete('/note/:noteId', async (req, res) => {
  try {
    const note = await prisma.sessionNote.findUnique({ where: { id: req.params.noteId } })
    if (!note) return res.status(404).json({ error: 'Nota no encontrada.' })
    if (note.psychologistId !== req.user.id) return res.status(403).json({ error: 'Acceso denegado.' })

    await prisma.sessionNote.delete({ where: { id: req.params.noteId } })
    res.json({ message: 'Nota eliminada.' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar nota.' })
  }
})

export default router
