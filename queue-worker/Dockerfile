FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod .

RUN touch go.sum


COPY src/ src/


RUN go mod tidy


RUN CGO_ENABLED=0 GOOS=linux go build -o worker src/main.go


FROM alpine:latest

WORKDIR /root/
COPY --from=builder /app/worker .

CMD ["./worker"]