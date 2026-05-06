📌 Team Task Manager

A full-stack task and project management application that helps teams create projects, assign tasks, and track progress efficiently.


## 📌 Features
User authentication (Signup / Login)
JWT-based secure login system
Create and manage projects
Add, update, and assign tasks
Track task status (Pending / In Progress / Completed)
Role-based task handling (creator / assignee)
REST API backend
Fully deployed application


## 🛠️ Tech Stack
Frontend:
React
Axios
Backend:
Node.js
Express.js
Database:
PostgreSQL
Prisma ORM
Authentication:
JSON Web Token (JWT)
bcryptjs
Deployment:
Backend: Railway
Frontend: Railway



## 🗂️ Project Structure
team-task-manager/
│
├── frontend/        # React frontend
├── backend/         # Node.js backend
│   ├── prisma/      # Prisma schema & migrations
│   ├── src/         # API routes & logic
│
└── README.md


## ⚙️ Setup Instructions
1. Clone Repository
git clone https://github.com/your-username/team-task-manager.git
2. Backend Setup
cd backend
npm install

## Create .env file:

DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key
PORT=8080

## Run migrations:

npx prisma migrate dev

## Start backend:

npm run dev
3. Frontend Setup
cd frontend
npm install
npm start


## 🔐 Authentication Flow
User registers with email & password
Password is hashed using bcrypt
JWT token is generated on login
Token is used for protected API routes
