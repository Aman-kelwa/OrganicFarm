FROM node:22-alpine AS build

WORKDIR /app

# Use the same npm version as the local machine
RUN npm install -g npm@11.6.2

COPY package*.json ./

RUN npm ci

# Copy frontend source code
COPY . .

# Build-time API configuration
# Build-time API configuration
ARG VITE_API_URL
ARG VITE_RAZORPAY_KEY_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
# Generate production build
RUN npm run build


# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy React production build
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]