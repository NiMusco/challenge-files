# Specify the base image
FROM node:16-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend application
COPY . .

# Build the application
RUN npm run build

# Install serve
RUN npm install -g serve

# Command to serve the build directory
CMD ["serve", "-s", "build", "-l", "80"]
