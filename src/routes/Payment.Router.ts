import { Router } from "express";
import {
  createOrder,
  receiveWebhook,
} from "../controllers/CreateSubscription.Controller";

const router = Router();

router.post("/create-order", createOrder);

router.post("/webhook", receiveWebhook);


export default router;
