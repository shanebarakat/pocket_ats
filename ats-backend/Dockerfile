# Use official Node.js Alpine image (lightweight)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first for caching efficiency
COPY package*.json ./
RUN npm install

# Copy remaining files
COPY . .

# Expose port (use the port your backend listens on)
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
