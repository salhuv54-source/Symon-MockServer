# --- Stage 1: Build & Dependencies ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy package management files first to leverage Docker/Podman caching
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of your application source code
COPY . .

# Build TypeScript
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Only install production dependencies to keep the image slim
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port your Node app listens on (change 3000 if your app uses a different port)
EXPOSE 8081

# Run the compiled application
CMD ["node", "dist/index.js"]