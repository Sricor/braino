FROM denoland/deno:latest

WORKDIR /app

COPY . .

RUN deno cache server.ts

CMD ["task", "server"]
