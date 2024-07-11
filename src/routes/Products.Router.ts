import { Router } from "express";
import { deleteProductOrganization, getProducts, getProductsReserved, getProductsToDonate, postProduct, putProductDelivered, putProductNotReserved, putProductReserved } from "../controllers/Products.Controller";
import { body, param, query } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";

const productsRouter = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get products
 *     description: Retrieve a list of products. You can optionally filter by product name.
 *     parameters:
 *       - in: query
 *         name: productName
 *         schema:
 *           type: string
 *         required: false
 *         description: The name of the product to filter by
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.successful
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       product:
 *                         type: string
 *                         example: "Product Name"
 *                       urlImage:
 *                         type: string
 *                         example: "Product Description"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.error_server
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
productsRouter.get(
    "/products",
    [
        query('productName').optional(),
        validateEnpoint
    ],
    getProducts
);

/**
 * @swagger
 * /donateproducts:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get products
 *     description: Retrieve a list of products. You can optionally filter by product name.
 *     parameters:
 *       - in: query
 *         name: productName
 *         schema:
 *           type: string
 *         required: false
 *         description: The name of the product to filter by
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.successful
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       product:
 *                         type: string
 *                       urlImage:
 *                         type: string
 *                       bussisnesName:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       measure:
 *                         type: string
 *                       expirationDate:
 *                         type: string
 *                         format: date 
 *                       idUser:
 *                         type: number
 *                       idCity:
 *                         type: number
 *                       city:
 *                         type: string
 *                       status:
 *                         type: string  
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.error_server
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
productsRouter.get(
    "/donateproducts",
    [
        query('productName').optional(),
        validateEnpoint
    ],
    getProductsToDonate
);

/**
 * @swagger
 * /postProduct:
 *   post:
 *     tags:
 *       - Products
 *     summary: Add a new product
 *     description: Add a new product to the organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idProduct:
 *                 type: integer
 *               idOrganization:
 *                 type: integer
 *               idMeasure:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               idUser:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.successful
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.error_invalid_data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
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

/**
 * @swagger
 * /putproductdreserved/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Mark a product as reserved 
 *     description: Update the status of a origanization product by its ID for reserve.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the organization product to update
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.successful
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.error_invalid_data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
productsRouter.put(
    "/putproductdreserved/:id",
    [
        param("id", "product.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    putProductReserved
);

/**
 * @swagger
 * /getproductreserved:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get reserved products
 *     description: Retrieve a list of reserved products, optionally filtered by user ID.
 *     parameters:
 *       - in: query
 *         name: idUser
 *         schema:
 *           type: integer
 *         description: User ID to filter products by.
 *     responses:
 *       200:
 *         description: A list of reserved products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.successful
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       product:
 *                         type: string
 *                       urlImage:
 *                         type: string
 *                       bussisnesName:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       measure:
 *                         type: string
 *                       expirationDate:
 *                         type: string
 *                         format: date-time
 *                       idUser:
 *                         type: integer
 *                       idCity:
 *                         type: integer
 *                       googleAddress:
 *                         type: string
 *                       city:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       deliverDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                 totalRecords:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.error_server
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
productsRouter.get(
    "/getproductreserved", getProductsReserved
);

/**
 * @swagger
 * /putproductdelivered/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Mark a product as delivered
 *     description: Update the status of a product to delivered by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the product to update.
 *     responses:
 *       200:
 *         description: Product successfully marked as delivered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.successful
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.error_invalid_id
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
productsRouter.put(
    "/putproductdelivered/:id",
    [
        param("id", "product.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    putProductDelivered
);

/**
 * @swagger
 * /deleteProductOrganization/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete a product organization
 *     description: Delete a product organization by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the product organization to delete.
 *     responses:
 *       200:
 *         description: Product organization successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.successful
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.error_invalid_id
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
productsRouter.delete(
    "/deleteProductOrganization/:id",
    [
        param("id", "product.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    deleteProductOrganization
);

/**
 * @swagger
 * /putProductNotReserved/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Mark a product as not reserved 
 *     description: Update the status of a origanization product by its ID for not reserved.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the organization product to update
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.successful
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: object
 *                   properties:
 *                     translationKey:
 *                       type: string
 *                       example: product.error_invalid_data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
productsRouter.put(
    "/putProductNotReserved/:id",
    [
        param("id", "product.validate_field_int").notEmpty().isInt(),
        validateEnpoint
    ],
    putProductNotReserved
);
export default productsRouter;