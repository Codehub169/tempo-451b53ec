#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define project root
PROJECT_ROOT=$(pwd)

# Frontend and Backend directories
FRONTEND_DIR="$PROJECT_ROOT/frontend"
SERVER_DIR="$PROJECT_ROOT/server"

# Default port
PORT=9000

echo "Starting Arcade Haven application setup..."

# 1. Install root dependencies (if any, defined in root package.json)
# echo "Installing root dependencies..."
# npm install

# 2. Install backend dependencies
echo "Navigating to server directory: $SERVER_DIR"
cd "$SERVER_DIR"
echo "Installing backend dependencies..."
npm install

# 3. Initialize SQLite database (ensure db.js creates it if not exists)
# The db.js will handle creation, but we can touch the file to ensure it's present.
echo "Ensuring database file exists..."
DB_FILE="$PROJECT_ROOT/database.sqlite"
if [ ! -f "$DB_FILE" ]; then
  echo "Creating empty database file at $DB_FILE"
  touch "$DB_FILE"
else
  echo "Database file already exists at $DB_FILE"
fi

# 4. Install frontend dependencies
echo "Navigating to frontend directory: $FRONTEND_DIR"
cd "$FRONTEND_DIR"
echo "Installing frontend dependencies..."
npm install

# 5. Build frontend for production
echo "Building frontend application..."
# The build command in frontend/package.json should output to a 'build' folder
# The server will be configured to serve static files from this 'build' folder.
npm run build

# 6. Navigate back to server directory to start the server
echo "Navigating back to server directory: $SERVER_DIR"
cd "$SERVER_DIR"

# 7. Start the backend server
# The server will be configured to serve the frontend build and listen on PORT
echo "Starting backend server on port $PORT..."
# Pass the port to the server, frontend build path relative to server
# The server's index.js should be able to pick up this PORT environment variable.
# The frontend build path will be ../frontend/build
PORT=$PORT npm start

echo "Arcade Haven application should now be running on http://localhost:$PORT"
