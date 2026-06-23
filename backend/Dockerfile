FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy local code to the container image
COPY . .

# Expose port (Cloud Run automatically routes requests to PORT env var, but this is a default)
EXPOSE 5000

# Set Node production environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/server.js"]
