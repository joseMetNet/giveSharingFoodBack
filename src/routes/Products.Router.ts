import { Router } from "express";
import { getProducts } from "../controllers/Products.Controller";

const productsRouter = Router();

productsRouter.get("/products", getProducts);

export default productsRouter;