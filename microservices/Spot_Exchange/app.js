import express from "express";
import dotenv from "dotenv";
import route from "./routes/Routes.js";

dotenv.config({ path: "./.env" });

const app = express();
app.use(express.json());

app.use("/", route);

export default app;
