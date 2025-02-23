"use client";

import { useState } from "react";
import axios from "axios";

const CandleSticks = () => {
  /**
   * Hooks management
   */
  const [exchange, setExchange] = useState("");
  const [type, setType] = useState("");
  const [symbol, setSymbol] = useState("");
  const [interval, setInterval] = useState("");
  const [data, setData] = useState(null);

  /**
   * Dynamic handling :
   * Exchanges - Binance, Mexc, Kucoin
   * Services - spot, future
   * Params - symbol, interval
   */
  const options = {
    Binance: {
      spot: {
        symbols: ["BTC-USDT", "ETH-USDT"],
        intervals: ["1s", "1m", "3m", "1h"],
      },
      future: {
        symbols: ["BTC-USDT", "ETHUSDT"],
        intervals: ["1s", "1m", "3m", "1h"],
      },
    },
    ByBit: {
      spot: {
        symbols: ["BTCUSDT", "ETHUSDT"],
        intervals: ["1", "3", "5"],
      },
      future: {
        symbols: ["BTC-USDT", "ETHUSDT"],
        intervals: ["1s", "1m", "3m", "1h"],
      },
    },
    MEXC: {
      spot: {
        symbols: ["BTCUSDT", "ETHUSDT"],
        intervals: ["1m", "3m", "5m", "1h"],
      },
      future: {
        symbols: ["BTCUSDT", "ETHUSDT"],
        intervals: ["min1", "min5", "min15", "1h"],
      },
    },
    KuCoin: {
      spot: {
        symbols: ["BTC-USDT", "ETH-USDT"],
        intervals: ["1min", "3min", "5min", "1h"],
      },
      future: {
        symbols: ["XBTUSDTM", "ETHUSDT"],
        intervals: ["1", "5", "15", "1"],
      },
    },
  };

  /**
   * HTTP request and WS connection
   */
  const fetchDataAndListenWS = async () => {
    try {
      const params = {
        symbol: symbol,
        interval: interval,
      };
      await axios.get(`http://localhost:5000/${exchange}/${type}`, {
        params: params,
      });
      console.log("API request send, Now Listening to WS");
      const ws = new WebSocket("ws://localhost:5001");
      if (ws) {
        console.log("Websocket is connected");
      }

      ws.onopen = () => console.log("Websocket is connected");
      ws.onmessage = (event) => {
        console.log("Websocket data received:", event.data);
        setData(JSON.parse(event.data));
      };
      ws.onerror = (error) => console.error("Failed to connect", error);
      ws.onclose = () => console.log("Websocket is closed");
    } catch (error) {
      console.error("Process failed WS:", error.message);
      throw new Error("Interval Server error");
    }
  };

  return (
    <>
      <div className="bg-slate-100 h-auto w-full p-4 flex flex-col md:flex-row md:justify-evenly items-center gap-4">
        {/* EXCHANGE */}
        <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
          <label className="font-bold text-black">Choose Exchange:</label>
          <select
            className="p-2 border rounded-md w-full md:w-auto"
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
          >
            <option value="">Select Service</option>
            {Object.keys(options).map((serv) => (
              <option key={serv} value={serv}>
                {serv}
              </option>
            ))}
          </select>
        </div>

        {/* TYPE */}
        {exchange && (
          <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
            <label className="font-bold text-black">Choose Type:</label>
            <select
              className="p-2 border rounded-md w-full md:w-auto"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Select Type</option>
              {Object.keys(options[exchange]).map((exch) => (
                <option key={exch} value={exch}>
                  {exch}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* SYMBOL */}
        {type && (
          <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
            <label className="font-bold text-black">Choose Symbol:</label>
            <select
              className="p-2 border rounded-md w-full md:w-auto"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            >
              <option value="">Select Symbol</option>
              {options[exchange][type].symbols.map((symb) => (
                <option key={symb} value={symb}>
                  {symb}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* INTERVAL */}
        {symbol && (
          <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
            <label className="font-bold text-black">Choose Interval:</label>
            <select
              className="p-2 border rounded-md w-full md:w-auto"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
            >
              <option value="">Select Interval</option>
              {options[exchange][type].intervals.map((int) => (
                <option key={int} value={int}>
                  {int}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Handles click to make a HTTP request */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          onClick={fetchDataAndListenWS}
        >
          Fetch Data
        </button>
      </div>

      {/* OHLCV Data display */}
      <div className="bg-slate-900 h-auto min-h-screen w-full p-4 overflow-hidden overflow-x-scroll">
        <h2 className="text-white text-start text-2xl font-bold mb-4">
          Real-time Candle Data
        </h2>
        {data ? (
          <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-400">No data yet</p>
        )}
      </div>
    </>
  );
};

export default CandleSticks;
