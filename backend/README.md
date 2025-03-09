# Scavenger Hunt Backend

This is the backend for the Scavenger Hunt Generator web app, built with Node.js, Express, and MongoDB. It handles hunt creation, participant joining, and admin validation, integrating the Google Geocoding API to convert clue addresses into latitude/longitude coordinates.

## Setup (Development)

1. **Navigate to Backend Directory**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Create a `.env` file in the `backend` directory:
     ```plaintext
     MONGO_URI=mongodb://localhost:27017/scavenger-hunt
     PORT=3000
     GOOGLE_API_KEY=your-google-api-key-here
     ```
     - `MONGO_URI`: MongoDB connection string.
     - `PORT`: Server port (default 3000).
     - `GOOGLE_API_KEY`: Google Cloud API key (enable Geocoding API in Google Cloud Console).

4. **Start MongoDB**:
   - Locally:
     ```bash
     mongod
     ```
   - Or via Docker (from root directory):
     ```bash
     docker run -d -p 27017:27017 --name mongo mongo
     ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   - Runs on `http://localhost:3000` with Nodemon for auto-reloading.

## Setup (Production)

1. **Build Docker Image**:
   - Ensure a `Dockerfile` exists (example below).
   - From the `backend` directory:
     ```bash
     docker build -t scavenger-hunt-backend .
     ```

2. **Run with Docker**:
   ```bash
   docker run -d -p 3000:3000 --env-file .env --link mongo scavenger-hunt-backend
   ```
   - Assumes MongoDB is running in a container named `mongo`.

3. **Example `Dockerfile`**:
   ```dockerfile
   FROM node:18
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

4. **With Docker Compose**:
   - Use the root `docker-compose.yml` (see root README) to run alongside the frontend and MongoDB.

## API Endpoints

- **POST `/api/hunts/create`**:
  - Creates a new hunt.
  - Body: `{ code, clues: [{ description, address }], prize, adminPassword }`.
  - Converts addresses to coordinates using Google Geocoding API.

- **GET `/api/hunts/:code`**:
  - Retrieves hunt details by code.

- **POST `/api/hunts/join`**:
  - Joins a participant to a hunt.
  - Body: `{ code, name }`.

- **POST `/api/hunts/validate-admin`**:
  - Validates admin access.
  - Body: `{ code, adminPassword }`.

## Dependencies

- `express`: Web framework.
- `mongoose`: MongoDB ORM.
- `axios`: For Google Geocoding API requests.
- `geolib`: For distance calculations.
- `cors`: For cross-origin requests (development).
- `dotenv`: For environment variables.

## Configuration

- **`.env`**:
  - `MONGO_URI`: MongoDB connection (required).
  - `PORT`: Server port (default 3000).
  - `GOOGLE_API_KEY`: Google API key (required for geocoding).

## Notes

- **Security**: Admin passwords are stored in plain text. For production, install `bcrypt` (`npm install bcrypt`) and hash passwords in `huntController.ts`.
- **Google API**: Ensure the API key has billing enabled and Geocoding API activated.
- **CORS**: Enabled for development; configure for production as needed.