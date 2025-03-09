# Scavenger Hunt Generator - Design Document

## Overview

The Scavenger Hunt Generator is a web application that allows users to create and participate in location-based scavenger hunts. Admins create hunts with a unique code, clues (addresses converted to coordinates via the Google Geocoding API), a prize, and an admin password for management. Participants join using the hunt code and their name, progressing through clues by matching their GPS location to clue coordinates.

This document outlines the architecture, technologies, data models, and key workflows of the application.

---

## Architecture

The application follows a client-server architecture with a RESTful API backend and a standalone Angular frontend, both deployed as Docker containers:

### Backend
- **Framework**: Node.js with Express
- **Database**: MongoDB (via Mongoose ORM)
- **External Services**: Google Geocoding API (for converting addresses to latitude/longitude)
- **Hosting**: Docker container, built from a `Dockerfile` in `/backend`

### Frontend
- **Framework**: Angular (standalone components, v19.x)
- **UI Library**: Angular Material
- **Hosting**: Docker container, built from a `Dockerfile` in `/frontend`, served as a static app via Nginx

### Communication
- **API**: RESTful endpoints over HTTP
- **Data Format**: JSON
- **CORS**: Enabled for development, configured for frontend container in production

### Deployment
- **Development**: Separate backend (`localhost:3000`) and frontend (`localhost:4200`) servers
- **Production**: Docker Compose orchestrates backend, frontend, and MongoDB containers with a persisted data volume

---

## Technologies

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework for routing and middleware
- **Mongoose**: MongoDB object modeling
- **Axios**: HTTP client for Google Geocoding API requests
- **Geolib**: Library for distance calculations between coordinates
- **CORS**: Cross-origin resource sharing for frontend access
- **Dotenv**: Environment variable management

### Frontend
- **Angular**: Framework for building the single-page application
- **Angular Material**: UI components (e.g., forms, buttons)
- **RxJS**: Reactive programming for HTTP and geolocation handling
- **TypeScript**: Static typing for JavaScript
- **Nginx**: Static file server in production Docker container

### Database
- **MongoDB**: NoSQL database for storing hunt data, deployed as a Docker container

### External APIs
- **Google Geocoding API**: Converts clue addresses to latitude/longitude coordinates

### DevOps
- **Docker**: Containerization for backend, frontend, and MongoDB
- **Docker Compose**: Multi-container orchestration with persisted MongoDB volume

---

## Data Model

### Hunt (MongoDB Schema)
Stored in the `hunts` collection:
```typescript
{
  code: String,              // Unique identifier for the hunt (e.g., "HUNT123")
  clues: [{
    description: String,     // Clue text (e.g., "Find the big tree")
    address: String,         // Optional address (e.g., "350 5th Ave, New York, NY")
    latitude: Number,        // Geocoded latitude
    longitude: Number        // Geocoded longitude
  }],
  prize: String,             // Reward for completing the hunt (e.g., "Gold")
  adminPassword: String,     // Password for admin access (plain text, hash in production)
  participants: [{
    name: String             // Participant's name (e.g., "Jack")
  }],
  maxDistance: Number        // Max distance between clues (default 20 miles)
}
```

- **Indexes**: Unique index on `code` for fast lookups.
- **Notes**: `adminPassword` is currently plain text; production should use `bcrypt` for hashing.

---

## Key Workflows

### 1. Hunt Creation (Admin)
- **User**: Admin visits `/admin` on the frontend.
- **Input**: Enters hunt code, clues (with addresses), prize, and admin password.
- **Frontend**: Submits data to `POST /api/hunts/create`.
- **Backend**:
  - Validates required fields (`code`, `clues`, `prize`, `adminPassword`).
  - Uses Google Geocoding API to convert each clue’s address to `{ latitude, longitude }`.
  - Checks clue locations are within `maxDistance` (20 miles) of the first clue using `geolib`.
  - Saves hunt to MongoDB.
- **Response**: Returns created hunt object; frontend redirects to `/hunt/:code`.

### 2. Joining a Hunt (Participant)
- **User**: Participant visits `/hunt` (or `/hunt/:code`) on the frontend.
- **Input**: Enters hunt code and their name.
- **Frontend**: Submits to `POST /api/hunts/join`.
- **Backend**:
  - Finds hunt by `code`.
  - Adds participant to `participants` array if not already present.
  - Returns updated hunt object.
- **Frontend**: Loads first clue and starts GPS tracking.

### 3. Progressing Through Clues
- **User**: Participant clicks "Check Location" on the frontend.
- **Frontend**:
  - Uses `navigator.geolocation` via `LocationService` to get current `{ latitude, longitude }`.
  - Compares with current clue’s coordinates (within 0.01 degrees, ~1km for testing).
  - If matched, removes the clue and loads the next one or shows the prize.
- **Notes**: No backend update is needed unless tracking participant progress persistently.

### 4. Admin Validation
- **User**: Admin submits code and password to validate ownership.
- **Frontend**: Sends to `POST /api/hunts/validate-admin`.
- **Backend**:
  - Finds hunt by `code`.
  - Compares `adminPassword` with stored value.
  - Returns success or error.
- **Notes**: Currently unused in UI; could be expanded for a management dashboard.

---

## API Endpoints

### `POST /api/hunts/create`
- **Body**: `{ code, clues: [{ description, address }], prize, adminPassword }`
- **Response**: `201` with hunt object or `400`/`500` with error

### `GET /api/hunts/:code`
- **Params**: `code` (e.g., "HUNT123")
- **Response**: `200` with hunt object or `404` with error

### `POST /api/hunts/join`
- **Body**: `{ code, name }`
- **Response**: `200` with updated hunt object or `404`/`500` with error

### `POST /api/hunts/validate-admin`
- **Body**: `{ code, adminPassword }`
- **Response**: `200` with success message or `403`/`404` with error

---

## Deployment with Docker

### Dockerfiles
- **Backend (`/backend/Dockerfile`)**:
  ```dockerfile
  FROM node:18
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 3000
  CMD ["npm", "start"]
  ```

- **Frontend (`/frontend/Dockerfile`)**:
  ```dockerfile
  # Build stage
  FROM node:18 AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  RUN npm run build

  # Production stage
  FROM nginx:alpine
  COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

### Docker Compose
- **File**: `/docker-compose.yml`
- **Content**:
  ```yaml
  version: '3.8'
  services:
    backend:
      build: ./backend
      ports:
        - "3000:3000"
      environment:
        - MONGO_URI=mongodb://mongo:27017/scavenger-hunt
        - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      depends_on:
        - mongo
      networks:
        - app-network

    frontend:
      build: ./frontend
      ports:
        - "80:80"
      depends_on:
        - backend
      networks:
        - app-network

    mongo:
      image: mongo:latest
      ports:
        - "27017:27017"
      volumes:
        - mongo-data:/data/db
      networks:
        - app-network

  volumes:
    mongo-data:
      driver: local

  networks:
    app-network:
      driver: bridge
  ```

- **Notes**:
  - **MongoDB Persistence**: The `mongo-data` volume persists data in `/data/db`.
  - **Networking**: All services share an `app-network` for internal communication.
  - **Environment**: `GOOGLE_API_KEY` is passed via a `.env` file or system environment variable.

### Deployment Steps
1. Build and run:
   ```bash
   docker-compose up -d --build
   ```
2. Access:
   - Frontend: `http://localhost` (port 80)
   - Backend API: `http://localhost:3000`
   - MongoDB: `mongodb://localhost:27017` (if exposed locally)

---

## Security Considerations

- **Admin Password**: Stored as plain text in MongoDB. Use `bcrypt` to hash passwords in production:
  ```bash
  npm install bcrypt
  ```
  Update `huntController.ts` to hash on creation and compare on validation.
- **Google API Key**: Exposed in `.env`. Restrict API key usage to specific domains/IPs in Google Cloud Console.
- **CORS**: Configured in backend to allow frontend container (`http://frontend`) in production.
- **Input Validation**: Basic checks exist; add sanitization (e.g., `express-validator`) to prevent injection.
- **Docker**: Use non-root users in containers for production security.

---

## Future Enhancements

- **Admin Dashboard**: Add UI at `/admin/manage/:code` to edit hunts, requiring `validate-admin`.
- **Real-Time Updates**: Use WebSockets (e.g., Socket.IO) to show participant progress live.
- **Tighter GPS**: Reduce location threshold from 0.01 (~1km) to 0.0001 (~10m) for production.
- **User Accounts**: Replace admin password with user authentication (e.g., JWT).
- **Clue Media**: Support images or PDFs for clues, stored in MongoDB GridFS or cloud storage.

---

## Development Notes

- **Testing**: Use Postman or `curl` to test API endpoints (see root README for examples).
- **Frontend**: Standalone components simplify dependency management but require explicit imports.
- **Backend**: Nodemon (`npm run dev`) auto-restarts on changes for development.
- **Docker**: Ensure Docker Desktop or Docker Engine is installed for local testing.
