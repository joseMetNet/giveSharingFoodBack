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
        const { idProduct, idOrganization, idMeasure, quantity, expirationDate } = data;
        const db = await connectToSqlServer();
        const insertQuery = `
        INSERT INTO TB_ProductsOrganization (idproduct,idOrganization,idMeasure,quantity,expirationDate,idStatus)
        OUTPUT INSERTED.*
        VALUES (@idproduct, @idOrganization,@idMeasure,@quantity,@expirationDate,@idStatus)`;

        const insertResult = await db?.request()
            .input('idProduct', idProduct)
            .input('idOrganization', idOrganization)
            .input('idMeasure', idMeasure || null)
            .input('quantity', quantity || null)
            .input('expirationDate', expirationDate || null)
            .input('idStatus', 3)
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