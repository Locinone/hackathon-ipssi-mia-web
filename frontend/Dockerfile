# Use Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all source files
COPY . .

# Start Vite with hot-reloading & allow external access
CMD ["npm", "run", "dev", "--", "--host"]
