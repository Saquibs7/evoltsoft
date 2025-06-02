# Charging Station Management Backend

A RESTful API for managing EV charging stations built with Node.js, Express, and MongoDB.

## Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

1. Install dependencies
```bash
npm install
```

2. Set up environment variables
```bash
cp .env.example .env
```
Then edit the `.env` file with your MongoDB connection string and JWT secret.

### Running the Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register a new user
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "saquib",
    "email": "saquib@example.com",
    "password": "password123"
  }
  ```
- **Response**: User object with JWT token

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "saquib@example.com",
    "password": "password123"
  }
  ```
- **Response**: User object with JWT token

#### Get user profile
- **URL**: `/api/auth/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User object (without password)

### Charging Stations

#### Create a new station
- **URL**: `/api/stations`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Downtown Charger",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "status": "Active",
    "powerOutput": 150,
    "connectorType": "CCS"
  }
  ```
- **Response**: Created station object

#### Get all stations (with optional filters)
- **URL**: `/api/stations`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: Filter by status (`Active` or `Inactive`)
  - `connectorType`: Filter by connector type(s) (comma-separated: `Type1,Type2,CCS,CHAdeMO`)
  - `minPower`: Minimum power output in kW
  - `maxPower`: Maximum power output in kW
- **Response**: Array of station objects

#### Get a single station
- **URL**: `/api/stations/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Station object

#### Update a station
- **URL**: `/api/stations/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Any fields to update (same format as create)
- **Response**: Updated station object

#### Delete a station
- **URL**: `/api/stations/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

## Example Requests

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"saquib","email":"saquib@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"saquib@example.com","password":"password123"}'
```

### Create a charging station
```bash
curl -X POST http://localhost:5000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Downtown Charger","location":{"latitude":40.7128,"longitude":-74.0060},"status":"Active","powerOutput":150,"connectorType":"CCS"}'
```

### Get all stations with filters
```bash
curl -X GET "http://localhost:5000/api/stations?status=Active&connectorType=CCS,Type2&minPower=50" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```