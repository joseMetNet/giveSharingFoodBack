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

    const configCheck = await db?.request().query(`
      SELECT foundationPays, donorPays, foundationCost, donorCost, durationMonths 
      FROM TB_SubscriptionConfig
    `);

    const orgCheck = await db?.request()
      .input("idOrganization", idOrganization)
      .query(`
        SELECT tbto.typeOrganization, tbo.idTypeOrganitation
        FROM TB_Organizations AS tbo
        LEFT JOIN TB_TypeOrganization AS tbto ON tbo.idTypeOrganitation = tbto.id
        WHERE tbo.id = @idOrganization
      `);

    const config = configCheck?.recordset[0];
    const organization = orgCheck?.recordset[0];

    if (!config || !organization) {
      return { code: 500, message: "Error: No hay configuración de suscripción disponible o la organización no existe." };
    }

    const { foundationPays, donorPays, foundationCost, donorCost, durationMonths } = config;
    const { typeOrganization } = organization;

    let subscriptionCost = 0;
    if (typeOrganization === "Fundación") {
      subscriptionCost = foundationCost;
    } else if (typeOrganization === "Donante") {
      subscriptionCost = donorCost;
    } else {
      return { code: 400, message: "Tipo de organización no válido." };
    }

    const isFreeSubscription = (typeOrganization === "Fundación" && !foundationPays) || 
                               (typeOrganization === "Donante" && !donorPays);

    const subscriptionId = `${Date.now()}-${crypto.randomUUID()}`;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + durationMonths);
    let status = isFreeSubscription ? "active" : "Pago pendiente a la suscripción";

    if (isFreeSubscription) {
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

cron.schedule("0 0 * * *", async () => {
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

export const updateSubscriptionConfigRepository = async (foundationCost: number, donorCost: number, durationMonths: number, foundationPays: boolean, donorPays: boolean
): Promise<IresponseRepositoryService> => {
  try {
    const db = await connectToSqlServer();

    await db?.request()
      .input("foundationCost", foundationCost)
      .input("donorCost", donorCost)
      .input("durationMonths", durationMonths)
      .input("foundationPays", foundationPays)
      .input("donorPays", donorPays)
      .query(`
        UPDATE TB_SubscriptionConfig 
        SET foundationCost = @foundationCost, 
            donorCost = @donorCost, 
            durationMonths = @durationMonths, 
            foundationPays = @foundationPays,
            donorPays = @donorPays
      `);

    return { code: 200, message: "Configuración de suscripción actualizada exitosamente." };
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return { code: 500, message: "Error al actualizar la configuración." };
  }
};

export const getSubscriptionConfigRepository = async (): Promise<IresponseRepositoryService> => {
  try {
    const db = await connectToSqlServer();

    const result = await db?.request().query(`
      SELECT durationMonths, foundationPays, donorPays, foundationCost,	donorCost
      FROM TB_SubscriptionConfig
    `);

    if (!result?.recordset.length) {
      return { code: 404, message: "No se encontró configuración de suscripción." };
    }

    return { code: 200, message: "Configuración obtenida exitosamente.", data: result.recordset[0] };

  } catch (error) {
    console.error("Error al obtener la configuración:", error);
    return { code: 500, message: "Error al obtener la configuración." };
  }
};

export const getSuscriptionUserById = async (data: { idUser: number }): Promise<IresponseRepositoryService> => {
  try {
      const { idUser } = data;
      const db = await connectToSqlServer();
      
      let query = `
          SELECT TOP 1 tbu.id, tbu.idOrganization, tbo.idStatus AS idStatusOrganization, 
                 tbso.status AS statusOrganization, [name], tbu.email, idRole, 
                 tbr.[role], tbs.id AS idStatus, tbs.[status], tbss.status AS subscriptionStatus
          FROM TB_User AS tbu
          LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
          LEFT JOIN TB_Status AS tbs ON tbs.id = tbu.idStatus
          LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbu.idOrganization
          LEFT JOIN TB_Status AS tbso ON tbso.id = tbo.idStatus
          LEFT JOIN TB_Subscriptions AS tbss ON tbo.id = tbss.idOrganization 
          WHERE tbu.id = @idUser
          ORDER BY tbss.id DESC;
      `;

      const result = await db?.request()
                             .input('idUser', idUser)
                             .query(query);
      
      const user = result?.recordset[0];

      if (user) {
          return {
              code: 200,
              message: { translationKey: "user.succesfull" },
              data: user
          };
      } else {
          return {
              code: 204,
              message: { translationKey: "user.not_found" }
          };
      }
  } catch (err) {
      console.log("Error al obtener usuario", err);
      return {
          code: 400,
          message: { translationKey: "user.error_server" },
      };
  }
};
