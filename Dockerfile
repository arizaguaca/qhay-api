# Step 1: Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Production Stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY database.sql ./

# Aseguramos directorio para subida de imágenes
RUN mkdir -p uploads/menu

EXPOSE 8080
ENV NODE_ENV=production
CMD ["npm", "start"]
