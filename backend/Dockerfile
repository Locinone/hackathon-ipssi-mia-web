# Use a Node.js base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy all project files
COPY . .

# Start the app using nodemon
CMD ["npm", "run", "dev"]
