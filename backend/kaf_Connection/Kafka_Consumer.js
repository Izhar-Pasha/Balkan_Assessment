import { Kafka } from "kafkajs";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 5001 }); // WebSocket Server

// Kafka Consumer Setup
const kafka = new Kafka({
  clientId: "backend-server",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "candle-data-group" });

// Store connected WebSocket clients
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");
  clients.add(ws);
  console.log(`🔗 Active WebSocket clients: ${clients.size}`);

  ws.on("message", (msg) => {
    console.log("Received message from client:", msg.toString());
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("WebSocket client disconnected");
    console.log(`Remaining clients: ${clients.size}`);
  });

  ws.on("error", (err) => {
    console.error("⚠️ WebSocket error:", err.message);
  });
});

// Kafka Consumer Function
const consumerMessage = async () => {
  try {
    await consumer.connect();
    console.log("Kafka consumer connected");

    await consumer.subscribe({
      topic: "spot-candle-data",
      fromBeginning: true,
    });
    await consumer.subscribe({
      topic: "future-candle-data",
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const candleData = JSON.parse(message.value.toString());

        console.log(`Received Kafka message from ${topic}:`, candleData);

        // Send Kafka data to all connected WebSocket clients
        clients.forEach((client) => {
          client.send(JSON.stringify({ topic, candleData }));
          console.log("Sent WebSocket message:", candleData);
        });
      },
    });
  } catch (error) {
    console.error("Kafka Consumer Error:", error);
  }
};

export default consumerMessage;
