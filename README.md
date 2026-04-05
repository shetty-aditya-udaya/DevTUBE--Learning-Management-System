# 🎬 DevTUBE — Learning Management System

A full-stack, production-ready Learning Management System (LMS) built with a cinematic design language. DevTUBE combines a modern React frontend with a robust Flask backend, a community feed, and an integrated AI assistant powered by Google Gemini.

---

## ✨ Features

- 🔐 **Authentication** — Secure JWT-based login & registration with refresh token rotation
- 📚 **Course Catalogue** — Browse, enroll, and track progress through structured courses and lessons
- 📊 **Student Dashboard** — Real-time enrollment stats, progress tracking, and activity feed
- 💬 **Community Feed** — Social-style posts, comments, and likes for peer interaction
- 🤖 **AI Assistant** — Context-aware in-app chatbot powered by Google Gemini API
- 🎨 **Cinematic UI** — Glassmorphism, gradient animations, and smooth micro-interactions

---

## 🏗️ Tech Stack

| Layer     | Technology                             |
|-----------|----------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS           |
| Backend   | Python 3.11+, Flask, Flask-JWT-Extended|
| Database  | MySQL (Aiven Cloud) / SQLite (dev)     |
| AI        | Google Gemini API                      |
| Auth      | JWT (access + refresh tokens)          |
| ORM       | SQLAlchemy                             |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MySQL instance (or use the built-in SQLite fallback for development)

---

### 1. Clone the Repository

```bash
git clone https://github.com/shetty-aditya-udaya/DevTUBE--Learning-Management-System.git
cd DevTUBE--Learning-Management-System
```

---

### 2. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in your real values (DB credentials, API keys, etc.)
```

**Run the backend:**

```bash
python run.py
```

The API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

| Variable                     | Description                              |
|------------------------------|------------------------------------------|
| `SECRET_KEY`                 | Flask session secret (min 32 chars)      |
| `DATABASE_URL`               | Full SQLAlchemy DB URI                   |
| `JWT_SECRET_KEY`             | JWT signing secret (min 32 chars)        |
| `JWT_ACCESS_TOKEN_EXPIRES`   | Access token TTL in seconds (default 1h) |
| `JWT_REFRESH_TOKEN_EXPIRES`  | Refresh token TTL in seconds (default 30d)|
| `GEMINI_API_KEY`             | Google Gemini AI API key                 |
| `CORS_ORIGINS`               | Comma-separated allowed frontend origins |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## 📁 Project Structure

```
DevTUBE--Learning-Management-System/
├── backend/
│   ├── app/
│   │   ├── middleware/       # JWT auth middleware
│   │   ├── models/           # SQLAlchemy models
│   │   ├── routes/           # API route blueprints
│   │   ├── services/         # Business logic layer
│   │   └── utils/            # Response helpers
│   ├── config.py             # App configuration
│   ├── run.py                # Entry point
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   └── App.jsx           # Root component & routing
│   ├── index.html
│   └── vite.config.js
└── README.md
```

---

## 🛡️ Security Notes

- All secrets are loaded from environment variables — no hardcoded credentials
- JWT tokens use short-lived access tokens + long-lived refresh tokens
- Database connections use SSL when connecting to Aiven cloud MySQL
- Passwords are hashed with `bcrypt` via Flask-Bcrypt
- `.env` and sensitive files are excluded from version control via `.gitignore`

---

## 📄 License

MIT © 2026 Aditya Shetty Udaya
