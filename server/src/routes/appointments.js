import express from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate, requirePsychologist } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate)

// ── GET /api/appointments ─────────────────────────────────
// Psicólogo: sus citas. Paciente: sus citas agendadas.
router.get('/', async (req, res) => {
  try {
    const { year, month } = req.query

    if (req.user.role === 'PATIENT') {
      // El paciente solo ve sus próximas citas
      const now = new Date()
      const appointments = await prisma.appointment.findMany({
        where: {
          patientId: req.user.id,
          date: { gte: now },
        },
        orderBy: { date: 'asc' },
        take: 5,
        include: {
          psychologist: { select: { id: true, name: true } },
        },
      })
      return res.json({ appointments })
    }

    // Psicólogo
    if (req.user.role !== 'PSYCHOLOGIST') return res.status(403).json({ error: 'Acceso denegado.' })

    let where = { psychologistId: req.user.id }

    if (year && month) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1)
      const end = new Date(parseInt(year), parseInt(month), 1)
      where.date = { gte: start, lt: end }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        patient: { select: { id: true, name: true, email: true } },
      },
    })

    res.json({ appointments })
  } catch (err) {
    console.error('Error GET /appointments:', err)
    res.status(500).json({ error: 'Error al obtener citas.' })
  }
})

// ── POST /api/appointments ────────────────────────────────
// Crear una nueva cita
router.post('/', async (req, res) => {
  try {
    const { title, date, patientId, duration, notes } = req.body

    if (!title || !date) {
      return res.status(400).json({ error: 'title y date son requeridos.' })
    }

    // Si se especifica un paciente, verificar que pertenece al psicólogo
    if (patientId) {
      const patient = await prisma.user.findFirst({
        where: { id: patientId, psychologistId: req.user.id, role: 'PATIENT' },
      })
      if (!patient) {
        return res.status(403).json({ error: 'Paciente no encontrado en tu lista.' })
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        psychologistId: req.user.id,
        patientId: patientId || null,
        title,
        date: new Date(date),
        duration: duration ? parseInt(duration) : 50,
        notes: notes || '',
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    })

    res.status(201).json({ appointment })
  } catch (err) {
    console.error('Error POST /appointments:', err)
    res.status(500).json({ error: 'Error al crear cita.' })
  }
})

// ── DELETE /api/appointments/:id ──────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const appt = await prisma.appointment.findUnique({ where: { id: req.params.id } })
    if (!appt) return res.status(404).json({ error: 'Cita no encontrada.' })
    if (appt.psychologistId !== req.user.id) return res.status(403).json({ error: 'Acceso denegado.' })

    await prisma.appointment.delete({ where: { id: req.params.id } })
    res.json({ message: 'Cita eliminada.' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar cita.' })
  }
})

// ── PUT /api/appointments/:id ─────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const appt = await prisma.appointment.findUnique({ where: { id: req.params.id } })
    if (!appt) return res.status(404).json({ error: 'Cita no encontrada.' })
    if (appt.psychologistId !== req.user.id) return res.status(403).json({ error: 'Acceso denegado.' })

    const { title, date, notes, duration } = req.body
    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(date && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
        ...(duration && { duration: parseInt(duration) }),
      },
      include: { patient: { select: { id: true, name: true } } },
    })

    res.json({ appointment: updated })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cita.' })
  }
})

export default router
