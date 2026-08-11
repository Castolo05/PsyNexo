# 🧠 NexoMente — MVP Local

Plataforma de bienestar mental bidireccional: conecta psicólogos con sus pacientes entre sesiones.

**Stack:** React + Vite + TailwindCSS | Node.js + Express + Prisma + SQLite

---

## 🚀 Cómo levantar el proyecto (3 comandos)

```bash
# 1. Instalar todas las dependencias + crear la base de datos SQLite + seed
npm run setup

# 2. Instalar concurrently en la raíz
npm install

# 3. Levantar servidor y cliente al mismo tiempo
npm run dev
```

Abre http://localhost:5173 en el navegador.

### Alternativa: dos terminales (si falla npm install en la raíz)

**Terminal 1 — Backend:**
```bash
cd server && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
```

---

## 🔐 Credenciales de prueba (cargadas automáticamente)

| Rol | Email | Contraseña |
|---|---|---|
| 🩺 Psicólogo | laura@nexomente.com | psicologo123 |
| 👤 Paciente | carlos@nexomente.com | paciente123 |

---

## 📁 Estructura del proyecto

```
nexomente/
├── package.json          ← raíz (dev + setup)
├── server/               ← Backend Express + Prisma + SQLite
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── dev.db        ← (se crea automáticamente)
│   ├── src/
│   │   ├── index.js
│   │   ├── lib/          ← prisma, tags
│   │   ├── middleware/   ← JWT auth
│   │   └── routes/       ← auth, journal, notes, patients
│   └── .env
└── client/               ← Frontend React + Vite + TailwindCSS
    └── src/
        ├── pages/
        │   ├── auth/     ← Login, Register
        │   ├── patient/  ← Dashboard, NewEntry, History, Profile, Emergency
        │   └── psychologist/ ← Dashboard, PatientsList, PatientDetail
        ├── context/      ← AuthContext
        └── lib/          ← api.js, constants.js
```

---

## 🛠️ Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run setup` | Instala todo + crea BD + seed (solo la primera vez) |
| `npm run dev` | Levanta server (3001) + client (5173) simultáneamente |
| `npm run db:studio` | Abre Prisma Studio (GUI de la base de datos) |

---

## ⚡ Funcionalidades implementadas

### 👤 Interfaz del Paciente
- Login / Registro
- Dashboard con saludo personalizado y resumen semanal
- Crear entrada de diario (emoji de ánimo + texto + tags)
- Historial con entradas colapsables (editar/eliminar solo 24h)
- Vinculación con psicólogo mediante código
- Modo oscuro
- Página de emergencia con líneas de crisis

### 🩺 Interfaz del Psicólogo
- Dashboard con lista de pacientes y alertas de ánimo bajo
- Código de invitación visible (con botón copiar)
- Lista de pacientes con buscador
- Vista de paciente: gráfico Recharts (7/14/30 días)
- Filtros por tag y ánimo
- Notas clínicas privadas (invisible para el paciente)

---

## ❌ No necesitas instalar

- PostgreSQL ✅ (usa SQLite en archivo local)
- Docker ✅
- Redis ✅
- Ningún servicio cloud ✅
