FROM node:hydrogen as builder

COPY . .

RUN npm install

RUN npm run build

FROM alpine:latest

RUN apk add --no-cache caddy

COPY --from=builder dist /www

WORKDIR /www

COPY ./Caddyfile /

CMD ["caddy", "run", "--config", "/Caddyfile"]
