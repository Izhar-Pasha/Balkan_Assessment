export default function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is a simple Next.js page.</p>
    </div>
  );
}

// const options = {
//   Binance: {
//     spot: {
//       symbols: ["BTC-USDT", "ETH-USDT"],
//       intervals: ["1s", "1m", "3m", "1h"],
//     },
//     future: {
//       symbols: ["BTC-USDT", "ETHUSDT"],
//       intervals: ["1s", "1m", "3m", "1h"],
//     },
//   },

//   ByBit: {
//     spot: {
//       symbols: ["BTCUSDT", "ETHUSDT"],
//       intervals: ["1", "3", "5"],
//     },
//     future: {
//       symbols: ["BTC-USDT", "ETHUSDT"],
//       intervals: ["1s", "1m", "3m", "1h"],
//     },
//   },

//   MEXC: {
//     spot: {
//       symbols: ["BTCUSDT", "ETHUSDT"],
//       intervals: ["1m", "3m", "5m", "1h"],
//     },
//     future: {
//       symbols: ["BTCUSDT", "ETHUSDT"],
//       intervals: ["min1", "min5", "min15", "1h"],
//     },
//   },

//   KuCoin: {
//     spot: {
//       symbols: ["BTC-USDT", "ETH-USDT"],
//       intervals: ["1min", "3min", "5min", "1h"],
//     },
//     future: {
//       symbols: ["XBTUSDTM", "ETHUSDT"],
//       intervals: ["1", "5", "15", "1"],
//     },
//   },
// };

// ✅ Function to create a WebSocket connection
const connectWebSocket = () => {
  if (!exchange || !type || !symbol || !interval) {
    console.log("All fields must be selected ❌");
    return;
  }

  // ✅ Close existing WebSocket connection before creating a new one
  console.log("Checking credentials:", exchange, type, symbol, interval);
  if (socket) {
    console.log("Closing previous WebSocket connection...");
    socket.close();
  }

  // ✅ Correct WebSocket URL format
  const ws = new WebSocket("ws://localhost:5000");

  ws.onopen = () => console.log("Connected to WebSocket ✅");

  ws.onmessage = (event) => {
    try {
      const receivedData = JSON.parse(event.data);
      setData(receivedData);
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  ws.onmessage = (event) => {
    try {
      const receivedData = JSON.parse(event.data);
      console.log("📩 Data received from WebSocket:", receivedData);

      // Force a re-render by setting a new reference
      setData((prevData) => [...prevData, receivedData]);
    } catch (error) {
      console.error("❌ Error parsing WebSocket message:", error);
    }
  };

  ws.onerror = (error) => console.log("WebSocket error:", error);

  ws.onclose = () => console.log("WebSocket closed ❌");

  // ✅ Use functional update to ensure `socket` state is up-to-date
  setSocket((prev) => {
    if (prev) prev.close();
    return ws;
  });

  return ws; // ✅ Return WebSocket instance for future reference
};

// ✅ Automatically reconnect WebSocket when dependencies change
// useEffect(() => {
const handleClick = () => {
  if (exchange && type && symbol && interval) {
    const ws = connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }
};
// }, [interval]);

// const handleClick = () => {
//   const ws = new WebSocket(
//     `ws://localhost:5000/${exchange}/${type}?symbol=${symbol}&interval=${interval}`
//   );
//   if(!ws){
//     console.log("connection failed")
//   }

//   ws.onmessage = (event) => {
//     console.log("📩 WebSocket message received:", event.data);
//     try {
//       const candleStickData = JSON.parse(event.data);
//       setData(candleStickData);
//     } catch (error) {
//       console.error("Failed to get the candle data:", error.message);
//     }
//   };
//   ws.onerror = (error) => console.error("❌ WebSocket error:", error);
//   ws.onopen = () => console.log("✅ Connected to WebSocket");
//   ws.onclose = () => console.log("❌ WebSocket closed");
