# Movie List App

A monorepo movie list application with React frontend and Express backend.

## 🏗️ Project Structure

```
movie-list-app/
├── package.json          # Root monorepo package
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── backend/             # Express + TypeScript API
    ├── src/
    │   ├── server.ts    # Main server file
    │   ├── controllers/
    │   └── routes/
    ├── tsconfig.json
    └── package.json
```

## 🚀 Tech Stack

### Frontend
- **React 18.2** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Express 4.18** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables
- **Axios** - HTTP client (for TMDB API)

## 📦 Installation

### Install all dependencies:

```bash
# Option 1: Using the root install script
npm run install:all

# Option 2: Install individually
npm install              # Root dependencies
cd frontend && npm install
cd ../backend && npm install
```

## 🏃 Running the Application

### Run both frontend and backend:

```bash
# From root directory
npm run dev
```

### Run individually:

```bash
# Backend only (runs on port 5000)
npm run dev:backend

# Frontend only (runs on port 3000)
npm run dev:frontend
```

## 🔨 Building

```bash
# Build both
npm run build

# Build individually
npm run build:backend
npm run build:frontend
```

## 🌐 API Endpoints

### Backend Server (Port 5000)

- `GET /` - Server status
- `GET /api/health` - Health check
- `GET /api/movies/search` - Search movies (TMDB API)
- `GET /api/movies/popular/movies` - Get popular movies
- `GET /api/movies/popular/series` - Get popular TV series

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
TMDB_API_KEY=your_tmdb_api_key_here
```

## 🛠️ Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5000

## 📄 License

ISC