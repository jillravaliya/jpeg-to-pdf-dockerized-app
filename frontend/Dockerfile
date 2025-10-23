# Build Stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build the project
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Serve Stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy build output to Nginx html directory
COPY --from=build /app/dist .

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]