FROM node:18-alpine
WORKDIR /app/
COPY . .
RUN npm install -g pnpm
RUN pnpm i
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && pnpm start"]
