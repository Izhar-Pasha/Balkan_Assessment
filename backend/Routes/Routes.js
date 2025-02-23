import express from "express";
import { proxyHandler } from "../API_Routes/apiRoutes.js";

const router = express.Router();

router.get("/:exchange/:type", proxyHandler);

export default router;
