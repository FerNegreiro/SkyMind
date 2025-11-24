import pika
import requests
import json
import time
import schedule
import os
import sys


RABBIT_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')
RABBIT_USER = os.getenv('RABBITMQ_USER', 'user')
RABBIT_PASS = os.getenv('RABBITMQ_PASS', 'password')
QUEUE_NAME = 'weather_queue'

LATITUDE = os.getenv('CITY_LAT', '-23.56')
LONGITUDE = os.getenv('CITY_LON', '-46.65')

def get_weather_data():
    print("🌤️  Buscando dados do clima...")
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        current = data['current']
        
        payload = {
            "latitude": data['latitude'],
            "longitude": data['longitude'],
            "temperature": current['temperature_2m'],
            "humidity": current['relative_humidity_2m'],
            "wind_speed": current['wind_speed_10m'],
            "condition_code": current['weather_code'],
            "timestamp": current['time']
        }
        return payload
    except Exception as e:
        print(f"❌ Erro ao buscar clima: {e}")
        return None

def send_to_queue(payload):
    try:
        credentials = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
        parameters = pika.ConnectionParameters(host=RABBIT_HOST, credentials=credentials)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        message = json.dumps(payload)
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=message,
            properties=pika.BasicProperties(delivery_mode=2))
        print(f"📤 [x] Enviado para fila: {payload['temperature']}°C")
        connection.close()
    except Exception as e:
        print(f"❌ Erro ao conectar no RabbitMQ: {e}")

def job():
    data = get_weather_data()
    if data:
        send_to_queue(data)

if __name__ == "__main__":
    print("🚀 Iniciando Weather Collector...")
    time.sleep(10) 
    job()
    schedule.every(1).minutes.do(job)
    while True:
        schedule.run_pending()
        time.sleep(1)