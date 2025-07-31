FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci 
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci 

EXPOSE 3000
ENV NODE_ENV=prod

CMD ["npm", "run", "start"]