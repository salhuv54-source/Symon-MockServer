# --- Stage 1: Build & Dependencies ---
FROM artifactory.gcp.elta.co.il/docker.io/library/node:20-alpine AS builder
WORKDIR /usr/src/app

# Point NPM to the corporate Artifactory registry and system CA bundle
ENV NPM_CONFIG_REGISTRY=https://artifactory.gcp.elta.co.il/artifactory/api/npm/npmjs.org
ENV NPM_CONFIG_CAFILE=/etc/ssl/certs/ca-certificates.crt

# Copy the CA certificate bundle into the stage so npm trusts Artifactory
COPY ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# Copy package management files first to leverage Docker caching
COPY package*.json ./

# Install all dependencies (including devDependencies required for TypeScript compilation)
RUN npm ci

# Copy tsconfig and source code
COPY tsconfig.json ./
COPY index.ts ./
COPY src/ ./src/
COPY assets/ ./assets/

# Build TypeScript code to dist/
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM artifactory.gcp.elta.co.il/docker.io/library/node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=9001

# Point NPM to the corporate Artifactory registry and system CA bundle
ENV NPM_CONFIG_REGISTRY=https://artifactory.gcp.elta.co.il/artifactory/api/npm/npmjs.org
ENV NPM_CONFIG_CAFILE=/etc/ssl/certs/ca-certificates.crt

# Copy the CA certificate bundle into the stage so npm trusts Artifactory
COPY ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# Copy package files and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript output and runtime assets from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/assets ./assets

# Expose port 9001 for REST API, Swagger UI, and Socket.IO connections
EXPOSE 9001

# Run the application
CMD ["node", "dist/index.js"]