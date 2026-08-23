# syntax=docker/dockerfile:1.7
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .

EXPOSE 5173

CMD ["sh", "-c", "npm ci --no-audit --no-fund && npm run dev"]