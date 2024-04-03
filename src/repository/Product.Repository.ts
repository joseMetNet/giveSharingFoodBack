import { connectToSqlServer } from "../DB/config"
import { ProductRepositoryService, filterProduct, postProduct, postProductRepositoryService } from "../interface/Product.Interface";

export const getProducts = async (filter: filterProduct): Promise<ProductRepositoryService> => {
    try {
        const { productName } = filter;
        const db = await connectToSqlServer();
        let query = `SELECT * FROM TB_Products`;

        if (productName) {
            query = `SELECT * FROM TB_Products WHERE product LIKE '%${productName}%'`;
        }

        const products: any = await db?.request().query(query);

        if (!products || !products.recordset || !products.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "product.emptyResponse" },
            };
        }

        return {
            code: 200,
            message: { translationKey: "product.successful" },
            data: products.recordset,
        };
    } catch (err) {
        console.log("Error al traer los productos", err);
        return {
            code: 400,
            message: { translationKey: "product.error_server" },
        };
    }
};

export const postProducts = async(data: postProduct): Promise<postProductRepositoryService> => {
    try {
        const { idProduct, idOrganization, idMeasure, quantity, expirationDate, idUser } = data;
        const db = await connectToSqlServer();
        const insertQuery = `
        INSERT INTO TB_ProductsOrganization (idproduct,idOrganization,idMeasure,quantity,expirationDate,idStatus,idUser)
        OUTPUT INSERTED.*
        VALUES (@idproduct, @idOrganization,@idMeasure,@quantity,@expirationDate,@idStatus, @idUser)`;

        const insertResult = await db?.request()
            .input('idProduct', idProduct)
            .input('idOrganization', idOrganization)
            .input('idMeasure', idMeasure || null)
            .input('quantity', quantity || null)
            .input('expirationDate', expirationDate || null)
            .input('idStatus', 2)
            .input('idUser', idUser)
            .query(insertQuery);
        return {
            code: 200,
            message:  "product.successful",
            data: insertResult?.recordset
        }
    } catch (err) {
        console.log("Error creating product", err);
        return {
            code: 400,
            message: {translationKey: "product.error_server", translationParams: {name: "postProducts"} },
        }
    }
}

export const getProductsToDonate = async (filter: filterProduct): Promise<ProductRepositoryService> => {
    try {
        const { productName } = filter;
        const db = await connectToSqlServer();
        let query = `SELECT DISTINCT tbp.product, tbp.urlImage,
                    tbo.bussisnesName,
                    tbpo.quantity,
                    tbm.measure,
                    tbpo.expirationDate,
                    tbpo.idUser,
                    tbu.idCity,
                    tbc.city,
                    tbs.[status]
                    FROM TB_ProductsOrganization AS tbpo
                    LEFT JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct
                    LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbpo.idOrganization
                    LEFT JOIN TB_User AS tbu ON tbu.idOrganization = tbo.id
                    LEFT JOIN TB_Measure AS tbm ON tbm.id = tbpo.idmeasure
                    LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
                    LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
                    WHERE tbs.id = 2 AND tbu.idCity = (SELECT idCity FROM TB_User WHERE id = tbpo.idUser)`;
            
        if (productName) {
            query += ` AND tbp.product LIKE '%${productName}%'`;
        }

        const products: any = await db?.request().query(query);

        if (!products || !products.recordset || !products.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "product.emptyResponse" },
            };
        }
        return {
            code: 200,
            message: { translationKey: "product.successful" },
            data: products.recordset,
        };
    } catch (err) {
        console.log("Error al traer los productos", err);
        return {
            code: 400,
            message: { translationKey: "product.error_server" },
        };
    }
}