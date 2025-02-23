# Future & Spot Exchange Data Fetcher

## Overview

This project fetches OHLCV (Open, High, Low, Close, Volume) data from multiple cryptocurrency exchanges (Binance, ByBit, MEXC, KuCoin) and streams the data to Apache Kafka for further processing. The system efficiently handles pagination and rate limits while ensuring smooth data flow to microservices running on Docker.

## Features

- Fetches real-time candlestick (klines) data from multiple exchanges.
- Supports pagination, rate limits, and dynamic parameters.
- Uses Apache Kafka to produce messages for microservices to consume.
- Built with Node.js, Express, Axios, KafkaJS and NEXT.js.
- Dockerized Kafka setup for containerized data processing.

## Technologies Used

- **Node.js** - Backend runtime
- **Express.js** - API framework
- **Next.js** - Frontend framework
- **Axios** - HTTP requests to exchanges
- **KafkaJS** - Kafka producer for real-time data streaming
- **Docker** - Containerized Kafka setup

## API Endpoints

### Spot Exchange Endpoint

```
GET /:exchange/spot?symbol=BTCUSDT&interval=1m&limit=100&page=1
```

- **exchange**: Binance, ByBit, MEXC, KuCoin
- **symbol**: Market pair (e.g., BTCUSDT)
- **interval**: Timeframe (e.g., 1m, 5m, 1h)
- **limit**: Number of records to fetch (default: 100)
- **page**: Page number for pagination (if supported)

### Future Exchange Endpoint

```
GET /:exchange/future?symbol=BTCUSDT&interval=1m&limit=100
```

- **exchange**: Binance, ByBit, MEXC, KuCoin
- **symbol**: Market pair (e.g., BTCUSDT)
- **interval**: Timeframe (e.g., 1m, 5m, 1h)
- **limit**: Number of records to fetch (default: 100)

## Installation & Setup

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- Kafka (Docker setup included)

### Steps

1. **Clone the repository**

   ```sh
   git clone https://github.com/Izhar-Pasha/Balkan_Assessment
   ```

2. **Install dependencies**

   ```sh
   npm install express, axios, nodemon, next.js, tailwincss and more.
   ```

3. **Start Kafka with Docker**

   ```sh
   docker-compose up -d
   ```

4. **Run the API**
   ```sh
   node server.js
   or
   npm run dev
   ```

## Environment Variables

Each microservice and the API Gateway require their own `.env` file. Ensure they are created in their respective directories before running the application.

### **API Gateway (`/backend/.env`)**

# API Gateway PORT

PORT=<your_spot_service_port>

# Service URLS

SPOT = <Spot_URL>
FUTURE = <Future_URL>

### **Spot Microservice (`/Spot-exchange/.env`)**

### **Future Microservice (`/future-exchange/.env`) **

PORT=<your_spot_service_port>
KAFKA_BROKER=<your_kafka_broker>
Binance=<binance_url>
ByBit=<ByBit_url>
Mexc=<Mexc_url>
KuCoin=<KuCoin_url>

## Docker Setup

This project consists of multiple microservices and requires **Kafka** and **Zookeeper** to function properly. We use **Docker Compose** to manage all the services.

### ** Build & Start All Services**

Run the following command to build and start all services together:

```sh
docker-compose up -d --build

### **  Verify Running Containers **
docker ps

### ** Stop Everything **
docker-compose down

## License

This project is build for company assessment and has no license
```
