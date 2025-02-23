// import axios from "axios";
// import { Kafka } from "kafkajs";

// const kafka = new Kafka({
//   clientId: "future-service",
//   brokers: ["localhost:9092"],
// });

// const producer = kafka.producer();
// await producer.connect();

// const futureExchangeURLS = {
//   Binance: "https://dapi.binance.com/dapi/v1/klines",
//   ByBit: "https://api.bybit.com/v5/market/kline",
//   MEXC: "https://contract.mexc.com/api/v1/contract/kline/",
//   KuCoin: "https://api-futures.kucoin.com/api/v1/kline/query",
// };

// function getParams(exchange, symbol, interval) {
//   switch (exchange) {
//     case "Binance":
//     case "ByBit":
//     case "MEXC":
//       return { interval };
//     case "KuCoin":
//       return { symbol, granularity: interval };
//     default:
//       return { symbol, interval };
//   }
// }

// async function fetchKlines(exchange, symbol, interval) {
//   if (!futureExchangeURLS[exchange]) {
//     throw new Error("Exchange Not Supported!");
//   }
//   try {
//     let url = futureExchangeURLS[exchange];
//     let params = getParams(exchange, symbol, interval);

//     if (exchange === "MEXC") {
//       url = `${url}${symbol}`;
//     }

//     const response = await axios.get(url, { params });
//     return response.data;
//   } catch (error) {
//     throw new Error(`Failed to Fetch Klines: ${error.message}`);
//   }
// }

// export const futureExchange = async (req, res) => {
//   const { exchange } = req.params;
//   const { symbol, interval } = req.query;
//   try {
//     const candleData = await fetchKlines(exchange, symbol, interval);
//     if (!candleData)
//       return res.status(400).send({ message: "Something Went Wrong!" });

//     await producer.send({
//       topic: "future-candle-data",
//       messages: [
//         {
//           value: JSON.stringify({
//             exchange,
//             symbol,
//             interval,
//             data: candleData,
//           }),
//         },
//       ],
//     });
//     res.status(200).json({ candleData });
//   } catch (error) {
//     res.status(500).send({ message: "Internal Server Error" });
//     throw new Error(`Failed to Fetch klines: ${error.message}`);
//   }
// };

import axios from "axios";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "future-service",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
await producer.connect();

const futureExchangeURLS = {
  Binance: "https://dapi.binance.com/dapi/v1/klines",
  ByBit: "https://api.bybit.com/v5/market/kline",
  MEXC: "https://contract.mexc.com/api/v1/contract/kline/",
  KuCoin: "https://api-futures.kucoin.com/api/v1/kline/query",
};

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
