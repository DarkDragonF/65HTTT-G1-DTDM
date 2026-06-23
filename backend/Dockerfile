FROM node:20-alpine

# Set environment node to production
ENV NODE_ENV=production

# Create and define the application directory
WORKDIR /usr/src/app

# Copy dependency catalogs
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start server node
CMD ["node", "src/server.js"]
