FROM node:slim

WORKDIR /app

RUN npm install -g pnpm@latest-10

COPY ./package.json ./pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE 8080

CMD ["pnpm", "run", "serve"]
