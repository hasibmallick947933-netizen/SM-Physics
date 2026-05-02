# ⚛️ SM Physics — Full-Stack Coaching Website

> **Premium physics coaching platform** with public website, Computer-Based Test (CBT) system, and admin panel. Built with Next.js, MongoDB, JWT auth, and Framer Motion animations.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (Pages Router) · React 18 |
| **Styling** | Tailwind CSS · Framer Motion |
| **Backend** | Next.js API Routes (Node.js) |
| **Database** | MongoDB Atlas (via Mongoose) |
| **Auth** | JWT · bcryptjs · HTTP-only cookies |
| **Fonts** | Playfair Display · DM Sans · JetBrains Mono |

---

## 📁 Project Structure

```
sm-physics/
├── pages/
│   ├── index.js              ← Home page
│   ├── about.js              ← About page
│   ├── locations.js          ← 4 centre locations
│   ├── gallery.js            ← Image gallery
│   ├── contact.js            ← Contact form
│   ├── login.js              ← Auth
│   ├── register.js           ← Auth
│   ├── 404.js                ← Custom 404
│   ├── test/
│   │   ├── index.js          ← Student test list
│   │   └── [id].js           ← Full CBT interface
│   ├── admin/
│   │   ├── index.js          ← Admin dashboard
│   │   ├── questions.js      ← Question bank
│   │   ├── results.js        ← Results + CSV export
│   │   ├── monitor.js        ← Live session monitor
│   │   ├── logs.js           ← Anti-cheat activity logs
│   │   ├── students.js       ← Student management
│   │   └── tests/create.js   ← Test creation
│   └── api/
│       ├── auth/             ← login · register · me
│       ├── tests/            ← CRUD · submit · log-event
│       ├── questions/        ← CRUD
│       ├── admin/            ← stats · results
│       └── users/            ← students · [id]
├── components/
│   ├── layout/               ← Navbar · Footer · Layout
│   ├── home/                 ← Hero · WhyChooseUs · Testimonials · CTA
│   └── (ui shared)
├── hooks/
│   └── useAuth.js            ← Auth context + provider
├── lib/
│   ├── db.js                 ← MongoDB connection pool
│   └── auth.js               ← JWT sign/verify/middleware
├── models/
│   ├── User.js
│   ├── Test.js
│   ├── Question.js
│   ├── Response.js           ← Test attempt + scoring
│   └── ActivityLog.js        ← Anti-cheat events
├── styles/
│   └── globals.css
├── scripts/
│   └── seed.js               ← Create admin account
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## ⚙️ Local Setup

### 1. Prerequisites
- Node.js **18+**
- MongoDB Atlas account (free tier works)

### 2. Clone & Install

```bash
# Clone (or unzip the project)
cd sm-physics

# Install dependencies
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/sm-physics?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
ADMIN_EMAIL=admin@smphysics.in
ADMIN_PASSWORD=Admin@SM2024
```

### 4. Seed Admin Account

```bash
node scripts/seed.js
```

Output:
```
✅ Connected to MongoDB
✅ Admin created successfully!
   Email:    admin@smphysics.in
   Password: Admin@SM2024
   → Change your password after first login!
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Pages Overview

| URL | Description |
|-----|-------------|
| `/` | Home — animated hero, features, testimonials, CTA |
| `/about` | About the coaching, teacher profile, timeline |
| `/locations` | 4 centre cards: Ranihati, Bauria, Uluberia, Khalisani |
| `/gallery` | Filterable image gallery with lightbox |
| `/contact` | Contact form + phone numbers |
| `/register` | Student registration |
| `/login` | Sign in (student or admin) |
| `/test` | Student: list of available tests |
| `/test/[id]` | **Full CBT interface** (JEE-pattern) |
| `/admin` | Admin dashboard |
| `/admin/questions` | Add / edit / delete questions |
| `/admin/tests/create` | Create new test, select questions |
| `/admin/results` | View scores, export CSV |
| `/admin/monitor` | Live session monitoring |
| `/admin/logs` | Anti-cheat activity feed |
| `/admin/students` | Student list, activate/deactivate |

---

## 🧠 CBT System — How It Works

### Student Flow
1. Register / Login
2. Browse available tests on `/test`
3. Read instructions → click **Start Test**
4. JEE-style full-screen interface:
   - Question palette with colour-coded status
   - MCQ (4 options) + Numerical answer types
   - Timer countdown
   - Mark for Review
5. Submit → instant result screen

### Anti-Cheat
| Event | Action |
|-------|--------|
| Tab switch | –4 marks + warning |
| Window blur | –4 marks + warning |
| Right-click | Logged |
| Ctrl+C/V/U | Blocked + logged |
| After 3 violations | **Auto-submit** |

All events are stored in `ActivityLog` collection with timestamp, severity, and IP.

### Scoring
- MCQ Correct: **+4**
- MCQ Wrong: **–1**
- Numerical Correct: **+4**
- Numerical Wrong: **–1** (configurable)
- Unattempted: **0**
- Per-violation deduction: configurable (default **–4**)

---

## 👨‍🏫 Admin Panel

### Create a Test
1. Go to `/admin/tests/create`
2. Fill test details (title, duration, subject)
3. Configure anti-cheat settings
4. Select questions from the bank
5. Publish

### Question Types
- **MCQ** — 4 options, mark one correct answer, solution explanation
- **Numerical** — exact numeric answer with optional tolerance (±)

### Monitoring
- `/admin/monitor` — real-time list of students in active tests
- `/admin/logs` — filterable violation feed with severity levels
- `/admin/results` — ranked results table, one-click CSV export

---

## 🗄️ Database Collections

| Collection | Purpose |
|-----------|---------|
| `users` | Students + admins |
| `tests` | Test metadata, settings, question refs |
| `questions` | MCQ + Numerical question bank |
| `responses` | Each student's test attempt + answers + score |
| `activitylogs` | Anti-cheat events per student per test |

---

## 🚢 Deployment

### Vercel (Recommended — Frontend + API)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel Dashboard → Settings → Environment Variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL` → your Vercel URL (e.g. `https://sm-physics.vercel.app`)
- `NODE_ENV=production`

### Production Build Locally

```bash
npm run build
npm start
```

---

## 🔐 Security Notes

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT stored in **httpOnly cookie** (XSS-safe) + localStorage fallback via `js-cookie`
- All admin routes protected by `requireAdmin` middleware
- All student routes protected by `requireAuth` middleware
- Anti-cheat events logged server-side (client-side events are just triggers)

---

## 📱 Responsive Design

- ✅ Mobile-first Tailwind CSS
- ✅ Desktop: custom cursor interaction effect
- ✅ Navbar collapses to slide-in drawer on mobile
- ✅ CBT interface adapts: side panel becomes floating on mobile

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary Navy | `#0B1E3D` |
| Accent Blue | `#1A6FD4` |
| Gold | `#D4A017` |
| Background | `#FAF7F0` (cream) |
| Font Display | Playfair Display |
| Font Body | DM Sans |
| Font Mono | JetBrains Mono |

---

## 🧩 Adding More Features

**Add a new question via API:**
```bash
POST /api/questions
Authorization: Bearer <admin_token>
{
  "type": "mcq",
  "subject": "Physics",
  "topic": "Kinematics",
  "questionText": "A body starts from rest...",
  "options": [
    {"label":"A","text":"5 m/s"},
    {"label":"B","text":"10 m/s"},
    {"label":"C","text":"15 m/s"},
    {"label":"D","text":"20 m/s"}
  ],
  "correctOption": "B",
  "marksCorrect": 4,
  "marksIncorrect": -1
}
```

**Publish/Unpublish a test:**
```bash
PUT /api/tests/<testId>
{ "isPublished": true }
```

---

## 👨‍💻 Credits

Designed and created by **Hasib Mallick**

---

*SM Physics Coaching Centre · Uluberia, Howrah, West Bengal*
