import express from "express";
import { futureExchange } from "../exchanges/exchanges.js";

const router = express.Router();

router.get("/:exchange", futureExchange);

export default router;
