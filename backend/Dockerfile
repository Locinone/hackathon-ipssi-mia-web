# Use a Node.js base image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy all project files
COPY . .

FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy all project files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the app using nodemon
CMD ["npm", "run", "start"]
