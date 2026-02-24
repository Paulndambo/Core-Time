# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Coretime - Personal Life Tracker

## Django REST Backend Integration

This frontend is configured to work with a Django REST backend. The authentication flow uses Google OAuth and integrates with Django's authentication system.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Django REST API Base URL
VITE_API_BASE_URL=http://localhost:8000/api

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Google API Key (required for Google Calendar / Gmail integrations in the frontend)
VITE_GOOGLE_API_KEY=your-google-api-key-here

# Launch scope (optional)
# - mvp: hides unfinished modules by default and routes them to Coming Soon (can preview via ?labs=1)
# - full: shows all modules
VITE_LAUNCH_MODE=mvp
```

### Django Backend Requirements

Your Django backend should have the following endpoints:

1. **POST `/api/auth/google/`** - Authenticate with Google OAuth token
   - Request body: `{ "credential": "google-jwt-token" }`
   - Response: `{ "access": "jwt-access-token", "refresh": "jwt-refresh-token", "user": {...} }`

2. **GET `/api/auth/user/`** - Get current authenticated user
   - Headers: `Authorization: Bearer <access-token>`
   - Response: User object

3. **POST `/api/auth/token/refresh/`** - Refresh access token
   - Request body: `{ "refresh": "refresh-token" }`
   - Response: `{ "access": "new-access-token" }`

### Authentication Flow

1. User clicks Google Sign-In button
2. Frontend receives Google OAuth credential
3. Frontend sends credential to Django backend (`/api/auth/google/`)
4. Django backend validates credential and returns JWT tokens + user data
5. Frontend stores tokens and user data
6. All subsequent API requests include the access token in the Authorization header
7. If access token expires, frontend automatically refreshes it using the refresh token

### API Service

The `src/services/api.js` module provides:
- `authenticateWithGoogle(credential)` - Authenticate with Google
- `getCurrentUser()` - Get current user from backend
- `logout()` - Logout and clear tokens
- `verifyAuth()` - Verify if user is authenticated
- `api.get/post/put/patch/delete()` - Generic API request helpers with automatic token management
