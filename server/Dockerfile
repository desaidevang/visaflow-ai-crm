# Use official lightweight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy rest of the code
COPY . .

# Expose app port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]