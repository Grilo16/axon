FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

ARG VITE_API_URL=https://axon-api.tom-britton.com/api
ARG VITE_AUTH_URL=https://auth.tom-britton.com
ARG VITE_AUTH_REALM=axon
ARG VITE_AUTH_CLIENT_ID=axon-client

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_AUTH_REALM=$VITE_AUTH_REALM
ENV VITE_AUTH_CLIENT_ID=$VITE_AUTH_CLIENT_ID
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
# Copy the built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy a custom nginx config to handle React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]