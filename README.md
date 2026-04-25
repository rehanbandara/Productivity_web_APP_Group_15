# Campus Operations Hub (PAF 2026 Group Project)

A full‑stack university operations platform to manage **campus resources**, **facility reservations (bookings)**, **maintenance/support tickets**, and **role‑based administration** (Admin / Technician / User), with in‑app notifications and preferences.

---

## Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Roles & Access](#roles--access)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup (MySQL)](#database-setup-mysql)
  - [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
- [Admin / Technician Setup (SQL)](#admin--technician-setup-sql)
- [API & Auth Notes](#api--auth-notes)
- [Troubleshooting](#troubleshooting)
- [System Modules by Member](#system-modules-by-member)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

**Smart Campus Operations Hub** centralizes day‑to‑day campus operations into one system:

- **Students / campus users** can browse resources, request reservations, and raise support requests.
- **Admins (university staff)** can manage resources, review reservations, oversee tickets, and manage users.
- **Technicians** can handle assigned support requests and update ticket status.

The platform is built with a **React frontend** and a **Spring Boot REST API backend**, using **JWT-based security** and optional **OAuth2 login**.

---

## Key Features

### Resources
- View resources (lecture halls, labs, meeting rooms, equipment)
- Admin CRUD for resources (create/update/delete)
- Resource availability window + status

### Reservations / Bookings
- User reservation request workflow
- Admin review: approve/reject with remarks
- Status tracking (Pending, Approved, Rejected, Cancelled)

### Maintenance / Tickets
- User ticket creation
- Ticket assignment and technician workflow (Open → In Progress → Resolved → Closed)
- Attachments/images (if enabled in backend)

### Notifications
- Notification panel + notifications page
- User notification preferences (enable/disable types)

### Security
- JWT authentication (token contains `email`, `role`, `userId`)
- Role-based route protection in frontend
- Role-based API authorization in backend

---

## Roles & Access

| Role | Description | Frontend Routes |
|------|-------------|-----------------|
| `USER` | Students / campus users | `/user/*` |
| `ADMIN` | University staff admins | `/admin/*` |
| `TECHNICIAN` | Maintenance/support staff | `/technician/*` |


---

## Tech Stack

**Frontend**
- React + Vite
- React Router
- TailwindCSS
- Axios
- lucide-react
- react-hot-toast

**Backend**
- Java Spring Boot
- Spring Security (JWT + OAuth2)
- Spring Data JPA (Hibernate)
- MySQL

---

## Repository Structure

### Frontend 
```
src/
  api/
  assets/
  components/
  context/
  pages/
    admin/
    auth/
    technician/
    user/
  utils/
  App.jsx
  main.jsx
```

### Backend 
```
src/main/java/com/smartcampus/backend/
  config/
  controller/
  dto/
  exception/
  model/
  repository/
  service/
```

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- Java 17+
- Maven (or Gradle)
- MySQL + MySQL Workbench

---

## Database Setup (MySQL)

1. Create database:
```sql
CREATE DATABASE smart_campus;
```

2. Configure DB credentials in backend `application.properties`.

---

## Backend Setup (Spring Boot)

From `smart-campus-api/`:

```bash
mvn clean package
mvn spring-boot:run
```

Backend default:
- `http://localhost:8080`

---

## Frontend Setup (React + Vite)

From `smart-campus-client/`:

```bash
npm install
npm run dev
```

Frontend default:
- `http://localhost:5173`

---

## Admin / Technician Setup (SQL)

To access:
- Admin dashboard: `http://localhost:5173/admin/dashboard`
- Technician dashboard: `http://localhost:5173/technician/dashboard`

### 1) Register users normally
Use the UI:
- `http://localhost:5173/register`

(Recommended so passwords are stored correctly using BCrypt.)

### 2) Assign roles in MySQL
Find user id:
```sql
SELECT id, email FROM users WHERE email='your-email@example.com';
```

Check `user_roles` columns:
```sql
SHOW COLUMNS FROM user_roles;
```

Assign role (most schemas use `roles` as the column name):
```sql
INSERT IGNORE INTO user_roles (user_id, roles)
VALUES (<USER_ID>, 'ADMIN');
```

Technician:
```sql
INSERT IGNORE INTO user_roles (user_id, roles)
VALUES (<USER_ID>, 'TECHNICIAN');
```

Then **log out and log in again** so a new JWT is generated with the updated role.

---

## API & Auth Notes

- Client API base path: `/api/v1`
- JWT is attached automatically by Axios interceptor:
  - `Authorization: Bearer <token>`
- Backend JWT filter maps role to Spring Security authority:
  - `ROLE_<role>` (example: `ROLE_ADMIN`)

---

## Troubleshooting

### `/admin/dashboard` redirects to `/user/dashboard`
- Check the browser localStorage:
  - `role` must be `ADMIN`
- Ensure backend login returns deterministic role selection if user has multiple roles.

### White screen on a page
- Open browser DevTools Console for runtime errors (missing import, undefined symbol, etc.).

### Role update fails with Hibernate `UnsupportedOperationException`
- Do not assign roles using immutable sets (`Set.of(...)`) for JPA-managed collections.
- Use mutable `HashSet` instead.

---

## System Modules by Member

### Member 1 – Facilities & Resources
- Add/update/delete/view campus resources
- Search/filter and maintain accurate resource data for bookings

### Member 2 – Booking Management
- Booking request workflow
- Admin approval/rejection and conflict prevention

### Member 3 – Maintenance & Ticketing
- Incident/support tickets with status tracking
- Attachments and technician assignment

### Member 4 – Authentication, Notifications & Security
- OAuth2 login, JWT security, RBAC
- Notifications and preferences
- CI/CD support (GitHub Actions)

---



---

## License
Academic project for PAF 2026. Add an open-source license.
