import { Router } from "express";
import { getProducts, postProduct } from "../controllers/Products.Controller";
import { body, param, query } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";

const productsRouter = Router();

productsRouter.get(
    "/products",
    [
        query('productName').optional(),
        validateEnpoint
    ],
    getProducts
);

productsRouter.post(
    "/postProduct",
    [
        body("idProduct").isInt().notEmpty(),
        body("idOrganization").isInt().notEmpty(),
        body("idMeasure").isInt().notEmpty(),
        body("quantity").isInt().notEmpty(),
        body("expirationDate").notEmpty(),
        validateEnpoint
    ],
    postProduct);

export default productsRouter;