# Use a Node image for building the application
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use a smaller image for the final production build
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy the built application from the previous stage
COPY --from=build /app /app

# Install only production dependencies
RUN npm install --only=production

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]