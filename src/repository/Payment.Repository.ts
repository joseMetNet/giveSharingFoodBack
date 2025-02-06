import mercadopago from "mercadopago";
import { IOrderResponse, IresponseRepositoryService } from "../interface/Subscription.Interfarce";
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
        SELECT status FROM TB_Subscriptions 
        WHERE idOrganization = @idOrganization 
        ORDER BY endDate DESC
      `);

    const existingSubscription = subscriptionCheck?.recordset[0];

    if (existingSubscription && existingSubscription.status === "active") {
      return { code: 400, message: "El usuario ya tiene una suscripción activa." };
    }

    const configCheck = await db?.request().query(`SELECT * FROM TB_SubscriptionConfig`);
    const config = configCheck?.recordset[0];

    if (!config) {
      return { code: 500, message: "Error: No hay configuración de suscripción disponible." };
    }

    const { subscriptionCost, durationMonths, allowFreeSubscription } = config;
    const subscriptionId = `${Date.now()}-${crypto.randomUUID()}`;
    const startDate = new Date();
    const endDate = new Date();
    //endDate.setMonth(startDate.getMonth() + durationMonths); 
    endDate.setMinutes(startDate.getMinutes() + durationMonths);
    let status = "Pago pendiente a la suscripción";

    if (allowFreeSubscription) {
      status = "active";
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

      return { code: 201, message: "subscriptionConfig.succesfull", data: null };
    }

    const result = await mercadopago.preferences.create({
      items: [{ title: "Suscripción GIVESHARINGFOOD", unit_price: subscriptionCost, currency_id: "COP", quantity: 1 }],
      external_reference: subscriptionId,
      // notification_url: "https://6883-176-57-207-35.ngrok-free.app/givesharingfood/webhook",
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

    return { code: 201, message: "subscriptionConfig.succesfull", data: result.body };

  } catch (error) {
    console.error("subscriptionConfig.error_server", error);
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

export const updateSubscriptionConfigRepository = async (subscriptionCost: number, durationMonths: number, allowFreeSubscription: boolean): Promise<IresponseRepositoryService> => {
  try {
    const db = await connectToSqlServer();

    await db?.request()
      .input("subscriptionCost", subscriptionCost)
      .input("durationMonths", durationMonths)
      .input("allowFreeSubscription", allowFreeSubscription)
      .query(`
        UPDATE TB_SubscriptionConfig 
        SET subscriptionCost = @subscriptionCost, 
            durationMonths = @durationMonths, 
            allowFreeSubscription = @allowFreeSubscription
      `);

    return { code: 200, message: "Configuración de suscripción actualizada exitosamente." };
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return { code: 500, message: "Error al actualizar la configuración." };
  }
};
