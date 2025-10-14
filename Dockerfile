# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY be/package*.json ./be/
COPY be/tsconfig.json ./be/

# Install backend dependencies
WORKDIR /app/be
RUN npm install

# Copy backend source code
COPY be/src ./src

# Build the TypeScript application
RUN npm run build

# Expose port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]