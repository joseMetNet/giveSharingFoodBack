import mercadopago from "mercadopago";
import { IOrderResponse } from "../interface/Subscription.Interfarce";
import { connectToSqlServer } from "../DB/config";
import crypto from "crypto";
import cron from "node-cron";

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_API_KEY!,
});

export const createOrderRepository = async (idOrganization: number): Promise<IOrderResponse> => {
  try {
    const db = await connectToSqlServer();

    const subscriptionCheck = await db?.request()
      .input("idOrganization", idOrganization)
      .query(`
        SELECT status FROM TB_Subscriptions WHERE idOrganization = @idOrganization ORDER BY endDate DESC
      `);

    const existingSubscription = subscriptionCheck?.recordset[0];

    if (existingSubscription && existingSubscription.status === "active") {
      return { code: 400, message: "El usuario ya tiene una suscripción activa." };
    }

    const subscriptionId = `${Date.now()}-${crypto.randomUUID()}`;
    const startDate = new Date();
    const endDate = new Date();
    //endDate.setFullYear(startDate.getFullYear() + 1);
    endDate.setMinutes(startDate.getMinutes() + 5);
    const status = "Pago pendiente a la suscripción";

    const result = await mercadopago.preferences.create({
      items: [{ title: "Suscripción GIVESHARINGFOOD", unit_price: 2000, currency_id: "COP", quantity: 1 }],
      external_reference: subscriptionId,
      //notification_url: "https://b34d-176-57-207-35.ngrok-free.app/givesharingfood/webhook",
      notification_url: "https://givesharingfoodbackend.azurewebsites.net/givesharingfood/webhook",
      back_urls: { success: "https://givesharingfood.azurewebsites.net" },
    });

    await db?.request()
      .input("idOrganization", idOrganization)
      .input("subscriptionId", subscriptionId)
      .input("status", status)
      .input("startDate", startDate)
      .input("endDate", endDate)
      .query(`
        INSERT INTO TB_Subscriptions (idOrganization, subscriptionId, status, startDate, endDate, cancelDate)
        VALUES (@idOrganization, @subscriptionId, @status, @startDate, @endDate, NULL)
      `);

    return { code: 201, message: "Orden y suscripción creadas exitosamente", data: result.body };

  } catch (error) {
    console.error("Error al crear orden en Mercado Pago:", error);
    return { code: 500, message: "Error al procesar la orden" };
  }
};


export const processWebhookRepository = async (subscriptionId: string, status: string): Promise<void> => {
  try {
    if (!subscriptionId) {
      console.error("Error: subscriptionId no válido");
      return;
    }

    const db = await connectToSqlServer();
    const result = await db?.request()
      .input("subscriptionId", subscriptionId)
      .input("status", status)
      .query(`
        UPDATE TB_Subscriptions 
        SET status = @status 
        WHERE subscriptionId = @subscriptionId
      `);

    if (result?.rowsAffected && result.rowsAffected[0] > 0) {
      console.log(`Suscripción ${subscriptionId} actualizada a estado: ${status}`);
    } else {
      console.warn(`Advertencia: No se encontró la suscripción ${subscriptionId} en la base de datos.`);
    }
  } catch (error) {
    console.error("Error actualizando suscripción:", error);
  }
};

//0 0 * * *  Ejecuta todos los dias a la media noche
cron.schedule("* * * * *", async () => {
  console.log("Verificando suscripciones vencidas...");

  const now = new Date();

  try {
    const db = await connectToSqlServer();
    await db?.request()
      .input("now", now)
      .query(`
        UPDATE TB_Subscriptions 
        SET status = 'expired' 
        WHERE endDate <= @now AND status != 'expired'
      `);

    console.log("Suscripciones vencidas actualizadas");
  } catch (error) {
    console.error("Error al actualizar suscripciones vencidas:", error);
  }
});
