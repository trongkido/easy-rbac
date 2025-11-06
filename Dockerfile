# STAGE 1: "Packaging Machine" (Build Stage)
# ---------------------------------------------

# Use Node.js 18 Alpine (lightweight) image for building
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json file to WORKDIR
COPY package.json ./

# Run npm install INSIDE this build container (this acts as the “packaging machine”)
RUN npm install

# Copy all remaining project source code
COPY . .

# Run the build command to generate the /app/dist directory
RUN npm run build


# STAGE 2: "Main Runner" (Final Stage)
# ---------------------------------------------

# Use the Nginx Alpine image (very lightweight)
FROM nginx:alpine

# Set the working directory to Nginx's root directory
WORKDIR /usr/share/nginx/html

# Remove Nginx’s default HTML files
RUN rm -rf ./*

# Copy the built files (the dist directory) from STAGE 1
COPY --from=build /app/dist .
