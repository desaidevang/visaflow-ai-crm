# 🌍 VisaFlow — AI-Powered CRM & Lead Generation Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

> 🚀 A production-grade AI-powered CRM designed for visa & immigration consultancies — combining intelligent lead generation, real-time pipeline tracking, and event-driven backend architecture.

---

## 🧠 Overview

**VisaFlow** is not just a CRM — it's a **complete business operating system** for consultancies.

It bridges the gap between:
👉 **Frontend marketing (lead generation)**  
👉 **Backend operations (sales pipeline & visa processing)**  

With AI + automation, it transforms how consultancies manage and convert leads.

---

## 🤖 AI Counselor Chatbot (Core Feature)

**VisaFlow Buddy** acts as a virtual counsellor:

- Understands user intent (Student / Work / Business / Tourist)
- Collects structured user data via conversation
- Answers visa-related queries in natural language
- Automatically **qualifies and creates leads**
- Pushes leads directly into CRM pipeline

👉 Converts website visitors into **high-quality leads automatically**

---

## 📊 Business Workflow Engine

Designed to mirror real consultancy operations:


Lead → Counselling → Coaching → Application → Visa → Success

---

## 📸 Screenshots

### 🖥️ Admin Dashboard
![Dashboard](./screenshots/dashboard.png)

---

### 🤖 AI Chatbot (VisaFlow Buddy)
![Chatbot](./screenshots/chatbot.png)

---

### 📊 Pipeline & Lead Management
![Pipeline](./screenshots/pipeline.png)


### Other Screenshots
![Pipeline](./screenshots/other1.png)

### 
![Pipeline](./screenshots/other12.png)
---

### Key Capabilities:
- Stage-based pipeline tracking  
- Lead ownership (Agent assignment)  
- Follow-ups & reminders  
- Activity logging (audit trail)  
- Coaching progress tracking (IELTS / GRE / GMAT)

---

## ⚙️ System Design & Architecture

### ⚡ Event-Driven Backend

Built using Node.js **EventEmitter** to decouple heavy operations:

**Triggered Events:**
- Lead creation  
- Status updates  
- Follow-ups  

**Handled Services:**
- Email notifications  
- Activity logging  
- Workflow automation  

👉 Improves scalability without heavy tools like Kafka

---

### 🔐 Authentication & Authorization

- JWT authentication (cookies + headers)
- Role-Based Access Control (Admin / Agent / Owner)
- Route protection via middleware
- Lead ownership restrictions

---

### 🛡️ Security

- IP-based rate limiting (`express-rate-limit`)
- Secure CORS configuration
- HTTP-only cookies
- Environment-based configuration
- API abuse protection

---

### 📊 Analytics Engine

- Lead conversion funnel  
- Revenue & pending payments  
- Monthly trends  
- Status distribution  

👉 Provides business-level insights, not just data

---

## 🏗️ Tech Stack

### 🧠 Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### 🎨 Frontend
- React.js (Admin + Client)
- Tailwind CSS

### ⚡ Architecture
- Event-Driven (EventEmitter)
- MVC Pattern

### 🐳 DevOps
- Docker
- Docker Compose

### 🤖 AI
- AI chatbot for lead qualification & guidance

---

## 📂 Project Structure

```text
visaflow/
├── admin/                 # React frontend for the Admin/Agent Dashboard
├── client/                # React frontend for the public-facing Lead Gen website
├── server/                # Node.js Express backend
│   ├── config/            # Database and environment configurations
│   │   └── db.js          # MongoDB connection logic
│   ├── controller/        # Request handlers for routes
│   ├── events/            # EventEmitter logic (Emails, Notifications, Logs)
│   ├── middlewares/       # Auth, Rate Limiting, Error Handling
│   ├── model/             # Mongoose schemas (Lead, User, Application, etc.)
│   ├── routes/            # API endpoints definition
│   ├── services/          # Core business logic and AI integration
│   ├── Dockerfile         # Backend container configuration
│   ├── server.js          # Entry point for the application
│   └── package.json       
├── .dockerignore          
├── docker-compose.yml     # Orchestrates client, admin, server, and db containers
└── .env                   # Environment variables (Not pushed to VC)


---

## 🛠️ Getting Started

### 📌 Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or Local)
- Docker (optional)

---

### 🔑 Environment Setup

Create `.env` inside `/server`:


PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_api_key


---

## 🚀 Run the Application

### 🐳 Using Docker (Recommended)

docker-compose up --build


---

### 💻 Manual Setup

#### Backend

cd server
npm install
npm run dev


#### Admin Dashboard

cd admin
npm install
npm run dev


#### Client Website

cd client
npm install
npm run dev


---

## 📡 API Health Check


GET /api/health


**Sample Response:**
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "server": "running"
}
🎯 Key Learnings
Designing real-world business systems
Implementing event-driven architecture
Building secure & scalable APIs
Integrating AI into production workflows
Managing complex state across multiple roles
🔮 Future Improvements
Microservices architecture (Auth, Notification, Leads)
WebSocket real-time updates
Payment integration (Stripe)
Multi-tenant SaaS support
Advanced analytics & reporting
🔗 Links
🌐 Linkedin: https://www.linkedin.com/in/devang-desai-/
💻 GitHub: https://github.com/desaidevang/visaflow-ai-crm
👨‍💻 Author

Devang Desai
Full Stack MERN Developer

⭐ Support

If you found this project useful, consider giving it a ⭐!
