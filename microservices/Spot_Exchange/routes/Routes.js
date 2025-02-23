import express from "express";
import { DynamicExchange } from "../exchanges/exchanges.js";

const route = express.Router();

route.get("/:exchange", DynamicExchange);

export default route;
