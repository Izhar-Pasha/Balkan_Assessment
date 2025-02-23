import axios from "axios";
import { Kafka } from "kafkajs";

// Kafka Connection.
const kafka = new Kafka({
  clientId: "future-service",
  brokers: [process.env.KAFKA1],
});

const producer = kafka.producer();
await producer.connect();

// Dynamical URL
const futureExchangeURLS = {
  Binance: process.env.BINANCE,
  ByBit: process.env.BYBIT,
  MEXC: process.env.MEXC,
  KuCoin: process.env.KUCOIN,
};

// Params according to the exchange
function getParams(exchange, symbol, interval, limit) {
  switch (exchange) {
    case "Binance":
    case "ByBit":
    case "MEXC":
      return { interval, limit };
    case "KuCoin":
      return { symbol, granularity: interval, limit };
    default:
      return { symbol, interval, limit };
  }
}

/**
 *
 * @param {string} exchange - Binance, KuCOin
 * @param {string} symbol - BTC-USDT, BTCUSDT
 * @param {string} interval - 1min, 5min
 * @param {number} limit - Request per min
 * @returns {Promise<object>} - OHLCV data from Exchange.
 */
async function fetchKlines(exchange, symbol, interval, limit = 100) {
  if (!futureExchangeURLS[exchange]) {
    throw new Error("Exchange Not Supported!");
  }
  try {
    let url = futureExchangeURLS[exchange];
    let params = getParams(exchange, symbol, interval, limit);

    if (exchange === "MEXC") {
      url = `${url}${symbol}`;
    }

    // Basic rate limiter (delay between requests)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to Fetch Klines: ${error.message}`);
  }
}

/**
 * REST API for dynamic exchanges.
 * Calls the fetch data functoin and handle errors.
 * @returns {Promise<object>} - OHLCV data from Exchange.
 */
export const futureExchange = async (req, res) => {
  const { exchange } = req.params;
  const { symbol, interval, limit } = req.query;
  try {
    const candleData = await fetchKlines(exchange, symbol, interval, limit);
    if (!candleData)
      return res.status(400).send({ message: "Something Went Wrong!" });

    await producer.send({
      topic: "future-candle-data",
      messages: [
        {
          value: JSON.stringify({
            exchange,
            symbol,
            interval,
            limit,
            data: candleData,
          }),
        },
      ],
    });
    res.status(200).json({ candleData });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    throw new Error(`Failed to Fetch klines: ${error.message}`);
  }
};
