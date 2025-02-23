import express from "express";
import { proxyHandler } from "../API_Routes/apiRoutes.js";

const router = express.Router();

// Dynamic routes based on params
router.get("/:exchange/:type", proxyHandler);

export default router;
