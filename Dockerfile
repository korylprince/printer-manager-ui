FROM alpine:latest

RUN apk add --no-cache caddy

COPY dist /www

WORKDIR /www

COPY ./Caddyfile /

CMD ["caddy", "run", "--config", "/Caddyfile"]
