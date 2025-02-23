import express from "express";
import { DynamicExchange } from "../exchanges/exchanges.js";

const route = express.Router();

// Routing for candhle data
route.get("/:exchange", DynamicExchange);

export default route;
