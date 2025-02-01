# Stage 1: Build the app
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# Stage 2: Run the app
FROM node:18
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/uploads ./uploads  # Persist uploads/

# Expose port and start the app
EXPOSE 3000
CMD ["node", "dist/main.js"]