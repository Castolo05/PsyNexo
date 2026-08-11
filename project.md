# Documento de Requisitos del Proyecto: "NexoMente" (MVP - Web App)

Actúa como un Desarrollador Full-Stack Senior y Diseñador UX/UI. Quiero que programes el MVP de una plataforma web bidireccional de salud mental, diseñada para conectar a psicólogos con sus pacientes entre sesiones. 

A continuación, te detallo el alcance ABSOLUTO del proyecto. Deberás basarte estrictamente en este documento para desarrollar la plataforma.

---

## 1. Identidad Visual y Estética (UI/UX)

La aplicación tiene dos interfaces distintas, ya que los contextos de uso son diferentes. Usa **TailwindCSS** para implementar estos estilos.

### A. Interfaz del Paciente (Mobile-First)
- **Vibe/Sensación:** Un espacio seguro, íntimo, relajante y libre de juicios. No debe parecer una app clínica o de hospital.
- **Paleta de Colores:** Tonos pastel relajantes.
  - *Fondo:* Blanco hueso o crema muy claro (`#FAFAFA` o `#F3F4F6`).
  - *Acentos:* Verde salvia (`#8FBC8F`), Azul lavanda o celeste pastel. 
  - *Modo Oscuro (Crucial):* Muchos pacientes escriben de noche o con insomnio. Debe tener un modo oscuro con grises profundos (no negro puro).
- **Tipografía:** Sans-serif redondeada y amigable (ej. *Nunito*, *Inter* o *Quicksand*). Textos grandes y legibles.
- **Botones:** Bordes redondeados (`rounded-xl` o `rounded-full`), sombras suaves.

### B. Interfaz del Psicólogo (Orientada a Desktop/Tablet)
- **Vibe/Sensación:** Profesional, analítica, limpia y enfocada en la productividad y lectura de datos.
- **Paleta de Colores:** Estilo "Dashboard" SaaS.
  - *Fondo:* Blanco y grises claros (`#F8FAFC`).
  - *Acentos:* Azul marino o índigo profesional (`#4F46E5`) para botones primarios.
  - *Gráficos:* Semáforo de colores para el estado de ánimo (Rojo para nivel 1, Amarillo para nivel 3, Verde para nivel 5).
- **Tipografía:** Sans-serif neutra (ej. *Roboto* o *Inter*).
- **Estructura:** Menú lateral (Sidebar) para navegación, tarjetas (cards) blancas con sombras sutiles para delimitar la información de los pacientes.

---

## 2. Funcionalidades Exhaustivas (Historias de Usuario)

### ¿Qué puede hacer el PACIENTE?
1. **Gestión de Cuenta:** Registrarse, iniciar sesión, recuperar contraseña.
2. **Vinculación:** Ingresar un "Código de Invitación" proporcionado por su psicólogo para vincular sus cuentas.
3. **Dashboard Principal:** Ver un saludo personalizado y un resumen de su semana (cuántos días registró).
4. **Crear Entrada de Diario (El Core):**
   - Seleccionar "Estado de Ánimo" (Escala del 1 al 5 usando Emojis: 😭, ☹️, 😐, 🙂, 😄).
   - Escribir texto libre sobre su día (sin límite de caracteres).
   - Seleccionar "Etiquetas/Tags" predefinidas (Ej: *Ansiedad, Discusión, Insomnio, Logro, Medicación, Ejercicio*).
5. **Historial:** Ver un calendario o lista con todas sus entradas pasadas. Solo puede leerlas y editarlas/eliminarlas dentro de las primeras 24 horas (para mantener la integridad del registro).
6. **Botón de Emergencia/Crisis:** Un botón estático siempre visible (quizás en el perfil) con un descargo de responsabilidad ("Esta app no es para crisis") y líneas telefónicas de prevención del suicidio o emergencias locales.

### ¿Qué puede hacer el PSICÓLOGO?
1. **Gestión de Cuenta:** Registrarse (como profesional), iniciar sesión.
2. **Gestión de Pacientes:** Generar un código único/link para invitar a un paciente a unirse a su lista.
3. **Dashboard Principal:** Ver una lista de todos sus pacientes activos. Ver una alerta visual si un paciente registró niveles de ánimo muy bajos (1 o 2) consecutivamente en los últimos días.
4. **Perfil del Paciente (Vista de Análisis):**
   - **Gráficos:** Ver un gráfico de líneas (usando Recharts) con las fluctuaciones del estado de ánimo de los últimos 7, 14 o 30 días.
   - **Filtros:** Filtrar las entradas del paciente por etiqueta (ej. "Mostrar solo días con Insomnio") o por estado de ánimo.
   - **Lectura:** Leer el texto completo de los diarios del paciente, ordenados del más reciente al más antiguo.
5. **Notas Clínicas Privadas:** Un espacio de texto junto al perfil del paciente donde el psicólogo anota qué temas tratar en la próxima sesión. El paciente NUNCA ve esto.

---

## 3. Stack Tecnológico Estricto
- **Frontend:** React.js (Vite), TailwindCSS, React Router DOM, Recharts (gráficos), Lucide React (iconos).
- **Backend:** Node.js con Express.js.
- **Base de Datos:** PostgreSQL (usando Prisma ORM) o MongoDB (Mongoose). Elige la mejor para iterar rápido.
- **Autenticación:** JWT (JSON Web Tokens) guardados en HttpOnly Cookies o LocalStorage.

---

## 4. Esquema de Base de Datos (Entidades Centrales)

1. **User (Usuario)**
   - `id`, `name`, `email`, `passwordHash`, `role` (Enum: PATIENT, PSYCHOLOGIST).
   - `psychologistId` (FK - Solo pacientes lo tienen lleno).
   - `inviteCode` (String - Solo psicólogos lo tienen, para invitar pacientes).

2. **JournalEntry (Entrada de Diario)**
   - `id`, `patientId` (FK), `createdAt`, `moodScore` (1-5), `content` (Text), `tags` (Array de strings).

3. **PrivateNote (Nota del Psicólogo)**
   - `id`, `psychologistId` (FK), `patientId` (FK), `content` (Text), `updatedAt`.

---

## 5. Protocolo de Trabajo (Roadmap de Ejecución)

Vamos a desarrollar esto de forma estrictamente iterativa. **Prohibido escribir todo el código de una sola vez.** 

Te guiarás por estas fases, y **solo avanzarás a la siguiente fase cuando yo te diga "Continuemos con la Fase X".**

*   **FASE 1: Setup y Base de Datos.** (Inicialización de Node, conexión a BD, Modelos/Schemas completos).
*   **FASE 2: API de Autenticación y Usuarios.** (Rutas de registro, login, generación de tokens, vinculación psicólogo-paciente mediante código).
*   **FASE 3: API de Diarios y Notas.** (Endpoints de CRUD para JournalEntry y PrivateNote con validación de roles).
*   **FASE 4: Setup de Frontend y Layouts.** (Inicialización de Vite, Tailwind, enrutador, navbar/sidebar, y pantallas de login/registro).
*   **FASE 5: Interfaz del Paciente.** (Dashboard mobile-first, formulario de creación de diario, vista de historial).
*   **FASE 6: Interfaz del Psicólogo.** (Lista de pacientes, panel analítico con gráficos Recharts, filtros, bloc de notas privado).
*   **FASE 7: Integración y Pulido.** (Conexión Front-Back, manejo de errores, loaders, detalles estéticos finales).

Para comenzar ahora mismo: Entiende los requerimientos estéticos y funcionales, y **ejecuta únicamente la FASE 1**. Entrégame las instrucciones de instalación del servidor y los modelos de la base de datos.