# syntax=docker/dockerfile:1.7

FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-audit --no-fund

COPY . .

ARG VITE_BACKEND_URL=""
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]