# Tasky - Video Presentation Script
**Target Duration:** 3-4 Minutes
**Vibe:** Professional, enthusiastic, clear, and focused on full-stack capabilities.

---

## 🎬 Introduction (0:00 - 0:30)
*(Screen: Show the Login Page with the floating card and rotating T logo)*

**Speaker:**
"Hi everyone, and welcome to Tasky. Tasky is a full-stack, collaborative Team Task Management Web Application that I built from scratch to solve real-world productivity challenges. My goal was to create an experience that rivals premium tools like Trello or Asana, both in how it looks and how robustly it operates under the hood. 

Today, I’m going to walk you through its core features, including secure authentication, project management, real-time dashboard analytics, and role-based access control."

*(Screen: Demonstrate logging in with an email and password)*

"Let's go ahead and log in. The app uses secure JSON Web Tokens (JWT) on the backend for robust, stateless authentication."

---

## 📊 Dashboard & Live Analytics (0:30 - 1:15)
*(Screen: Landing on the Dashboard page. Pan across the top stats row)*

**Speaker:**
"Right as we log in, we land on the Dashboard. This isn't just static data; the dashboard features a live analytics engine fetching data directly from our MongoDB database via a custom Express API. 

Here we have four crucial metrics:
1. **Total Tasks** across all my active projects.
2. A **Status Breakdown**, giving me a quick pulse check on what's 'To Do' versus what's 'Done'.
3. **Tasks Per User**, allowing managers to quickly spot workload distribution across the team.
4. And critical **Overdue Tasks** alerts."

*(Screen: Scroll down the Dashboard to show "My Categories", "My Tasks", and "Productivity" widgets)*

"I also implemented dynamic UI widgets, like a real-time productivity bar that calculates completion percentages, and a timeline view showing exactly what is due today versus later this week."

---

## 🏗️ Project & Task Management (1:15 - 2:30)
*(Screen: Navigate to the "My Tasks" (Projects) tab on the sidebar)*

**Speaker:**
"Let's dive into the core engine: Project and Task Management. 

Here, tasks are organized into Kanban-style lists. The UI is built using React and Tailwind CSS, featuring smooth hover states and a clean, 'bento-box' design methodology."

*(Screen: Click on a task to open the Task Details Modal. Show the split-pane design)*

"When I open a task, you'll see a premium, split-pane modal. On the left, we have the core metadata: Status, Priority, and Deadlines. On the right, a fully functional commenting and attachment system."

*(Screen: Type a comment and click the yellow submit arrow)*

"Communication is key for teams, so I built a threaded comment system. You can easily attach updates or drop in files, all stored securely and linked to this specific task reference in the database."

---

## 🔐 Role-Based Access Control [RBAC] (2:30 - 3:30)
*(Screen: While still in the Task Modal, point out the Priority and Deadline dropdowns)*

**Speaker:**
"Now, one of the most complex requirements for this project was **Role-Based Access Control**. 

Tasky handles permissions strictly on both the frontend and the backend. Because I am the 'Admin' of this current project, I have full control. I can change the deadline, escalate the priority, and even delete the task entirely."

*(Screen: Switch to a different user or just explain the Member view)*

"However, if a standard 'Member' logs in, the UI dynamically adapts. The delete button completely disappears, and core fields like Priority and Due Date become locked. A member is restricted to only progressing the task status—say, moving it from 'In Progress' to 'Done'—and adding comments. 

And it's not just a UI trick; the Node.js backend actively verifies the JWT token and the user's role before allowing any `PUT` or `DELETE` requests to the database, ensuring complete security."

---

## 🏁 Conclusion (3:30 - 4:00)
*(Screen: Navigate back to the Dashboard, maybe toggle a task complete to show a stat update)*

**Speaker:**
"To wrap up, Tasky leverages the complete MERN stack to deliver a scalable, secure, and beautiful productivity tool. From the sleek Vite and Tailwind frontend to the robust, role-secured Express backend connected to MongoDB, every layer was built to be production-ready.

Thank you so much for watching, and I look forward to your feedback!"
