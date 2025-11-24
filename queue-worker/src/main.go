package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherData struct {
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	Temperature   float64 `json:"temperature"`
	Humidity      float64 `json:"humidity"`
	WindSpeed     float64 `json:"wind_speed"`
	ConditionCode int     `json:"condition_code"`
	Timestamp     string  `json:"timestamp"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		rabbitURL = "amqp://user:password@rabbitmq:5672/"
	}

	apiURL := "http://backend-api:3000/weather"

	var conn *amqp.Connection
	var err error

	log.Println("🐹 Worker em Go (Versão API) iniciando...")

	for {
		conn, err = amqp.Dial(rabbitURL)
		if err == nil {
			log.Println("✅ Conectado ao RabbitMQ com sucesso!")
			break
		}
		log.Printf("⏳ RabbitMQ indisponível. Tentando em 5s... (Erro: %v)", err)
		time.Sleep(5 * time.Second)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_queue", true, false, false, false, nil,
	)
	failOnError(err, "Falha ao declarar fila")

	msgs, err := ch.Consume(
		q.Name, "", true, false, false, false, nil,
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			var data WeatherData
			if err := json.Unmarshal(d.Body, &data); err != nil {
				log.Printf("⚠️ Erro ao ler JSON: %s", err)
				continue
			}

			log.Printf("📥 Recebido: %.1f°C. Enviando para API...", data.Temperature)

			sendToAPI(apiURL, data)
		}
	}()

	log.Printf(" [*] Aguardando mensagens...")
	<-forever
}

func sendToAPI(url string, data WeatherData) {
	payload := map[string]interface{}{
		"temperature":   data.Temperature,
		"humidity":      data.Humidity,
		"windSpeed":     data.WindSpeed,
		"conditionCode": data.ConditionCode,
		"timestamp":     data.Timestamp,
	}

	jsonData, _ := json.Marshal(payload)

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("❌ Erro ao chamar API: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 201 || resp.StatusCode == 200 {
		log.Println("🚀 Sucesso! Dado salvo no MongoDB via API.")
	} else {
		log.Printf("⚠️ API retornou erro: %d", resp.StatusCode)
	}
}
