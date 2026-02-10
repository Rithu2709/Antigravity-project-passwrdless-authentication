
# Secure Data Vault - The Reactor Core

A high-security "Data Vault" application featuring a unique "Reactor Core" authentication mechanism and a futuristic dashboard.

## 📂 Project Structure

```
passwordless authentication/
├── server/                 # Backend (Node.js + Express)
│   ├── controllers/        # Auth logic
│   ├── middleware/         # JWT Middleware
│   ├── schema.sql          # Database Schema
│   ├── server.js           # Entry Point
│   └── .env                # Env variables
└── client/                 # Frontend (React + Vite)
    ├── src/
    │   ├── components/     # ReactorLock, Dashboard
    │   ├── api/            # Axios instance
    │   └── App.jsx         # Main Logic
    └── ...
```

## 🚀 Setup Instructions

### 1. Database Setup (MySQL)
1. Ensure MySQL is running.
2. Create the database and tables using `server/schema.sql`.
   ```bash
   mysql -u root -p < server/schema.sql
   ```
   *(Or copy-paste the contents of `schema.sql` into your SQL client)*

### 2. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   - Edit `.env` if your MySQL password or port differs.
4. Start the server:
   ```bash
   npm start
   # or
   node server.js
   ```
   *Server runs on http://localhost:5000*

### 3. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the link provided (usually http://localhost:5173).

## 🎮 How to Use
1. **Registration**:
   - Click **[ Initialize New Core ]** on the main screen.
   - Drag the 3 rings to any pattern you like.
   - Click the central **Core** button to register your sequence.
2. **Authentication**:
   - Drag the rings to match your registered pattern (within +/- 15 degrees).
   - Click the **Core** button.
   - *Success*: Access the Vault.
   - *Fail*: "Angular Misalignment Detected".

## 🛠 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, MySQL, JWT
- **Security**: "Reactor" pattern matching with tolerance logic.

---
*Authorized Personnel Only*
=======

