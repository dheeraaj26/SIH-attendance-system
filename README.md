# Rural School Attendance Web Application

## Overview
This project is a web application designed for rural school attendance management with the following key features:
- Face recognition attendance using built-in camera (MediaPipe)
- Offline-first data storage (IndexedDB on client, SQLite on server)
- Automatic synchronization with government APIs (PM POSHAN, SSA, State portals)
- Multi-language support (Hindi, English, Punjabi, etc.)
- Parent SMS notifications (Twilio integration)
- UI optimized for low-end Android devices
- Extensible architecture for future features like voice messaging, parent apps, analytics dashboards

## Folder Structure
- `/frontend` - React frontend application (PWA enabled)
  - `/src/components` - UI components
  - `/src/i18n` - Internationalization setup and language files
  - `/src/services` - Client-side services (face recognition, offline storage, sync)
  - `/public` - Static assets and service worker
- `/backend` - Node.js/Express backend API server
  - `/routes` - API route handlers
  - `/models` - Database models (SQLite)
  - `/services` - External integrations (government APIs, SMS)
  - `/config` - Configuration and environment variables
- `/shared` - Shared utilities and types (if needed)

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- SQLite3

### Installation

1. Clone the repository and navigate to the project directory:
   ```
   cd rural-school-attendance
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

- Start the backend server (default port 5000):
  ```
  cd backend
  npm start
  ```

- Start the frontend development server (default port 3000):
  ```
  cd ../frontend
  npm start
  ```

### Modifying the Application

- **Frontend UI Components:** Add or modify components in `frontend/src/components`.
- **Backend API Routes:** Add or modify routes in `backend/routes`.
- **Database Schema:** Modify SQLite models in `backend/models`. Use migrations for schema changes.
- **Internationalization:** Add new languages or update translations in `frontend/src/i18n`.
- **Offline Storage & Sync:** Modify client-side sync logic in `frontend/src/services`.
- **SMS Notifications:** Update SMS service integration in `backend/services/smsService.js`.

## Architecture Notes

- The frontend is a React PWA with offline-first capabilities using IndexedDB and service workers.
- Face recognition uses MediaPipe integrated in the frontend.
- Backend uses Express with SQLite for data persistence.
- Synchronization with government APIs is handled by backend services with scheduled jobs or API endpoints.
- SMS notifications are sent via Twilio API.
- Configuration is managed via environment variables in `.env` files.
- Error handling uses centralized middleware on backend and React error boundaries on frontend.
- The codebase is modular to allow easy addition of new features like voice messaging, parent apps, and analytics dashboards.

## Future Enhancements

- Add voice messaging support.
- Develop dedicated parent mobile apps.
- Build analytics dashboards for school administrators.
