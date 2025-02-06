import { RequestHandler } from "express";
import mercadopago from "mercadopago";
import * as mercadoPagoRepository from "../repository/Payment.Repository";
import { IOrderResponse, IresponseRepositoryService } from "../interface/Subscription.Interfarce";
import { parseMessageI18n } from "../utils/parse-messga-i18";

export const createOrder: RequestHandler = async (req, res) => {
    try {
      const { idOrganization } = req.body;
      if (!idOrganization) {
        return res.status(400).json({ message: "El idOrganization es obligatorio" });
      }
      const { code, message, ...resto }: IOrderResponse = await mercadoPagoRepository.createOrderRepository(idOrganization);
      res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (error) {
      console.error("Error en el controlador:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  };

export const receiveWebhook: RequestHandler = async (req, res) => {
  try {

    const type = req.body.type || req.body.topic;
    const paymentId = req.body.data?.id || req.body.resource;

    if (!type) {
      return res.status(400).json({ message: "Tipo de webhook no manejado" });
    }

    if (type !== "payment") {
      return res.status(400).json({ message: "Tipo de webhook no manejado" });
    }

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID no encontrado en el webhook" });
    }

    try {
      const paymentResponse = await mercadopago.payment.findById(paymentId);
      const payment = paymentResponse?.body;

      if (!payment) {
        return res.status(404).json({ message: "Pago no encontrado en Mercado Pago" });
      }

      const { status, external_reference } = payment;
      console.log(`Pago recibido: ID ${paymentId}, Estado: ${status}, Referencia: ${external_reference}`);

      if (!external_reference) {
        return res.status(400).json({ message: "No se encontró external_reference en el pago" });
      }

      let newStatus = "Pago pendiente";

      switch (status) {
        case "approved":
          newStatus = "active";
          break;
        case "rejected":
          newStatus = "rejected";
          break;
        case "cancelled":
          newStatus = "cancelled";
          break;
        case "refunded":
          newStatus = "refunded";
          break;
        default:
          console.warn(`Estado de pago no manejado: ${status}`);
      }

      if (external_reference.includes("subscription")) {
        newStatus = status === "approved" ? "active" : newStatus;
      }

      await mercadoPagoRepository.processWebhookRepository(external_reference, newStatus);
      return res.status(200).json({ message: "Webhook procesado correctamente" });

    } catch (error) {
      console.error("Error al consultar el pago en Mercado Pago:", error);
      return res.status(500).json({ message: "Error al consultar el pago en Mercado Pago" });
    }

  } catch (error) {
    console.error("Error en Webhook:", error);
    res.status(500).json({ message: "Error procesando el webhook" });
  }
};
export const updateSubscriptionConfig: RequestHandler = async (req, res) => {
  try {
    const { subscriptionCost, durationMonths, allowFreeSubscription } = req.body;
    if (!subscriptionCost || !durationMonths) {
      return res.status(400).json({ message: "El costo y la duración son obligatorios." });
    }
    const { code, message, ...resto }: IresponseRepositoryService = await mercadoPagoRepository.updateSubscriptionConfigRepository(subscriptionCost, durationMonths, allowFreeSubscription
    );
    res.status(code).json({message: parseMessageI18n(message, req), ...resto});
  } catch (error) {
    console.error("Error en el controlador:", error);
    res.status(500).json({message: parseMessageI18n('error_server', req)});
  }
};


