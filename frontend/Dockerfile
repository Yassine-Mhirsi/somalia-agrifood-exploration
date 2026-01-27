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

# Build 
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
