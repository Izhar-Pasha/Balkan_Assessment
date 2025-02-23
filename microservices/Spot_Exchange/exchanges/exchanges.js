import axios from "axios";
import { Kafka } from "kafkajs";

// Kafka Connection.
const kafka = new Kafka({
  clientId: "spot-service",
  brokers: [process.env.KAFKA2],
});

const producer = kafka.producer();
await producer.connect();

// Dynamical URL
const exchangeURLS = {
  Binance: process.env.BINANCE,
  ByBit: process.env.BYBIT,
  MEXC: process.env.MEXC,
  KuCoin: process.env.KUCOIN,
};

// Params according to the exchange
function getParams(exchange, symbol, interval, limit, page) {
  switch (exchange) {
    case "Binance":
    case "Bybit":
    case "MEXC":
      return { symbol, interval, limit };
    case "KuCoin":
      return { symbol, type: interval, pageSize: limit, currentPage: page };
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
 * @param {number} page - Pages
 * @param {number} retries - Retries again
 * @returns {Promise<object>} - OHLCV data from Exchange.
 */
async function fetchCandleData(
  exchange,
  symbol,
  interval,
  limit = 100,
  page = 1,
  retries = 3
) {
  if (!exchangeURLS[exchange]) {
    console.log("Exchange Not Supported!");
    throw new Error("Exchange Not Supported");
  }
  try {
    const url = exchangeURLS[exchange];
    const params = getParams(exchange, symbol, interval, limit, page);
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429 && retries > 0) {
      console.log("Rate limit hit. Retrying in 2s...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return fetchCandleData(
        exchange,
        symbol,
        interval,
        limit,
        page,
        retries - 1
      );
    }
    console.log("Failed to Fetch Data", error.message);
    throw new Error("Failed to fetch");
  }
}

/**
 * REST API for dynamic exchanges.
 * Calls the fetch data functoin and handle errors.
 * @returns {Promise<object>} - OHLCV data from Exchange.
 */
export const DynamicExchange = async (req, res) => {
  const { exchange } = req.params;
  const { symbol, interval, limit, page } = req.query;
  try {
    const candleData = await fetchCandleData(
      exchange,
      symbol,
      interval,
      limit,
      page
    );

    if (!candleData)
      return res.status(400).send({ message: "Something Went Wrong!" });

    await producer.send({
      //Kafka Connection
      topic: "spot-candle-data",
      messages: [
        {
          value: JSON.stringify({
            exchange,
            symbol,
            interval,
            limit,
            page,
            data: candleData,
          }),
        },
      ],
    });

    res.status(200).json({ candleData });
  } catch (error) {
    //Error Handler
    console.log("Failed to get the Candle Data", error.message);
    res.status(500).send({ message: "Internal Server Error!" });
  }
};
