# StructQL

> AI-powered Natural Language to SQL execution platform built with Flask, React, and Groq LLM.

StructQL allows users to connect their databases and execute SQL queries using natural language. The system analyzes database schemas, generates optimized SQL using an LLM, validates it against strict permission rules, and executes it securely.

This project demonstrates full-stack system design, secure query validation, LLM integration, and production deployment.

---

## 🚀 Key Features

- Natural Language → SQL generation  
- Multi-table JOIN understanding  
- Secure SQL validation layer  
- Role-based permission control  
- Destructive query blocking  
- Automatic SQL error correction  
- Query execution engine  
- Saved database connections  
- API key generation for backend integrations  
- JWT-based authentication  
- Production deployment (Render + Vercel)

---

## 🏗 Architecture Overview

```
            ┌──────────────────────┐
            │      Frontend        │
            │  React + Vite (SPA)  │
            └──────────┬───────────┘
                       │ HTTPS
                       ▼
            ┌──────────────────────┐
            │       Backend        │
            │  Flask + SQLAlchemy  │
            ├──────────────────────┤
            │  JWT Authentication  │
            │  SQL Validation      │
            │  Permission Engine   │
            │  Groq LLM Integration│
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │     Databases        │
            │ MySQL / PostgreSQL   │
            └──────────────────────┘
```

### Deployment

- Frontend → Vercel  
- Backend → Render  
- Database → PostgreSQL (Render)

---

## 🧠 AI Query Processing Pipeline

1. User submits natural language query.
2. Backend retrieves relevant database schema.
3. Prompt constructed and sent to Groq LLM.
4. SQL is generated.
5. SQL is validated against security & permission rules.
6. If validation fails or execution errors occur:
   - System attempts automatic correction.
7. Safe query is executed.
8. Structured results returned.

---

## 🔐 Security & Validation Layer

StructQL does **not blindly execute LLM output**.

### Always Blocked Statements

```python
ALWAYS_BLOCKED = {"DROP", "TRUNCATE", "ALTER", "CREATE", "GRANT", "REVOKE", "RENAME"}
```

### Dangerous Keyword Blocking

```python
DANGEROUS_KEYWORDS = {"INTO OUTFILE", "LOAD_FILE", "XP_CMDSHELL"}
```

### Permission Levels

```python
PERMISSION_RULES = {
    "read_only": {"SELECT"},
    "read_write": {"SELECT", "INSERT", "UPDATE"},
    "full_access": {"SELECT", "INSERT", "UPDATE", "DELETE"}
}
```

Every query is parsed and validated before execution.

---

## 🗄 Supported Databases

### Enabled for Users

- MySQL  
- PostgreSQL  

### Backend Support Available

- Oracle  
- Microsoft SQL Server  

(Oracle & MSSQL are restricted due to advanced handling requirements.)

---

## 🔑 Authentication & Access Control

- JWT-based authentication  
- Role-based user permissions  
- API key system for backend integrations  
- Token-based protected routes  
- Strict destructive query blocking  

---

## 📦 Tech Stack

### Backend

- flask  
- flask-cors  
- flask-sqlalchemy  
- flask-bcrypt  
- pyjwt  
- cryptography  
- groq  
- pymysql  
- python-dotenv  
- sqlparse  
- oracledb  
- psycopg2-binary  
- gunicorn  

### Frontend

- React  
- Vite  
- Axios  
- React Router  
- Tailwind CSS  

---

## 🛠 Local Development Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/prabhupachisia/NLP_SQL_Agent.git
cd NLP_SQL_Agent
```

---

## Backend Setup

### Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### Activate Environment

**macOS / Linux**

```bash
source venv/bin/activate
```

**Windows**

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Create `.env` inside the backend folder:

```
SECRET_KEY=your_secret_key
JWT_EXPIRY=3600
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

For local SQLite development:

```
DATABASE_URL=sqlite:///app.db
```

### Run Backend

```bash
python app.py
```

Or using Gunicorn:

```bash
gunicorn app:app
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` inside frontend:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Run development server:

```bash
npm run dev
```

---

## 🌍 Production Deployment

### Backend (Render)

- Create Web Service  
- Start Command:

```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```

- Add required environment variables  
- Connect PostgreSQL service  

---

### Frontend (Vercel)

Set environment variable:

```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

Add `vercel.json` for SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 🧪 Example Natural Language Queries

- Show all orders along with their customers and order items  
- Show total revenue grouped by region  
- List the 5 most recent transactions  
- Update customer email where id equals 10  

---

## ⚠️ Limitations

- No rate limiting implemented yet  
- No schema visualization UI  
- Oracle and MSSQL not publicly exposed  

---

## 🎯 Project Focus

StructQL is built as an AI engineering project showcasing:

- LLM-to-database orchestration  
- Secure query validation  
- Full-stack system design  
- Role-based permission enforcement  
- Production deployment workflow  
