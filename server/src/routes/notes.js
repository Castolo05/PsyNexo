import express from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate, requirePsychologist } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate, requirePsychologist)

// Verificar que el paciente pertenece al psicólogo autenticado
const verifyPatientOwnership = async (psychologistId, patientId) => {
  const patient = await prisma.user.findFirst({
    where: { id: patientId, psychologistId, role: 'PATIENT' },
  })
  return !!patient
}

// ── GET /api/notes/:patientId ──────────────────────────────
// Obtener nota clínica privada (o crear una vacía si no existe)
router.get('/:patientId', async (req, res) => {
  try {
    const owns = await verifyPatientOwnership(req.user.id, req.params.patientId)
    if (!owns) return res.status(403).json({ error: 'Acceso denegado.' })

    let note = await prisma.privateNote.findUnique({
      where: { psychologistId_patientId: { psychologistId: req.user.id, patientId: req.params.patientId } },
    })

    // Si no existe, devolver estructura vacía (no crear hasta que se guarde)
    if (!note) {
      note = { id: null, content: '', psychologistId: req.user.id, patientId: req.params.patientId }
    }

    res.json({ note })
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener nota.' })
  }
})

// ── PUT /api/notes/:patientId ─────────────────────────────
// Guardar/actualizar nota clínica privada (upsert)
router.put('/:patientId', async (req, res) => {
  try {
    const owns = await verifyPatientOwnership(req.user.id, req.params.patientId)
    if (!owns) return res.status(403).json({ error: 'Acceso denegado.' })

    const { content } = req.body
    if (content === undefined) return res.status(400).json({ error: 'content es requerido.' })

    const note = await prisma.privateNote.upsert({
      where: { psychologistId_patientId: { psychologistId: req.user.id, patientId: req.params.patientId } },
      update: { content },
      create: { psychologistId: req.user.id, patientId: req.params.patientId, content },
    })

    res.json({ note, message: 'Nota guardada.' })
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar nota.' })
  }
})

export default router
