// // import axios from "axios";
// // import { Kafka } from "kafkajs";

// // const kafka = new Kafka({
// //   clientId: "spot-service",
// //   brokers: ["localhost:9092"],
// // });

// // const producer = kafka.producer();
// // await producer.connect();

// // const exchangeURLS = {
// //   Binance: "https://api.binance.com/api/v3/klines",
// //   ByBit: "https://api.bybit.com/v5/market/kline",
// //   MEXC: "https://api.mexc.com/api/v3/klines", //https://mexcdevelop.github.io/apidocs/spot_v3_en/#kline-candlestick-data
// //   KuCoin: "https://api.kucoin.com/api/v1/market/candles",
// // };

// // function getParams(exchange, symbol, interval) {
// //   switch (exchange) {
// //     case "Binance":
// //       return { symbol, interval };
// //     case "Bybit":
// //       return { symbol, interval };
// //     case "MEXC":
// //       return { symbol, interval };
// //     case "KuCoin":
// //       return { symbol, type: interval };
// //     default:
// //       return { symbol, interval };
// //   }
// // }

// // async function fetchCandleData(exchange, symbol, interval) {
// //   if (!exchangeURLS[exchange]) {
// //     console.log("Exchange  Not Supported!");
// //     throw new Error("Exchange Not Supported");
// //   }
// //   try {
// //     const url = exchangeURLS[exchange];
// //     console.log("checking the exchange name:", url);
// //     const params = getParams(exchange, symbol, interval);
// //     console.log("checkin params", params);
// //     const response = await axios.get(url, {
// //       params,
// //     });

// //     return response.data;
// //   } catch (error) {
// //     console.log("Failed to Fetch Data", error.message);
// //     throw new Error("Failed to fetch");
// //   }
// // }

// // export const DynamicExchange = async (req, res) => {
// //   const { exchange } = req.params;
// //   const { symbol, interval } = req.query;
// //   try {
// //     const candleData = await fetchCandleData(exchange, symbol, interval);
// //     if (!candleData)
// //       return res.status(400).send({ message: "Something Went Wrong!" });

// //     await producer.send({
// //       topic: "spot-candle-data",
// //       message: [
// //         {
// //           Value: JSON.stringify({
// //             exchange,
// //             symbol,
// //             interval,
// //             data: candleData,
// //           }),
// //         },
// //       ],
// //     });

// //     res.status(200).json({ candleData });
// //   } catch (error) {
// //     console.log("Failed to get the Candle Data", error.message);
// //     res.status(500).send({ message: "Internal Server Error!" });
// //   }
// // };

// import axios from "axios";
// import { Kafka } from "kafkajs";

// const kafka = new Kafka({
//   clientId: "spot-service",
//   brokers: ["localhost:9092"],
// });

// const producer = kafka.producer();
// await producer.connect();

// const exchangeURLS = {
//   Binance: "https://api.binance.com/api/v3/klines",
//   ByBit: "https://api.bybit.com/v5/market/kline",
//   MEXC: "https://api.mexc.com/api/v3/klines",
//   KuCoin: "https://api.kucoin.com/api/v1/market/candles",
// };

// function getParams(exchange, symbol, interval) {
//   switch (exchange) {
//     case "Binance":
//     case "Bybit":
//     case "MEXC":
//       return { symbol, interval };
//     case "KuCoin":
//       return { symbol, type: interval };
//     default:
//       return { symbol, interval };
//   }
// }

// async function fetchCandleData(exchange, symbol, interval) {
//   if (!exchangeURLS[exchange]) {
//     console.log("Exchange Not Supported!");
//     throw new Error("Exchange Not Supported");
//   }
//   try {
//     const url = exchangeURLS[exchange];
//     // console.log("Checking the exchange name:", url);
//     const params = getParams(exchange, symbol, interval);
//     // console.log("Checking params:", params);
//     const response = await axios.get(url, { params });

//     return response.data;
//   } catch (error) {
//     console.log("Failed to Fetch Data", error.message);
//     throw new Error("Failed to fetch");
//   }
// }

// export const DynamicExchange = async (req, res) => {
//   const { exchange } = req.params;
//   const { symbol, interval } = req.query;
//   try {
//     const candleData = await fetchCandleData(exchange, symbol, interval);
//     if (!candleData)
//       return res.status(400).send({ message: "Something Went Wrong!" });

//     await producer.send({
//       topic: "spot-candle-data",
//       messages: [
//         // Corrected key from `message` to `messages`
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
//     console.log("Failed to get the Candle Data", error.message);
//     res.status(500).send({ message: "Internal Server Error!" });
//   }
// };

import axios from "axios";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "spot-service",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
await producer.connect();

const exchangeURLS = {
  Binance: "https://api.binance.com/api/v3/klines",
  ByBit: "https://api.bybit.com/v5/market/kline",
  MEXC: "https://api.mexc.com/api/v3/klines",
  KuCoin: "https://api.kucoin.com/api/v1/market/candles",
};

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
    console.log("Failed to get the Candle Data", error.message);
    res.status(500).send({ message: "Internal Server Error!" });
  }
};
