# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim

WORKDIR /app

ENV NODE_ENV=production

# Install pnpm
ARG PNPM_VERSION=latest
RUN npm install -g pnpm@$PNPM_VERSION

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy the rest of your code
COPY . .

# Build frontend
RUN pnpm run build

# Prune dev dependencies
RUN pnpm prune --prod

# Expose the port your server listens on
EXPOSE 5678

# Start your server
CMD ["node", "server.js"]

