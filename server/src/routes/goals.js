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

// ── GET /api/goals/:patientId ─────────────────────────────
router.get('/:patientId', async (req, res) => {
  try {
    const owns = await verifyOwnership(req.user.id, req.params.patientId)
    if (!owns) return res.status(403).json({ error: 'Acceso denegado.' })

    const goals = await prisma.therapyGoal.findMany({
      where: { psychologistId: req.user.id, patientId: req.params.patientId },
      orderBy: { createdAt: 'asc' },
    })

    res.json({ goals })
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener objetivos.' })
  }
})

// ── POST /api/goals/:patientId ────────────────────────────
router.post('/:patientId', async (req, res) => {
  try {
    const owns = await verifyOwnership(req.user.id, req.params.patientId)
    if (!owns) return res.status(403).json({ error: 'Acceso denegado.' })

    const { text } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'text es requerido.' })

    const goal = await prisma.therapyGoal.create({
      data: {
        psychologistId: req.user.id,
        patientId: req.params.patientId,
        text: text.trim(),
      },
    })

    res.status(201).json({ goal })
  } catch (err) {
    res.status(500).json({ error: 'Error al crear objetivo.' })
  }
})

// ── PATCH /api/goals/:goalId/toggle ──────────────────────
router.patch('/:goalId/toggle', async (req, res) => {
  try {
    const goal = await prisma.therapyGoal.findUnique({ where: { id: req.params.goalId } })
    if (!goal) return res.status(404).json({ error: 'Objetivo no encontrado.' })
    if (goal.psychologistId !== req.user.id) return res.status(403).json({ error: 'Acceso denegado.' })

    const updated = await prisma.therapyGoal.update({
      where: { id: req.params.goalId },
      data: { completed: !goal.completed },
    })

    res.json({ goal: updated })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar objetivo.' })
  }
})

// ── DELETE /api/goals/:goalId ─────────────────────────────
router.delete('/:goalId', async (req, res) => {
  try {
    const goal = await prisma.therapyGoal.findUnique({ where: { id: req.params.goalId } })
    if (!goal) return res.status(404).json({ error: 'Objetivo no encontrado.' })
    if (goal.psychologistId !== req.user.id) return res.status(403).json({ error: 'Acceso denegado.' })

    await prisma.therapyGoal.delete({ where: { id: req.params.goalId } })
    res.json({ message: 'Objetivo eliminado.' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar objetivo.' })
  }
})

export default router
