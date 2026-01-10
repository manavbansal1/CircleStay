# CircleStay Backend Setup Guide

## Prerequisites
1. Node.js installed
2. Firebase project created

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method

### 3. Get Service Account Key (for Backend)
1. Go to **Project Settings** (gear icon) → **Service Accounts**
2. Click **"Generate New Private Key"**
3. Save the JSON file securely (DO NOT commit to git)
4. Extract the values for your `.env` file

### 4. Get Web API Key (for Frontend)
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Copy the configuration values

## Environment Setup

### Create `.env` file in project root:

```env
# Backend - Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com

# Server
PORT=5000
NODE_ENV=development

# Frontend - Firebase Web SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-web-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Application

### Option 1: Run Both (Recommended)
```bash
npm run dev:all
```
This runs both Next.js (port 3000) and Express server (port 5000)

### Option 2: Run Separately
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server:dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "displayName": "John Doe"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "idToken": "firebase-id-token"
  }
  ```

- `POST /api/auth/logout` - Logout user

- `GET /api/auth/me` - Get current user (requires auth cookie)

## Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","displayName":"Test User"}'
```

## Security Notes
- `.env` file is gitignored - never commit credentials
- Cookies are httpOnly and secure in production
- CORS is configured for localhost:3000
- Update CORS origin for production deployment

## Troubleshooting

### "Firebase Admin initialization failed"
- Check that all Firebase environment variables are set correctly
- Verify the private key format (should include `\n` for newlines)

### CORS errors
- Ensure backend is running on port 5000
- Check that frontend is on port 3000
- Verify credentials: true in CORS config

### Cookie not being set
- Check that you're using `credentials: 'include'` in fetch requests
- Verify cookie settings in auth routes
