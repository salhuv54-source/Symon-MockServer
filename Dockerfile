# --- Stage 1: Build & Dependencies ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Point NPM to the corporate Artifactory registry and system CA bundle
ENV NPM_CONFIG_REGISTRY=https://artifactory.gcp.elta.co.il/artifactory/api/npm/npmjs.org
ENV NPM_CONFIG_CAFILE=/etc/ssl/certs/ca-certificates.crt

# Copy the CA certificate bundle into the stage so npm trusts Artifactory
COPY ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

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

# Point NPM to the corporate Artifactory registry and system CA bundle
ENV NPM_CONFIG_REGISTRY=https://artifactory.gcp.elta.co.il/artifactory/api/npm/npmjs.org
ENV NPM_CONFIG_CAFILE=/etc/ssl/certs/ca-certificates.crt

# Copy the CA certificate bundle into the stage so npm trusts Artifactory
COPY ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# Only install production dependencies to keep the image slim
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port your Node app listens on (change 3000 if your app uses a different port)
EXPOSE 8081

# Run the compiled application
CMD ["node", "dist/index.js"]