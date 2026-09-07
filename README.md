# TaskFlow &bull; Full-Stack Task Management System

A production-quality, responsive Task Management System built with a **Node.js + Express + PostgreSQL + Sequelize ORM** backend and a modern **React + Vite** frontend dashboard.

---

## 1. Project Overview

TaskFlow is an enterprise-grade full-stack task management application designed for productivity, secure collaboration, and clean architecture. It demonstrates:

* **Strict Authentication & Authorization**: Secure JWT-based authentication with bcrypt password hashing and user ownership boundary enforcement on every endpoint.
* **Relational Database Design**: Robust PostgreSQL schema with Sequelize models, associations (`User -> Tasks`, `User -> Categories`, `Category -> Tasks`), migrations, and seeders.
* **REST API Architecture**: Clean controllers, routes, centralized error handling, and Zod input validation returning structured error messages.
* **Modern React Dashboard**: Responsive glassmorphic dark interface with KPI metrics, productivity progress tracking, status filters, category filters, sorting, and full CRUD workflows.
* **Mobile-Friendly Layout**: Responsive sidebar with hamburger navigation and desktop/tablet/mobile support.

---

## 2. Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite + Tailwind CSS v4 | Fast HMR, React Router v7, Lucide Icons, Tailwind CSS v4 with dark/light themes |
| **Backend** | Node.js + Express | RESTful API, Helmet, CORS, Morgan |
| **Database** | PostgreSQL 18 | Relational persistent database with foreign keys & indexes |
| **ORM** | Sequelize 6 | CLI migrations, associations, transactions, seeders |
| **Authentication** | JWT (`jsonwebtoken`) | Bearer token authentication with expiry |
| **Password Security** | `bcryptjs` | Salt generation and one-way password hashing |
| **Validation** | `zod` | Declarative schema validation with uniform 400 error payloads |

---

## 3. Key Features

### Authentication & Security
- **Register**: Validates name (min 2), email, password (min 6). Hashes passwords with bcrypt.
- **Login**: Compares bcrypt hash and issues 7-day signed JWT tokens. Includes a quick "Fill Demo" shortcut for instant evaluation.
- **Protected Endpoints**: Verified by `authenticateToken` middleware with `Authorization: Bearer <token>`.
- **User Ownership Isolation**: Users can only access, modify, or delete their own tasks and categories. Accessing another user's resources returns `404 Not Found` (no ID leakage).

### Task Management
- **Complete CRUD**: Create, read, update, and delete tasks with instant optimistic updates.
- **One-Click Status Toggle**: Toggle between `PENDING` and `COMPLETED` directly from the list.
- **Category Assignment**: Associate tasks with custom categories or keep them unassigned.
- **Filtering**: Filter by status (`All`, `Pending`, `Completed`) and by Category.
- **Sorting**: Sort by `Newest First`, `Oldest First`, `Title (A-Z)`, `Title (Z-A)`.
- **Full-Text Search**: Instant search by task title or description.

### Category Management
- **Category CRUD**: Create, edit, and delete custom categories.
- **Task Counters**: Real-time aggregated task counts per category.
- **Safe Cascade**: Deleting a category safely sets associated tasks' `categoryId` to `NULL` (`onDelete: SET NULL`) without deleting the tasks.

---

## 4. Project Structure

```text
task-management-system2/
├── package.json              # Monorepo runner scripts (concurrently)
├── README.md                 # Project documentation
│
├── backend/
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Local environment configuration
│   ├── .sequelizerc          # Sequelize CLI path configuration
│   ├── package.json          # Backend dependencies and scripts
│   ├── config/
│   │   └── database.js       # Sequelize database configuration
│   ├── migrations/
│   │   ├── 20260907000001-create-users.js
│   │   ├── 20260907000002-create-categories.js
│   │   └── 20260907000003-create-tasks.js
│   ├── seeders/
│   │   └── 20260907000001-demo-data.js
│   ├── src/
│   │   ├── controllers/      # Auth, Task, Category controllers
│   │   ├── middleware/       # JWT auth, Zod validation, error handler
│   │   ├── models/           # User, Category, Task Sequelize models
│   │   ├── routes/           # REST endpoints
│   │   ├── validators/       # Zod schemas
│   │   └── index.js          # Express app entrypoint
│   └── tests/
│       └── api.test.js       # Automated integration test suite
│
└── frontend/
    ├── package.json          # Frontend dependencies
    ├── vite.config.js        # Vite config with API proxy
    ├── index.html            # Entry HTML with Google Fonts
    └── src/
        ├── components/       # Navbar, Sidebar, Modal, ConfirmModal, States
        ├── context/          # AuthContext, ToastContext
        ├── features/         # TaskModal, CategoryModal
        ├── layouts/          # AppLayout
        ├── pages/            # Login, Register, Dashboard, Tasks, Categories
        ├── routes/           # ProtectedRoute, PublicRoute guards
        ├── services/         # API HTTP client wrapper
        ├── index.css         # Modern design tokens & glassmorphism styles
        ├── App.jsx           # Main routing setup
        └── main.jsx          # React DOM render
```

---

## 5. Installation & Setup

### Prerequisites
* Node.js (v18+) and npm
* PostgreSQL (v14+) running locally or via Docker

### 1. Clone & Install Dependencies

From the project root directory:

```bash
# Install root and workspace dependencies
npm run install:all
```

Or install separately:

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```env
# Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_management_db

# Server Configuration
PORT=5050
NODE_ENV=development

# JWT Configuration
JWT_SECRET=super_secret_production_ready_jwt_key_task_mgmt_2026
JWT_EXPIRES_IN=7d

# Client Configuration for CORS
CLIENT_URL=http://localhost:5173
```

### 3. Database Setup & Migrations

Make sure your PostgreSQL database `task_management_db` is created:

```bash
# Example with psql or Docker
createdb -U postgres task_management_db
# Or if using Docker:
docker exec -i <container_name> psql -U postgres -c "CREATE DATABASE task_management_db;"
```

Run Sequelize migrations and seeders:

```bash
cd backend

# Run migrations (creates Users, Categories, Tasks tables)
npm run migrate

# (Optional) Populate demo account and sample tasks
npm run seed
```

**Demo Account Credentials:**
* **Email:** `demo@example.com`
* **Password:** `Password123!`

---

## 6. Running the Application

### Option A: Run Both Services Concurrently (Recommended)

From the root directory:

```bash
npm run dev
```

* **Frontend Dashboard:** `http://localhost:5173`
* **Backend REST API:** `http://localhost:5050`
* **Health Check:** `http://localhost:5050/api/health`

### Option B: Run Services Separately

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 7. Running Automated Tests

A comprehensive integration test suite verifies authentication, Zod validation formatting, full CRUD operations, and strict user ownership isolation:

```bash
cd backend
npm run test:api
```

---

## 8. REST API Documentation

All protected routes require the header:
```http
Authorization: Bearer <token>
```

### Authentication (`/api/auth`)

#### `POST /api/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "Password123!"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "7fa65e9b-466d-4959-a5e2-0401bca09a9a",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "createdAt": "2026-09-07T13:30:00.000Z",
    "updatedAt": "2026-09-07T13:30:00.000Z"
  }
}
```

#### `POST /api/auth/login`
Authenticate existing user and receive JWT.

**Request Body:**
```json
{
  "email": "demo@example.com",
  "password": "Password123!"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "11111111-1111-4111-8111-111111111111",
    "name": "Demo User",
    "email": "demo@example.com"
  }
}
```

#### `GET /api/auth/me` *(Protected)*
Get authenticated user profile.

---

### Tasks (`/api/tasks`) *(All Protected)*

#### `GET /api/tasks`
Retrieve tasks scoped to the authenticated user.

**Query Parameters:**
* `status`: Filter by `PENDING` or `COMPLETED`.
* `categoryId`: Filter by specific category UUID, or `unassigned`.
* `sortBy`: `createdAt`, `updatedAt`, `title`, or `status` (default: `createdAt`).
* `order`: `ASC` or `DESC` (default: `DESC`).
* `search`: Case-insensitive substring search on title and description.

**Response (`200 OK`):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "55555555-5555-4555-8555-555555555551",
      "title": "Complete homepage UI",
      "description": "Design responsive layout with modern glassmorphism.",
      "status": "PENDING",
      "userId": "11111111-1111-4111-8111-111111111111",
      "categoryId": "33333333-3333-4333-8333-333333333333",
      "createdAt": "2026-09-04T13:00:00.000Z",
      "updatedAt": "2026-09-04T13:00:00.000Z",
      "category": {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Design & UI"
      }
    }
  ]
}
```

#### `POST /api/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Implement Zod Validation",
  "description": "Ensure incoming request payloads are strictly validated",
  "status": "PENDING",
  "categoryId": "22222222-2222-4222-8222-222222222222"
}
```

#### `PATCH /api/tasks/:id`
Update an existing task owned by the user.

**Request Body (Partial):**
```json
{
  "status": "COMPLETED"
}
```

#### `DELETE /api/tasks/:id`
Delete a task owned by the user.

---

### Categories (`/api/categories`) *(All Protected)*

* `GET /api/categories`: List user categories with dynamic `taskCount`.
* `POST /api/categories`: Create category (`{ "name": "DevOps" }`).
* `PATCH /api/categories/:id`: Rename category.
* `DELETE /api/categories/:id`: Delete category (sets associated tasks' category to null).

---

### Standard Error Responses

#### Validation Error (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": "Title is required",
    "status": "Status must be either 'PENDING' or 'COMPLETED'"
  }
}
```

#### Unauthorized (`401 Unauthorized`)
```json
{
  "success": false,
  "message": "Authentication token is required"
}
```

#### Conflict (`409 Conflict`)
```json
{
  "success": false,
  "message": "An account with this email already exists",
  "errors": {
    "email": "Email is already registered"
  }
}
```
