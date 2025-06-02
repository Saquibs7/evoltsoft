# Charging Station Management

A full-stack application for managing EV charging stations.

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication

### Frontend
- React with TypeScript
- Tailwind CSS
- React Router
- Axios for API calls
- Leaflet for maps

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Environment Variables

#### Backend (.env file in /backend)
```
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

#### Frontend (.env file in /frontend)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/Saquibs7/evoltsoft.git
cd evoltsoft
```

2. Install dependencies for root, frontend, and backend
```bash
npm run install:all
```

3. Start development servers
```bash
# Run both frontend and backend
npm run dev

# Run only frontend
npm run dev:frontend

# Run only backend
npm run dev:backend
```

### Production Build

1. Build the frontend
```bash
npm run build:frontend
```

2. Build the backend (if needed)
```bash
npm run build:backend
```

## Deployment

### Backend Deployment (Render/Heroku)
1. Create a new web service
2. Connect to your GitHub repository
3. Set environment variables (MONGO_URI, JWT_SECRET, PORT)
4. Deploy the backend

### Frontend Deployment (Netlify/Vercel)
1. Create a new site
2. Connect to your GitHub repository
3. Set build command to `cd frontend && npm run build`
4. Set publish directory to `frontend/dist`
5. Set environment variable VITE_API_BASE_URL to your deployed backend URL

## Features
- User authentication (register/login)
- CRUD operations for charging stations
- Map view of all charging stations
- Filtering stations by status, connector type, and power output
- Light/dark mode theme

## now check README.md file of frontend and backend for more information