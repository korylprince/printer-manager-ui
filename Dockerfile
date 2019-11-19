FROM alpine:3.10 as builder

ARG VERSION

RUN apk add --no-cache git nodejs nodejs-npm

RUN git clone --branch "$VERSION" --single-branch --depth 1 \
    https://github.com/korylprince/printer-manager-ui.git /client

WORKDIR /client

RUN npm install

ENV API_BASE="/api/1.0"

RUN npm run build-prod

FROM alpine:3.10

RUN apk add --no-cache caddy

COPY --from=builder /client/dist /www

WORKDIR /www

COPY ./Caddyfile /

CMD ["caddy", "-conf", "/Caddyfile"]
