# Charging Station Management Frontend

A React TypeScript application for managing EV charging stations.

## Features

- User authentication (login/register)
- Dashboard with station statistics
- List view of charging stations with filtering
- Map view with interactive markers
- Add, edit, and delete charging stations
- Light and dark mode theme

## Tech Stack

- React with TypeScript
- React Router for navigation
- Zustand for state management
- Axios for API requests
- Leaflet for maps
- Tailwind CSS for styling
- React Toastify for notifications

## Setup

### Prerequisites

- Node.js (v16+)
- Backend API running (see backend README)

### Installation

1. Install dependencies
```bash
npm install
```

2. Set up environment variables
```bash
# Create a .env file with:
VITE_API_BASE_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

This will create a `dist` directory with the compiled assets.

## Deployment

1. Build the project
```bash
npm run build
```

2. Deploy the `dist` directory to your hosting provider (Netlify, Vercel, etc.)

3. Set the environment variable `VITE_API_BASE_URL` to point to your deployed backend API

## Project Structure

- `/src/components`: Reusable UI components
- `/src/pages`: Page components for different routes
- `/src/store`: Zustand state management
- `/src/utils`: Utility functions and API configuration
- `/src/assets`: Static assets like images and icons