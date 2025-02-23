import express from "express";
import dotenv from "dotenv";
import router from "./Routes/Routes.js";

dotenv.config({ path: "./.env" });
const app = express();
app.use(express.json());

app.use("/", router);

export default app;
