import { createProxyMiddleware } from "http-proxy-middleware";

/**
 * @returns {service url} - spot or future
 */
const exchangeServices = {
  spot: process.env.SPOT,
  future: process.env.FUTURE,
};

/**
 *Proxy middleware with error handling
 * @returns {target url} - routes to targted url
 */

export const proxyHandler = (req, res, next) => {
  try {
    const { type } = req.params;

    const target = exchangeServices[type];

    if (!target) {
      console.error("Error: Target service not found", target);
      return res.status(400).json({ error: "Invalid service type" });
    }

    console.log(`Routing request to: ${target}${req.originalUrl}`);
    console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);

    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        const queryString = new URLSearchParams(req.query).toString();
        return `/${req.params.exchange}${queryString ? `?${queryString}` : ""}`;
      },
      onError: (err, req, res) => {
        console.error("Proxy Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
      },
    })(req, res, next);
  } catch (error) {
    console.error("Unexpected Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

console.log("API Gateway is running...");
