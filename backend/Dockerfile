# 1. Use Node.js 22 as the base image
FROM node:22-alpine

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install production dependencies
RUN npm ci --omit=dev

# 5. Copy backend source code
COPY . .

# 6. Set environment
ENV NODE_ENV=production

# 7. Start the backend
CMD ["npm", "start"]