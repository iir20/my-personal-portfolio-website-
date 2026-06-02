# Multi-stage production build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy codebase
COPY . .

# Run production compilation of frontend SPA and CJS backend Bundle
RUN npm run build

# Final production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy dependencies manifest and pre-compiled segments
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Expose port (Nginx routing ingress proxy standard)
EXPOSE 3000

# Run standalone backend deployment
CMD ["npm", "run", "start"]
