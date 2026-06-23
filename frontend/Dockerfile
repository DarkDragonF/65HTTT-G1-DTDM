# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Receive the build arguments and set the environment variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_ZOHO_FORMS_URL
ENV VITE_ZOHO_FORMS_URL=${VITE_ZOHO_FORMS_URL}

ARG VITE_RECAPTCHA_SITE_KEY
ENV VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}

ARG VITE_ZOHO_SALESIQ_WIDGET_KEY
ENV VITE_ZOHO_SALESIQ_WIDGET_KEY=${VITE_ZOHO_SALESIQ_WIDGET_KEY}

ARG VITE_ZOHO_ANALYTICS_DASHBOARD_URL
ENV VITE_ZOHO_ANALYTICS_DASHBOARD_URL=${VITE_ZOHO_ANALYTICS_DASHBOARD_URL}

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
