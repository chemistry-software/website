## Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod download || true

COPY . .

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server .

## Final runtime image
FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /srv

COPY --from=builder /app/server ./server
COPY --from=builder /app/static ./static

EXPOSE 8080

ENV PORT=8080

CMD ["/srv/server"]


