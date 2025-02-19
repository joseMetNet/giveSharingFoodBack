import { Router } from "express";
import {
  createOrder,
  getSubscriptionConfig,
  getSuscriptionUserById,
  receiveWebhook,
  updateSubscriptionConfig,
} from "../controllers/CreateSubscription.Controller";
import { param } from "express-validator";
import { validateEnpoint } from "../middlewares/validatorEnpoint";

const router = Router();

/**
 * @swagger
 * /create-order:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Create a new order
 *     description: Create a new order with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idOrganization:
 *                 type: integer
 *                 description: ID of the organization
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/create-order", createOrder);

router.post("/webhook", receiveWebhook);


/**
 * @swagger
 * /subscription-config:
 *   put:
 *     tags:
 *       - Subscriptions
 *     summary: Update subscription configuration
 *     description: Modify the configuration settings of a subscription.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscriptionCost:
 *                 type: number
 *               durationMonths:
 *                 type: integer
 *               foundationPays:
 *                 type: boolean
 *               donorPays:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Subscription updated successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put("/subscription-config", updateSubscriptionConfig);

/**
 * @swagger
 * /getSubscriptionConfig:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Get subscription configuration
 *     description: Retrieve the current subscription settings.
 *     responses:
 *       200:
 *         description: Subscription configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Configuración obtenida exitosamente."
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscriptionCost:
 *                       type: number
 *                     durationMonths:
 *                       type: integer
 *                     foundationPays:
 *                       type: boolean
 *                     donorPays:
 *                       type: boolean
 *       404:
 *         description: No subscription configuration found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontró configuración de suscripción."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener la configuración."
 */
router.get("/getSubscriptionConfig", getSubscriptionConfig);

/**
 * @swagger
 * /getSuscriptionUserById/{idUser}:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Get user by ID
 *     description: Retrieve user details based on their unique ID.
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         description: ID of the user to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 idOrganization:
 *                   type: integer
 *                 idStatusOrganization:
 *                   type: integer
 *                 statusOrganization:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 idRole:
 *                   type: integer
 *                 role:
 *                   type: string
 *                 idStatus:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 subscriptionStatus:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user.invalid_id
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user.not_found
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

router.get(
  "/getSuscriptionUserById/:idUser",
  [
      param("idUser", "user.invalid_id").notEmpty().isInt(),
      validateEnpoint
  ],
  getSuscriptionUserById
);

export default router;
