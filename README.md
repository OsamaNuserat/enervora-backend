# VitalityShare

VitalityShare is a backend application built with NestJS, designed to streamline gym coaching services. It provides features like OAuth-based authentication, role-based access control, and scalable APIs for managing users, coaches, and training programs.

## Features
- OAuth authentication with Google.
- Role-based access control for admin, coach, and user roles.
- API endpoints for managing gym-related resources.
- Scalable and modular architecture with NestJS.

## Getting Started

### Prerequisites
- Node.js (>=16.x)
- NPM (>=8.x) or Yarn

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/OsamaNuserat/vitalityshare-backend
    cd vitalityshare-backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up the environment variables:
    - Create a `.env` file in the root directory.
    - Add the following:

    ```env
    PORT=3000
    JWT_SECRET=your_jwt_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
    ```

4. Start the application:

    ```bash
    npm run start:dev
    ```

    The server will run on `http://localhost:3000`.

## Usage

### Authentication
- **Login via Google:** `[GET] /auth/google`
- **Callback after login:** `[GET] /auth/google/callback`

### Protected Routes
- **Admin-only route:** `[GET] /auth/admin-only`
- **Coach-only route:** `[GET] /auth/coach-only`

## Testing API with Postman

1. Start the server.
2. Import the Postman Collection.
3. Use the provided endpoints to test functionality.

## Scripts

| Script        | Description                        |
| ------------- | ---------------------------------- |
| `start`       | Run the app in production.         |
| `start:dev`   | Run the app in development.        |
| `test`        | Run tests.                         |
| `build`       | Build the app for production.     |

## Folder Structure

```bash
src/
├── auth/
│   ├── auth.controller.ts   # Handles authentication routes
│   ├── auth.service.ts      # Contains authentication logic
│   ├── auth.module.ts       # Auth module setup
│   ├── strategies/          # OAuth and JWT strategies
│   ├── guards/              # Role-based guards
│   └── decorators/          # Custom role-based decorators
├── users/                   # User management module
└── main.ts                  # Application entry point
