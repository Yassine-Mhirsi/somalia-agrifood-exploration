FROM node:20-slim

WORKDIR /app

# Install pnpm 
RUN npm install -g pnpm

# Copy configuration files
COPY package.json pnpm-lock.yaml* .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend
COPY . .

# Delete local .npmrc
RUN rm -f .npmrc

# Accept API URL at build time (Render passes env vars as Docker build args)
# Default keeps local docker-compose working as-is
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build 
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
