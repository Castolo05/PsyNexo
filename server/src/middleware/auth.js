import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

// Middleware: verifica el JWT y adjunta el usuario al request
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autenticado. Token requerido.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, inviteCode: true, psychologistId: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Vuelve a iniciar sesión.' })
    }
    return res.status(401).json({ error: 'Token inválido.' })
  }
}

// Middleware: solo psicólogos
export const requirePsychologist = (req, res, next) => {
  if (req.user?.role !== 'PSYCHOLOGIST') {
    return res.status(403).json({ error: 'Acceso denegado. Solo para psicólogos.' })
  }
  next()
}

// Middleware: solo pacientes
export const requirePatient = (req, res, next) => {
  if (req.user?.role !== 'PATIENT') {
    return res.status(403).json({ error: 'Acceso denegado. Solo para pacientes.' })
  }
  next()
}
