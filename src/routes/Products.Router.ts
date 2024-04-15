import { Router } from "express";
import { getProducts, getProductsReserved, getProductsToDonate, postProduct, putProductDelivered, putProductReserved } from "../controllers/Products.Controller";
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

productsRouter.get(
    "/donateproducts",
    [
        query('productName').optional(),
        validateEnpoint
    ],
    getProductsToDonate
);

productsRouter.post(
    "/postProduct",
    [
        body("idProduct", "product.validate_field_int").isInt().notEmpty(),
        body("idOrganization", "product.validate_field_int").isInt().notEmpty(),
        body("idMeasure", "product.validate_field_int").isInt().notEmpty(),
        body("quantity", "product.validate_field_int").isInt().notEmpty(),
        body("expirationDate").notEmpty(),
        body("idUser", "product.validate_field_int").isInt().notEmpty(),
        validateEnpoint
    ],
    postProduct);

productsRouter.put(
    "/putproductdreserved/:id",
    [
        param("id", "product.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    putProductReserved
);

productsRouter.get(
    "/getproductreserved", getProductsReserved
);

productsRouter.put(
    "/putproductdelivered/:id",
    [
        param("id", "product.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    putProductDelivered
);

export default productsRouter;