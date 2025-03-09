```markdown
# Scavenger Hunt Generator

A web app for creating and participating in scavenger hunts. Admins can create hunts with clues based on addresses (converted to coordinates using the Google Geocoding API) and a unique code and admin password. Participants join by entering the hunt code and their name, progressing through clues using GPS location tracking.

## Setup (Development)

1. **Clone the Repository**:
   ```bash
   git clone <repo-url>
   cd ScavengerHunt
   ```

2. **Install Dependencies**:
   - Backend:
     ```bash
     cd backend
     npm install
     ```
   - Frontend:
     ```bash
     cd frontend
     npm install
     ```

3. **Configure Environment Variables**:
   - In `/backend`, create a `.env` file:
     ```plaintext
     MONGO_URI=mongodb://localhost:27017/scavenger-hunt
     PORT=3000
     GOOGLE_API_KEY=your-google-api-key-here
     ```
     Replace `your-google-api-key-here` with your Google Cloud API key (enable the Geocoding API in Google Cloud Console).

4. **Start MongoDB**:
   - Locally:
     ```bash
     mongod
     ```
   - Or via Docker:
     ```bash
     docker run -d -p 27017:27017 --name mongo mongo
     ```

5. **Run Development Servers**:
   - Backend:
     ```bash
     cd backend
     npm run dev
     ```
     Runs on `http://localhost:3000`.
   - Frontend:
     ```bash
     cd frontend
     ng serve
     ```
     Runs on `http://localhost:4200`.

## Setup (Production)

1. **Build and Run with Docker**:
   - Ensure you have a `docker-compose.yml` file (see below for an example).
   - From the root directory:
     ```bash
     docker-compose up -d --build
     ```
   - Access the app at `http://<vps-ip>` (default port 80 unless changed).

2. **Example `docker-compose.yml`**:
   ```yaml
   version: '3'
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
     frontend:
       build: ./frontend
       ports:
         - "80:80"
     mongo:
       image: mongo
       ports:
         - "27017:27017"
   ```

   Set `GOOGLE_API_KEY` in a `.env` file or as an environment variable on your VPS.

## Configuration

- **Backend**: Configure secrets in `/backend/.env`:
  - `MONGO_URI`: MongoDB connection string.
  - `PORT`: Backend server port (default 3000).
  - `GOOGLE_API_KEY`: Google Geocoding API key for address-to-coordinate conversion.

- **Frontend**: Configure environment variables in `/frontend/src/environments`:
  - `environment.ts` (development):
    ```typescript
    export const environment = {
      production: false,
      apiUrl: 'http://localhost:3000/api/hunts'
    };
    ```
  - `environment.prod.ts` (production):
    ```typescript
    export const environment = {
      production: true,
      apiUrl: 'http://<vps-ip>/api/hunts'
    };
    ```

## Design Document

See `/docs/design.md` for architecture details, including:
- Backend: Node.js/Express with MongoDB and Google Geocoding API integration.
- Frontend: Angular (standalone components) with Angular Material UI.

## Features

- **Admin**: Create hunts with a unique code, admin password, clues (addresses converted to lat/lon), and a prize.
- **Participant**: Join hunts by code and name, track progress with GPS.
- **Location**: Uses browser geolocation to verify clue completion (~1km radius for testing).

## Notes

- Ensure MongoDB is running before starting the backend.
- For production, secure the Google API key and consider hashing the admin password with `bcrypt`.


## Deployment Instructions

1. **Place Files**:
   - Save `backend/Dockerfile` in `/backend`.
   - Save `frontend/Dockerfile` in `/frontend`.
   - Save `docker-compose.yml` in the root directory.

2. **Create `.env` for Docker Compose** (optional):
   ```plaintext
   GOOGLE_API_KEY=your-google-api-key-here
   ```
   Place it in the root directory and ensure it’s loaded by Docker Compose.

3. **Build and Run**:
   ```bash
   docker-compose up -d --build
   ```

4. **Verify**:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost:3000`
   - MongoDB: `mongodb://localhost:27017` (if testing locally).

5. **Stop and Clean Up**:
   ```bash
   docker-compose down
   # To remove volumes (loses data):
   docker-compose down -v
   ```