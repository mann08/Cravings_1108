import express from "express";
import { ContactUsForm } from "../controllers/public.controller.js";

const router = express.Router();

router.post("/contact", ContactUsForm);

export default router;
