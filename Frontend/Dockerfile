# Stage 1: Build the application
FROM node:23-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for Vite)
RUN npm install

# Copy source code
COPY . .

# Set environment variables for Vite
ARG VITE_PORT
ARG VITE_API_URL
ENV VITE_PORT=${VITE_PORT}
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN npm run build


# Stage 2: Serve the application
FROM nginx:alpine

# Copy the built application to the Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
