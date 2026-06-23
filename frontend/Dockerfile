# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy dependency catalogs
COPY package*.json ./

# Install packages
RUN npm ci

# Copy frontend source code
COPY . .

# Declare build arguments for Vite (embedded at compilation time)
ARG VITE_API_URL
ARG VITE_ZOHO_SALESIQ_WIDGET_KEY
ARG VITE_ZOHO_FORMS_URL
ARG VITE_ZOHO_ANALYTICS_DASHBOARD_URL
ARG VITE_RECAPTCHA_SITE_KEY
ARG VITE_ZOHO_SURVEY_URL

# Set environment variables for build script
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_ZOHO_SALESIQ_WIDGET_KEY=${VITE_ZOHO_SALESIQ_WIDGET_KEY}
ENV VITE_ZOHO_FORMS_URL=${VITE_ZOHO_FORMS_URL}
ENV VITE_ZOHO_ANALYTICS_DASHBOARD_URL=${VITE_ZOHO_ANALYTICS_DASHBOARD_URL}
ENV VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}
ENV VITE_ZOHO_SURVEY_URL=${VITE_ZOHO_SURVEY_URL}

# Compile production assets
RUN npm run build

# Stage 2: Serve static files using Nginx
FROM nginx:alpine

# Copy compiled assets from build stage to Nginx public root
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Nginx server port
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
