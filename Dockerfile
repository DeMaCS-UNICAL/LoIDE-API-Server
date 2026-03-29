# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Production
FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app ./

# Install only production dependencies
RUN npm ci --omit=dev

# Get version from package.json and set as label
ARG APP_VERSION
LABEL org.opencontainers.image.version="${APP_VERSION}"
LABEL org.opencontainers.image.title="LoIDE-API-Server"
LABEL org.opencontainers.image.description="An API server for LoIDE clients"
LABEL org.opencontainers.image.source="https://github.com/DeMaCS-UNICAL/LoIDE-API-Server"

CMD ["node", "app.js"]
