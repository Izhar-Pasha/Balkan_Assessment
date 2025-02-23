import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./Routes/Routes.js";
import consumerMessage from "./kaf_Connection/Kafka_Consumer.js";

dotenv.config({ path: "./.env" });
const app = express();

// CORS
app.use(cors());

// Calling kafka
consumerMessage().catch(console.error);

app.use("/", router);

export default app;
