FROM rust:alpine AS builder

# Install musl components for static compilation
RUN apk add --no-cache musl-dev gcc

WORKDIR /usr/src/omniclip-server
COPY . .

# Build the release binary
RUN cargo build --release

# Use a lightweight alpine image for runtime
FROM alpine:latest

WORKDIR /app
COPY --from=builder /usr/src/omniclip-server/target/release/omniclip-server /app/omniclip-server

EXPOSE 3000

CMD ["./omniclip-server"]
