# Stage 1: Build the frontend React app
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Setup the backend
FROM node:18-alpine
WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend assets to backend's public directory
# (We need to configure Express to serve these)
COPY --from=frontend-build /app/frontend/dist ./backend/public

# Expose the backend port
EXPOSE 5000

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=5000

# Start the server
WORKDIR /app/backend
CMD ["node", "server.js"]
