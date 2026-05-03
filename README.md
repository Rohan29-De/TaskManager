# Tasky - Team Task Management Web Application

Tasky is a comprehensive, full-stack collaborative task management application designed for teams. Built as a simplified alternative to tools like Trello or Asana, Tasky empowers users to organize projects, assign tasks, track deadlines, and monitor productivity—all wrapped in a beautifully crafted, highly responsive premium user interface.

## 🚀 Features

This application perfectly fulfills all functional requirements:

### 1. User Authentication
- Complete Signup/Login workflow with Name, Email, and Password.
- Highly secure authentication powered by JWT (JSON Web Tokens) stored in HTTP cookies/context.
- Premium split-screen Auth UI with modern branding.

### 2. Project Management
- Users can create independent collaborative Projects.
- **Role-Based Provisioning:** The creator of a project automatically becomes its **Admin**.
- Admins have exclusive rights to add/remove members from the project.
- Members have full visibility of the projects they are assigned to.

### 3. Task Management
- Create detailed tasks containing a Title, Description, Due Date, and Priority (Low, Medium, High).
- Assign specific team members to tasks.
- Track progress by updating task Statuses (`To Do`, `In Progress`, `Done`).
- Attachments and live commenting system built into a sleek task detail modal.

### 4. Interactive Dashboard Stats
The dashboard offers live insights into your workflow via a robust statistics backend:
- **Total tasks:** Overall tasks in your active projects.
- **Tasks by status:** Live counts categorizing completion state.
- **Tasks per user:** Identify workload distribution across the team.
- **Overdue tasks:** Instant visibility on tasks that missed their deadlines.

### 5. Strict Role-Based Access Control (RBAC)
Robust security on both the Frontend UI and Backend APIs:
- **Admin:** Exclusive ability to create tasks, delete tasks, edit core task details (due date, priority), and manage project users.
- **Member:** Restricted to viewing tasks and updating the status/comments of their assigned tasks only.

---

## 🛠 Tech Stack

**Frontend**
- React 18 (Vite)
- TypeScript
- Tailwind CSS (with custom theming & micro-animations)
- Lucide React (Icons)
- Date-fns (Date formatting)

**Backend**
- Node.js & Express.js
- MongoDB & Mongoose (NoSQL Database)
- JSON Web Token (JWT) Authentication
- Joi (Input validation)

---

## 🏗 Installation & Local Setup

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for the local MongoDB instance)

### 1. Clone the repository
```bash
git clone https://github.com/Rohan29-De/TaskManager.git
cd TaskManager
```

### 2. Set up the Database
The project uses Docker to quickly spin up a MongoDB instance.
```bash
docker-compose up -d
```

### 3. Setup Environment Variables
Create a `.env` file inside the `/backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://root:example@localhost:27017/taskmanager?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Install Dependencies & Start the Backend
```bash
cd backend
npm install
npm run dev
```
*The API will start running on http://localhost:5000*

### 5. Install Dependencies & Start the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The Web App will be accessible at http://localhost:5173*

---

## 📂 Project Structure

```
TaskManager/
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── controllers/      # API Logic (projects, tasks, users, stats)
│   │   ├── middleware/       # JWT Auth & Validation
│   │   ├── models/           # Mongoose Schemas (User, Project, Task)
│   │   └── routes/           # Express Route definitions
├── frontend/                 # React Vite App
│   ├── src/
│   │   ├── api/              # Axios configuration & interceptors
│   │   ├── components/       # Reusable UI (Sidebar, Layout)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── pages/            # Main views (Dashboard, Projects, Login, Signup)
│   │   └── index.css         # Global Tailwind layers and theme variables
└── docker-compose.yml        # MongoDB Container Config
```

---

## 🎯 Deployment
*Deployment guide for Railway will be documented here once the backend and frontend are live.*
