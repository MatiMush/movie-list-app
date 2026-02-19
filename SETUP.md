# Setup Guide

## Prerequisites
- Node.js 18+
- A MongoDB Atlas account and cluster

## Backend Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Update `.env` with:
```
PORT=5000
TMDB_API_KEY=your_tmdb_api_key_here
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/movieapp?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here
```

### 3. Start the backend
```bash
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
MongoDB connected successfully
```

## Frontend Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Start the frontend
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Testing the Authentication Flow

1. Open `http://localhost:5173` in your browser
2. Click **Register** in the header
3. Fill in your name, email, and password (min 6 chars)
4. After registration, the header shows "Welcome, [Your Name]! 👋"
5. Click **Logout** to sign out
6. Click **Login** and sign in with your credentials
7. The protected route `/api/auth/me` works with a valid JWT token

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | /api/auth/register | Register a new user | No |
| POST | /api/auth/login | Login with email/password | No |
| GET | /api/auth/me | Get current user info | Yes (Bearer token) |
