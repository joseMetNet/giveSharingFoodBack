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
            .input('idStatus', 4)
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
        let query = `SELECT DISTINCT tbpo.id, tbp.product, tbp.urlImage,
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
                    WHERE tbs.id = 4 AND tbu.idCity = (SELECT idCity FROM TB_User WHERE id = tbpo.idUser)`;
            
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

export const putProductReserve = async (id: number): Promise<ProductRepositoryService> => {
    try {
        const db = await connectToSqlServer();

        const checkProductQuery = `SELECT * FROM TB_ProductsOrganization WHERE id = ${id}`;
        const checkProductResult: any = await db?.request().query(checkProductQuery);

        if (!checkProductResult.recordset || checkProductResult.recordset.length === 0) {
            return {
                code: 404,
                message: { translationKey: "product.not_found" },
            };
        }

        const updateQuery = `UPDATE TB_ProductsOrganization SET idStatus = 3, solicitDate = getDate() WHERE id = ${id}`;
        const updateProduct: any = await db?.request().query(updateQuery);

        return {
            code: 200,
            message: { translationKey: "product.successful" },
            data: updateProduct.recordset,
        };
    } catch (err) {
        console.log("Error al actualizar el producto", err);
        return {
            code: 500,
            message: { translationKey: "product.error_server" },
        };
    }
};

export const getProductsReserved = async (idUser?: number) => {
    try {
        const db = await connectToSqlServer();
        let query = `SELECT DISTINCT
        tbpo.id,
        tbp.product,
        tbp.urlImage,
        tbo.bussisnesName,
        tbpo.quantity,
        tbm.measure,
        tbpo.expirationDate,
        tbpo.idUser,
        tbu.idCity,
        tbu.googleAddress,
        tbc.city,
        tbu.phone,
        tbpo.deliverDate,
        tbs.[status]
        FROM TB_User AS tbu
        LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
        left join TB_Rol as tbr on tbr.id = tbu.idRole
        LEFT JOIN TB_ProductsOrganization AS tbpo ON tbpo.idUser = tbu.id
        LEFT JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct
        LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbpo.idOrganization
        LEFT JOIN TB_Measure AS tbm ON tbm.id = tbpo.idmeasure
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
        WHERE
        tbs.id = 3 AND (tbr.id != 2 OR tbr.id != 3 OR tbr.id != 1)`;

        if (idUser) {
            query += ` AND tbpo.idUser = ${idUser}`;
        }
        const productsReserved: any = await db?.request().query(query);
        const totalRecords = productsReserved.recordset.length;
        return {
            code: 200,
            message: { translationKey: "product.successful" },
            data: productsReserved.recordset,
            totalRecords: totalRecords,
        };
    } catch (err) {
        console.log("Error al traer los productos", err);
        return {
            code: 400,
            message: { translationKey: "product.error_server" },
        };
    }
}

export const putProductDelivered = async (id: number): Promise<ProductRepositoryService> => {
    try {
        const db = await connectToSqlServer();

        const checkProductQuery = `SELECT * FROM TB_ProductsOrganization WHERE id = ${id}`;
        const checkProductResult: any = await db?.request().query(checkProductQuery);

        if (!checkProductResult.recordset || checkProductResult.recordset.length === 0) {
            return {
                code: 404,
                message: { translationKey: "product.not_found" },
            };
        }

        const updateQuery = `UPDATE TB_ProductsOrganization SET idStatus = 5, deliverDate = getDate() WHERE id = ${id}`;
        const updateProduct: any = await db?.request().query(updateQuery);

        return {
            code: 200,
            message: { translationKey: "product.successful" },
            data: updateProduct.recordset,
        };
    } catch (err) {
        console.log("Error al actualizar el producto", err);
        return {
            code: 500,
            message: { translationKey: "product.error_server" },
        };
    }
} 

export const deleteProductOrganization = async (id:number): Promise<ProductRepositoryService> => {
    try {
        const db = await connectToSqlServer();
        const checkProductQuery = `SELECT * FROM TB_ProductsOrganization WHERE id = ${id}`;
        const checkProductResult: any = await db?.request().query(checkProductQuery);

        if (!checkProductResult.recordset || checkProductResult.recordset.length === 0) {
            return {
                code: 404,
                message: { translationKey: "product.not_found" },
            };
        }

        const deleteQuery = `DELETE TB_ProductsOrganization WHERE id = ${id}`;
        const deleteProduct: any = await db?.request().query(deleteQuery);

        return {
            code: 200,
            message: {translationKey: "product.successful" },
            data: deleteProduct.recordset,
        }
    } catch (err) {
        console.log("Error al eliminar producto")
        return {
            code: 500,
            message: { translationKey: "product.error_server" }
        }
    }
}