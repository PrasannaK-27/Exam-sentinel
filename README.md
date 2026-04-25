# 🛡️ ExamSentinel — Smart Online Exam Monitoring System

A full-stack proctored exam platform with real-time violation detection, live webcam monitoring, role-based dashboards, and Socket.IO-powered alerts.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MySQL + Sequelize ORM |
| Sessions | express-session + express-mysql-session |
| Real-time | Socket.IO |
| Media | WebRTC (getUserMedia) |
| Email | Nodemailer (Gmail SMTP) |
| Security | helmet, cors, express-rate-limit, bcrypt |

---

## 📋 Prerequisites

- Node.js v18+
- MySQL 8.0+
- Gmail account with App Password enabled
---

## 🚀 Setup Instructions

### Step 1 — Create MySQL Database

**Option A — Manual (recommended for first-time setup):**

Run the full schema file in your MySQL client:

```bash
mysql -u root -p < c:\AuntyGravity\examsentinel\schema.sql
```

This creates the `examsentinel_db` database and all 9 tables:

| Table | Purpose |
|---|---|
| `Users` | Accounts with roles (ADMIN / STUDENT / QUESTION_MANAGER) |
| `Exams` | Exam definitions (title, duration) |
| `Exam_Enrollments` | Student ↔ Exam many-to-many |
| `Questions` | MCQ questions per exam |
| `Student_Responses` | Saved answers per student per question |
| `Exam_Sessions` | Per-student exam timing & violation count |
| `Results` | Final scores after submission |
| `Activity_Logs` | Detailed violation audit trail |
| `sessions` | Express session storage (MySQL-backed) |

**Option B — Auto-create via Sequelize:**

```sql
-- Just create the database — Sequelize will create all tables on first run
CREATE DATABASE examsentinel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Sequelize runs `sync({ alter: true })` on startup which creates / alters all tables automatically.

---

### Step 2 — Configure Backend Environment

Copy the env template and fill in your values:

```
cd c:\AuntyGravity\examsentinel\backend
copy .env .env.backup   (optional)
```

Edit `backend\.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=examsentinel_db

SESSION_SECRET=change_this_to_a_long_random_string

GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate a 16-character password.


### Step 3 — Configure Frontend Environment

Edit `frontend\.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

### Step 4 — Start the Backend

```bash
cd c:\AuntyGravity\examsentinel\backend
npm install        # if not done already
npm run dev        # starts with nodemon on port 5000
```

You should see:
```
✅ MySQL connected
✅ Database synced
🚀 Server running on http://localhost:5000
```

---

### Step 5 — Start the Frontend

```bash
cd c:\AuntyGravity\examsentinel\frontend
npm run dev        # starts Vite on port 5173
```

Open: **http://localhost:5173**

---

## 👥 User Roles & Routes

| Role | Default Route | Capabilities |
|---|---|---|
| `ADMIN` | `/admin` | Manage exams, enroll students, live monitoring, view results |
| `STUDENT` | `/student` | View enrolled exams, take exams |
| `QUESTION_MANAGER` | `/questions` | Add/edit/delete questions |

---

## 🗺️ Application Flow

### Getting Started (First Time)
1. Register as **ADMIN** at `/register`
2. Login → redirected to `/admin`
3. Go to **Exams** → Create an exam (e.g. "Math Test", 60 min)
4. Click **Enroll** → enroll a student user
5. Register as **QUESTION_MANAGER** → login → add questions to the exam
6. Register as **STUDENT** → login → start the exam

### During an Exam
- Student grants camera access on pre-exam screen
- Exam launches in fullscreen
- Violations (tab switch, fullscreen exit, copy, paste, DevTools, right-click) are detected and logged
- Admin sees live violation alerts in real-time
- Admin can click **Monitor** to view the student's webcam stream
- After **3 warnings**, the exam auto-terminates
- On completion, score is calculated and emailed to the student

---

## 🔒 Violation Detection

| Event | Detection Method |
|---|---|
| Tab switch | `document.visibilitychange` |
| Fullscreen exit | `document.fullscreenchange` |
| Copy | `document.copy` |
| Paste | `document.paste` |
| Keyboard shortcuts | `keydown` (Ctrl+C/V/A/U, Ctrl+Shift+I/J, F12) |
| Right-click | `contextmenu` |
| Window blur | `window.blur` |

---

## 📁 Project Structure

```
examsentinel/
├── backend/
│   ├── config/          db.js, session.js, mailer.js
│   ├── controllers/     authController, examController, questionController, resultController, adminController
│   ├── middleware/      auth.js, errorHandler.js
│   ├── models/          User, Exam, ExamEnrollment, Question, StudentResponse, ExamSession, Result, ActivityLog
│   ├── routes/          auth, exam, question, result, admin
│   ├── services/        authService, examService, questionService, resultService, adminService
│   ├── sockets/         index.js (violation events + WebRTC signaling)
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/  Navbar, ProtectedRoute, LoadingSpinner, CountdownTimer, WebcamView, StudentCard
│       ├── context/     AuthContext
│       ├── hooks/       useTimer, useViolationDetector, useWebRTC, useAdminWebRTC
│       ├── pages/
│       │   ├── auth/    LoginPage, RegisterPage, ForgotPasswordPage
│       │   ├── student/ StudentDashboard, PreExamPage, ExamPage, ResultPage
│       │   ├── admin/   AdminDashboard, ExamManagementPage, ResultsPage, StudentMonitorModal
│       │   └── qm/      QuestionManagerPage
│       └── utils/       api.js (axios), socket.js (socket.io-client)
├── schema.sql           ← Full MySQL schema (run manually or let Sequelize auto-create)
├── .env.example
└── README.md
```

---

## 🔁 Vite Dev Proxy

The frontend Vite dev server proxies `/api` and `/socket.io` requests to `localhost:5000` automatically.
This means **no CORS issues** in development — just start both servers and everything connects.

```
Browser → http://localhost:5173/api/... → Vite Proxy → http://localhost:5000/api/...
Browser → http://localhost:5173/socket.io → Vite Proxy (ws) → http://localhost:5000
```

---

## 🧪 WebRTC Notes

- WebRTC is **LAN-only** — student and admin must be on the **same network**.
- No STUN/TURN server is configured (as specified for LAN use case).
- Video is **not recorded or stored** — view only.

---

## 🔧 Troubleshooting

| Issue | Fix |
|---|---|
| `ER_ACCESS_DENIED_ERROR` | Check `DB_USER` / `DB_PASSWORD` in `backend/.env` |
| `ER_BAD_DB_ERROR` | Database not created yet — run `schema.sql` or create DB manually |
| Sessions not persisting | `sessions` table auto-created — check MySQL user has CREATE permissions |
| Email not sending | Use Gmail **App Password** (16 chars), not your regular Gmail password |
| reCAPTCHA error in dev | Use test key `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` — always passes locally |
| WebRTC stream not showing | Admin and student must be on the **same LAN** — no TURN server configured |
| Socket not connecting | Check Vite proxy is running; both servers must be started |
| `alter: true` error on startup | Run `schema.sql` manually first, then restart backend |
| `Cannot find module` error | Run `npm install` inside both `backend/` and `frontend/` directories |


