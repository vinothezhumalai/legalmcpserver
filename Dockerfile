FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S legal-mcp -u 1001

# Change ownership of the app directory
RUN chown -R legal-mcp:nodejs /app
USER legal-mcp

# Expose port (if needed for HTTP interface)
EXPOSE 3000

# Start the MCP server
CMD ["node", "dist/index.js"]