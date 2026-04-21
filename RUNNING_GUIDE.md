# Productivity Web App Running Guide

## 1. Project Structure

- Backend: `backend`
- Frontend: `frontend/productivty`
- Old reference backend: `../sample` relative to this repo root

## 2. What Is Implemented Now

### Backend features available

- Notes CRUD
- Note autosave
- Note pin/unpin
- Note tag attach/remove
- Topics CRUD
- Tags CRUD
- Auth backend endpoints
- Flashcard backend endpoints
- Summary backend endpoints
- Video-note backend endpoints
- JWT security infrastructure is added
- Current note/topic/tag APIs are still public so the existing frontend works without login

### Frontend features available

- Dashboard
- Notes page
- Note editor page
- Topics page
- Tags page
- Sidebar tag loading
- Backend base URL is configurable with `REACT_APP_API_BASE_URL`

### Important status

- Planner module files still exist, but there are no active planner REST endpoints in the current codebase.
- Flashcards, summary, and video-note backend APIs are implemented, but the current frontend pages for those features are still placeholders.
- External AI/video services require API keys. Without keys, those endpoints return controlled errors instead of crashing startup.

## 3. Prerequisites

- Java 21
- Node.js 18+ and npm
- MySQL server running on your machine
- MySQL Workbench is optional as a client tool only

Important:
- MySQL Workbench does not run the database server by itself.
- You must have MySQL Server running through MySQL installer, XAMPP, MAMP, Homebrew, or another service manager.

## 4. Database Setup

Default database settings used by the backend:

- Host: `localhost`
- Port: `3306`
- Database: `productivity_db`
- Username: `root`
- Password: empty by default unless you override it

The backend JDBC URL is configured to auto-create the database if it does not exist.

You can create it manually if you want:

```sql
CREATE DATABASE productivity_db;
```

## 5. Backend Environment Variables

Reference file:
- [backend/.env.example](/Users/dulina/Documents/OutSourse/Productivity_Web_App/backend/.env.example)

Variables:

- `APP_PORT`
- `APP_DB_HOST`
- `APP_DB_PORT`
- `APP_DB_NAME`
- `APP_DB_USERNAME`
- `APP_DB_PASSWORD`
- `APP_CORS_ALLOWED_ORIGINS`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `SERPAPI_KEY`
- `GITHUB_MODELS_TOKEN`
- `GITHUB_MODELS_BASE_URL`
- `GITHUB_MODELS_MODEL`

Important:
- Spring Boot does not automatically load `backend/.env.example`.
- For backend runtime, export these variables in your shell or set them in your IDE run configuration.

Example:

```bash
cd /Users/dulina/Documents/OutSourse/Productivity_Web_App/backend

export APP_DB_HOST=localhost
export APP_DB_PORT=3306
export APP_DB_NAME=productivity_db
export APP_DB_USERNAME=root
export APP_DB_PASSWORD=
export JWT_SECRET=change-this-jwt-secret-before-production-use-1234567890
export JWT_EXPIRATION=86400000
export APP_CORS_ALLOWED_ORIGINS=http://localhost:3000
```

If you want summary, flashcard, and video transcript features to work:

```bash
export SERPAPI_KEY=your_real_serpapi_key
export GITHUB_MODELS_TOKEN=your_real_github_models_token
export GITHUB_MODELS_BASE_URL=https://models.github.ai/inference
export GITHUB_MODELS_MODEL=your_model_name
```

## 6. Frontend Environment Variables

Reference file:
- [frontend/.env.example](/Users/dulina/Documents/OutSourse/Productivity_Web_App/frontend/productivty/.env.example)

Create:

```bash
cd /Users/dulina/Documents/OutSourse/Productivity_Web_App/frontend/productivty
cp .env.example .env
```

Default:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

## 7. How To Run The Backend

From:
- `/Users/dulina/Documents/OutSourse/Productivity_Web_App/backend`

Run:

```bash
sh mvnw spring-boot:run
```

Backend base URL:

- `http://localhost:8080`

If you get a database connection error:

1. Confirm MySQL server is running.
2. Confirm port `3306` is correct.
3. Confirm username/password match your local MySQL setup.
4. Export `APP_DB_*` values again and retry.

## 8. How To Run The Frontend

From:
- `/Users/dulina/Documents/OutSourse/Productivity_Web_App/frontend/productivty`

Install dependencies if needed:

```bash
npm install
```

Run:

```bash
npm start
```

Frontend URL:

- `http://localhost:3000`

## 9. How To Run Tests And Builds

### Backend test

```bash
cd /Users/dulina/Documents/OutSourse/Productivity_Web_App/backend
sh mvnw test
```

Notes:
- This uses the test profile with H2.
- It does not require local MySQL.

### Frontend production build

```bash
cd /Users/dulina/Documents/OutSourse/Productivity_Web_App/frontend/productivty
npm run build
```

## 10. Backend API Summary

### Notes

- `GET /api/notes`
- `GET /api/notes/{id}`
- `POST /api/notes`
- `PUT /api/notes/{id}`
- `PATCH /api/notes/{id}/autosave`
- `DELETE /api/notes/{id}`
- `PATCH /api/notes/{id}/pin`
- `POST /api/notes/{noteId}/tags/{tagId}`
- `DELETE /api/notes/{noteId}/tags/{tagId}`

### Topics

- `GET /api/topics`
- `GET /api/topics/{id}`
- `POST /api/topics`
- `PUT /api/topics/{id}`
- `DELETE /api/topics/{id}`

### Tags

- `GET /api/tags`
- `GET /api/tags/{id}`
- `POST /api/tags`
- `PUT /api/tags/{id}`
- `DELETE /api/tags/{id}`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Important:
- JWT infrastructure exists.
- Current security config still permits all requests so the old frontend works.
- `GET /api/auth/me` still requires a valid authenticated context to be useful.

### Flashcards

- `POST /api/notes/{noteId}/flashcards/generate`
- `GET /api/notes/{noteId}/flashcards`
- `DELETE /api/notes/{noteId}/flashcards/{flashcardId}`

### Summary

- `POST /api/notes/{noteId}/summarize`
- `GET /api/notes/{noteId}/summary`

### Video Notes

- `POST /api/notes/{noteId}/video`
- `GET /api/notes/{noteId}/video`
- `DELETE /api/notes/{noteId}/video`
- `POST /api/notes/{noteId}/video/refresh-transcript`

## 11. Manual Feature Check List

### A. Notes flow

1. Open frontend at `http://localhost:3000`
2. Go to `Notes`
3. Create a topic
4. Create a tag
5. Create a note
6. Edit the note title/content
7. Pin the note
8. Attach a tag to the note
9. Filter by topic/tag
10. Delete the note

Expected:
- All actions should succeed without login.
- Errors should show in the UI if backend returns validation or service errors.

### B. Topics flow

1. Go to `Topics`
2. Create a topic
3. Edit the topic
4. Delete the topic

### C. Tags flow

1. Go to `Tags`
2. Create a tag
3. Edit the tag
4. Delete the tag

### D. Auth backend

Example register:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "email":"test@example.com",
    "password":"password123"
  }'
```

Example login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "password":"password123"
  }'
```

### E. Summary backend

Requires `GITHUB_MODELS_*` variables.

```bash
curl -X POST http://localhost:8080/api/notes/1/summarize
```

### F. Flashcards backend

Requires `GITHUB_MODELS_*` variables.

```bash
curl -X POST http://localhost:8080/api/notes/1/flashcards/generate
```

### G. Video-note backend

Requires `SERPAPI_KEY`.

```bash
curl -X POST http://localhost:8080/api/notes/1/video \
  -H "Content-Type: application/json" \
  -d '{
    "youtubeUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "videoTitle":"Example Video"
  }'
```

## 12. Verified Status From This Implementation

### Verified by command

- Backend test profile passes: `sh mvnw test`
- Frontend build passes: `npm run build`

### Not fully verified in this environment

- Live backend startup against your real MySQL instance
- End-to-end UI clicks against a running local backend and browser
- Summary/flashcard/video external integrations with real API keys

## 13. Known Limitations

- Planner API is not active in the current codebase.
- Flashcards, summary, and video-note frontend pages are not wired to the backend yet.
- Frontend build still reports existing ESLint warnings in React files, but it builds successfully.
- Backend auth exists, but the current frontend does not yet use login/token flow.

## 14. Useful File References

- Backend config: [application.properties](/Users/dulina/Documents/OutSourse/Productivity_Web_App/backend/src/main/resources/application.properties)
- Backend env reference: [backend/.env.example](/Users/dulina/Documents/OutSourse/Productivity_Web_App/backend/.env.example)
- Frontend env reference: [frontend/.env.example](/Users/dulina/Documents/OutSourse/Productivity_Web_App/frontend/productivty/.env.example)
- Frontend API base URL: [axiosInstance.js](/Users/dulina/Documents/OutSourse/Productivity_Web_App/frontend/productivty/src/api/axiosInstance.js)
- Frontend routes: [App.js](/Users/dulina/Documents/OutSourse/Productivity_Web_App/frontend/productivty/src/App.js)
