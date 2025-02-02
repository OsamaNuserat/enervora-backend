# Enervora

🚀 **Enervora** – A Game-Changer for Coaches & Nutrition Experts!

Enervora is a cutting-edge SaaS platform built with NestJS, designed to connect coaches, nutritionists, and health enthusiasts worldwide. Whether you're looking to share training programs, nutrition plans, or interactive videos, Enervora provides a scalable, secure, and high-performance backend to power your fitness community.

## What Makes Enervora Special?

- **Scalable Architecture:** Built with NestJS, ensuring a modular and maintainable codebase.
- **Secure Authentication:** OAuth-based login with Google and role-based access for admins, coaches, and users.
- **Real-Time Interactions:** Live notifications via Firebase Cloud Messaging and WebSocket integration.
- **Modern DevOps:** Dockerized infrastructure with automated CI/CD pipelines using Jenkins and GitHub Webhooks.
- **Optimized Performance:** Deployed behind Nginx for enhanced security and efficient request handling.

## Key Features

- **Authentication & Authorization:** Secure sign-up and login with Google OAuth and custom role-based access.
- **Subscriptions & Exclusive Content:** Users can subscribe to multiple experts to access premium training programs, meal plans, and videos.
- **Live Notifications:** Real-time updates on new content, messages, and community interactions.
- **Robust API:** Clean, scalable RESTful APIs for managing users, coaches, and gym-related resources.
- **Upcoming Enhancements:**
  - **Shabaka – Real-Time Messaging:** Direct communication between users and experts.
  - **Video Streaming & Media Hosting:** Immersive workout videos and tutorials.
  - **Payment Integration:** Seamless paid subscription management.
  - **Health App Integrations:** Sync with Apple Health, Google Fit, and smartwatches for personalized progress tracking.

## Getting Started

### Prerequisites

- **Node.js** (>=16.x)
- **NPM** (>=8.x) or **Yarn**

### Installation

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/OsamaNuserat/enervora-backend.git
    cd enervora-backend
    ```

2. **Install Dependencies:**

    ```bash
    npm install
    ```

3. **Configure Environment Variables:**

    - Create a `.env` file in the root directory.
    - Add the following configuration:

    ```env
    PORT=3000
    JWT_SECRET=your_jwt_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
    FIREBASE_PROJECT_ID=your_firebase_project_id
    FIREBASE_CLIENT_EMAIL=your_firebase_client_email
    FIREBASE_PRIVATE_KEY=your_firebase_private_key
    ```

4. **Start the Application:**

    ```bash
    npm run start:dev
    ```

    The server will run at [http://localhost:3000](http://localhost:3000).

## API Usage

### Authentication

- **Login via Google:**  
  `[GET] /auth/google`

- **Google OAuth Callback:**  
  `[GET] /auth/google/callback`

### Notifications

- **Send a Notification:**  
  `[POST] /notification/send`  
  **Request Body Example:**

    ```json
    {
      "tokens": ["device_token1", "device_token2"],
      "title": "Notification Title",
      "body": "Notification Body",
      "data": { "key": "value" } // Optional
    }
    ```

### Protected Routes

- **Admin-Only Route:**  
  `[GET] /auth/admin-only`

- **Coach-Only Route:**  
  `[GET] /auth/coach-only`

## Testing the API

1. Start the server.
2. Import the provided Postman Collection.
3. Test the available endpoints using Postman.

## Scripts

| Script       | Description                                    |
| ------------ | ---------------------------------------------- |
| `start`      | Run the app in production mode.                |
| `start:dev`  | Run the app in development mode.               |
| `test`       | Execute the test suite.                        |
| `build`      | Build the app for production deployment.       |

## Folder Structure

```bash
enervora-backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts      # Handles authentication routes
│   │   ├── auth.service.ts         # Contains authentication logic
│   │   ├── auth.module.ts          # Authentication module setup
│   │   ├── strategies/             # OAuth and JWT strategies
│   │   ├── guards/                 # Role-based guards
│   │   └── decorators/             # Custom role-based decorators
│   ├── notification/               # Notification module
│   │   ├── notification.controller.ts  # Handles notification routes
│   │   ├── notification.service.ts     # Contains notification logic
│   │   ├── dto/                  # Data Transfer Objects for notifications
│   │   └── notification.module.ts      # Notification module setup
│   ├── users/                      # User management module
│   └── main.ts                     # Application entry point
├── .env                            # Environment configuration file
├── package.json                    # Project manifest
└── README.md                       # Project documentation (this file)
