import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import mime from 'mime-types';
import { connectToSqlServer } from "../DB/config"
import { ImageField, PostNewProductData, ProductRepositoryService, filterProduct, postProduct, postProductRepositoryService } from "../interface/Product.Interface";
import { NotificationDonor } from "../../templates/notificationsDonor";
import { NotificationFoundation } from "../../templates/notificationFoundation";
import { NotificationAdministrator } from "../../templates/notificationsAdministrator";


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
        const { idProduct, idOrganization, idMeasure, quantity, expirationDate, idUser, price, attendantName, attendantPhone, attendantEmail, attendantAddres, idCity, idDepartment } = data;
        const db = await connectToSqlServer();

        // Verificar si la organización existe
        const checkOrgQuery = `SELECT id FROM TB_Organizations WHERE id = @idOrganization`;
        const orgResult = await db?.request()
            .input('idOrganization', idOrganization)
            .query(checkOrgQuery);

        if (orgResult?.recordset.length === 0) {
            return {
                code: 400,
                message: { translationKey: "product.error_invalid_organization", translationParams: { idOrganization } },
            };
        }

        // Insertar el producto en TB_ProductsOrganization
        const insertQuery = `
        INSERT INTO TB_ProductsOrganization (idProduct, idOrganization, idMeasure, quantity, expirationDate, idStatus, idUser, price, attendantName, attendantPhone, attendantEmail, attendantAddres, idCity, idDepartment)
        OUTPUT INSERTED.*
        VALUES (@idProduct, @idOrganization, @idMeasure, @quantity, @expirationDate, @idStatus, @idUser, @price, @attendantName, @attendantPhone, @attendantEmail, @attendantAddres, @idCity, @idDepartment)`;

        const insertResult = await db?.request()
            .input('idProduct', idProduct)
            .input('idOrganization', idOrganization)
            .input('idMeasure', idMeasure || null)
            .input('quantity', quantity || null)
            .input('expirationDate', expirationDate || null)
            .input('idStatus', 4)
            .input('idUser', idUser)
            .input('price', price)
            .input('attendantName', attendantName || null)
            .input('attendantPhone', attendantPhone || null)
            .input('attendantEmail', attendantEmail || null)
            .input('attendantAddres', attendantAddres || null)
            .input('idCity', idCity || null)
            .input('idDepartment', idDepartment || null)
            .query(insertQuery);

        if (!insertResult?.recordset || insertResult.recordset.length === 0) {
            throw new Error("Error al insertar el producto en la base de datos.");
        }

        // Obtener datos para la notificación
        const selectOrgQuery = `
            SELECT bussisnesName
            FROM TB_Organizations
            WHERE id = @idOrganization
        `;
        const productQuery = `
            SELECT tbp.product
            FROM TB_ProductsOrganization AS tbpo
            JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct
            WHERE tbpo.idProduct = @idProduct
        `;
        const orgResultName = await db?.request()
            .input('idOrganization', idOrganization)
            .query(selectOrgQuery);
        const productResult = await db?.request()
            .input('idProduct', idProduct)
            .query(productQuery);

        const bussisnesName = orgResultName?.recordset[0]?.bussisnesName || "Organización desconocida";
        const productName = productResult?.recordset[0]?.product || "Producto desconocido";

        await NotificationDonor.cnd02({
            productName,
            attendantEmail,
            bussisnesName,
            attendantName,
        });
        // Nueva consulta para obtener correos electrónicos
        const emailQuery = `
            SELECT DISTINCT tbu.email
            FROM TB_User AS tbu
            LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbu.idOrganization
            WHERE tbo.idTypeOrganitation = 1 AND tbu.id != 33 
        `;
        const emailResult = await db?.request().query(emailQuery);

        const emails = emailResult?.recordset.map((row: { email: string }) => row.email) || [];

        for (const email of emails) {
            await NotificationFoundation.cnf02({
                email,
                bussisnesName,
                attendantName,
            });
        }

        await NotificationAdministrator.cna02({
            productName,
            attendantName,
            quantity,
            expirationDate,
        });

        return {
            code: 200,
            message: "product.successful",
            data: insertResult?.recordset
        };
    } catch (err) {
        console.log("Error creating product", err);
        return {
            code: 400,
            message: { translationKey: "product.error_server", translationParams: { name: "postProducts" } },
        };
    }
};

export const postNewProduct = async (data: PostNewProductData): Promise<ProductRepositoryService> => {
    try {
        const { product, idUser, urlImage, urlImagen2, urlImagen3, urlImagen4, urlImagen5, urlImagen6 } = data;

        const db = await connectToSqlServer();

        const insertParams = {
            product,
            idUser,
            blobUrls: [] as string[]
        };

        const imageFiles = [urlImage, urlImagen2, urlImagen3, urlImagen4, urlImagen5, urlImagen6];
        for (let i = 0; i < imageFiles.length; i++) {
            const filePath = imageFiles[i];
            let blobUrl = '';
            if (filePath) {
                try {
                    blobUrl = await uploadImageProductToAzure(filePath);
                } catch (uploadError) {
                    console.error(`Error uploading image for file ${i}:`, uploadError);
                    return {
                        code: 500,
                        message: { translationKey: "product.error_uploading_image" },
                    };
                }
            }

            insertParams.blobUrls.push(blobUrl);
        }

        const insertQuery = `
            INSERT INTO TB_Products (product, urlImage, urlImagen2, urlImagen3, urlImagen4, urlImagen5, urlImagen6, idUser)
            OUTPUT INSERTED.*
            VALUES (@product, @urlImage, @urlImagen2, @urlImagen3, @urlImagen4, @urlImagen5, @urlImagen6, @idUser)`;
        const insertResult = await db?.request()
            .input('product', insertParams.product)
            .input('urlImage', insertParams.blobUrls[0] || null)
            .input('urlImagen2', insertParams.blobUrls[1] || null)
            .input('urlImagen3', insertParams.blobUrls[2] || null)
            .input('urlImagen4', insertParams.blobUrls[3] || null)
            .input('urlImagen5', insertParams.blobUrls[4] || null)
            .input('urlImagen6', insertParams.blobUrls[5] || null)
            .input('idUser', insertParams.idUser)
            .query(insertQuery);

        return {
            code: 200,
            message: "product.successful",
            data: insertResult?.recordset
        };
    } catch (err) {
        console.error("Error creating product", err);
        return {
            code: 400,
            message: { translationKey: "product.error_server" },
        };
    }
};

export const getProductsToDonate = async (filter: filterProduct): Promise<ProductRepositoryService> => {
    try {
        const { productName, idUser } = filter;
        const db = await connectToSqlServer();
        let query = `SELECT DISTINCT tbpo.id, tbp.product, tbp.urlImage,
                    tbo.bussisnesName,
                    tbpo.quantity,
                    tbm.measure,
                    tbpo.expirationDate,
                    tbpo.idUser,
                    (SELECT TOP 1 tbu.idCity FROM TB_User tbu WHERE tbu.idOrganization = tbo.id) AS idCity,
                    (SELECT TOP 1 tbc.city FROM TB_City tbc WHERE tbc.id IN 
                        (SELECT idCity FROM TB_User WHERE idOrganization = tbo.id)
                    ) AS city,
                    tbs.[status],
                    tbpo.price,
                    tbpo.attendantName,
                    tbpo.attendantEmail,
                    tbpo.attendantPhone,
                    tbpo.attendantAddres
                    FROM TB_ProductsOrganization AS tbpo
                    LEFT JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct
                    LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbpo.idOrganization
                    LEFT JOIN TB_User AS tbu ON tbu.idOrganization = tbo.id
                    LEFT JOIN TB_Measure AS tbm ON tbm.id = tbpo.idmeasure
                    LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
                    LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
                    WHERE tbs.id = 4 `;
            
        if (idUser) {
            query += ` AND tbu.idCity = (SELECT idCity FROM TB_User WHERE id = @idUser)`;
        }
            
        if (productName) {
            query += ` AND tbp.product LIKE '%${productName}%'`;
        }

        const products: any = await db?.request().input("idUser", idUser).query(query);

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

export const putProductPreReserved = async (id: number, idOrganizationProductReserved: number): Promise<ProductRepositoryService> => {
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

        const updateQuery = `UPDATE TB_ProductsOrganization SET idStatus = 9, solicitDate = getDate(), idOrganizationProductReserved = ${idOrganizationProductReserved} WHERE id = ${id}`;
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

export const getProductsPreReserved = async (idUser?: number, idOrganization?: number, idOrganizationProductReserved?: number) => {
    try {
        const db = await connectToSqlServer();
        let query = `SELECT DISTINCT
        tbpo.id,
        tbp.product,
        tbp.urlImage,
        tbo.bussisnesName,
        tbpo.quantity,
        tbm.measure,
        tbpo.attendantName,
        tbpo.attendantEmail,
        tbpo.attendantPhone,
        tbpo.attendantAddres,
        tbpo.expirationDate,
        tbpc.city AS attendantCity,
        tbpd.department AS attendantDepartment,
        tbpo.idUser,
        tbu.idCity,
        tbu.googleAddress,
        tbc.city,
        tbu.phone,
        tbpo.deliverDate,
        tbs.[status],
        tbpo.price,
        tbpo.price * tbpo.quantity AS totalPrice
        FROM TB_User AS tbu
        LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
        LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
        LEFT JOIN TB_ProductsOrganization AS tbpo ON tbpo.idUser = tbu.id
        LEFT JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct
        LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbpo.idOrganization
        LEFT JOIN TB_Measure AS tbm ON tbm.id = tbpo.idmeasure
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
        LEFT JOIN TB_City AS tbpc ON tbpc.id = tbpo.idCity
        LEFT JOIN TB_Departments AS tbpd ON tbpd.id = tbpo.idDepartment
        WHERE tbs.id = 9`;

        if (idUser) {
            query += ` AND tbpo.idUser = ${idUser}`;
        }

        if (idOrganization) {
            query += ` AND tbpo.idOrganization = ${idOrganization}`;
        }

        if (idOrganizationProductReserved) {
            query += ` AND tbpo.idOrganizationProductReserved = ${idOrganizationProductReserved}`;
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

export const putProductReserved = async (ids: number[]): Promise<ProductRepositoryService> => {
    try {
        const db = await connectToSqlServer();

        // Verificar los productos en la base de datos
        const checkProductQuery = `
            SELECT id, idOrganizationProductReserved, attendantEmail, idProduct, attendantName 
            FROM TB_ProductsOrganization 
            WHERE id IN (${ids.join(",")})
        `;
        const checkProductResult: any = await db?.request().query(checkProductQuery);

        const foundProducts = checkProductResult.recordset;
        const foundIds = foundProducts.map((row: any) => row.id);

        if (foundIds.length !== ids.length) {
            return {
                code: 404,
                message: { translationKey: "product.not_found" },
                data: { foundIds, missingIds: ids.filter((id) => !foundIds.includes(id)) },
            };
        }

        // Obtener los idProduct únicos para consultar en TB_Products
        const productIds = [...new Set(foundProducts.map((p: any) => p.idProduct))];
        const productQuery = `
            SELECT id, product AS productName 
            FROM TB_Products 
            WHERE id IN (${productIds.join(",")})
        `;
        const productResult: any = await db?.request().query(productQuery);
        const productData = productResult.recordset;

        // Actualizar el estado de los productos
        const updateQuery = `
            UPDATE TB_ProductsOrganization 
            SET idStatus = 3, solicitDate = getDate() 
            WHERE id IN (${ids.join(",")})
        `;
        await db?.request().query(updateQuery);

        // Obtener información de las organizaciones relacionadas
        const organizationIds = [...new Set(foundProducts.map((p: any) => p.idOrganizationProductReserved))];
        const organizationQuery = `
            SELECT id, email, bussisnesName 
            FROM TB_Organizations 
            WHERE id IN (${organizationIds.join(",")})
        `;
        const organizationResult: any = await db?.request().query(organizationQuery);
        const organizationEmails = organizationResult.recordset;

        // Procesar y enviar notificaciones
        await Promise.all(
            foundProducts.map(async (product: any) => {
                const organization = organizationEmails.find((org: any) => org.id === product.idOrganizationProductReserved);
                const productName = productData.find((p: any) => p.idProduct === product.idProduct)?.productName || "Producto";
                //const date = product.solicitDate || new Date().toISOString();
                const today = new Date();
                const date = today.toISOString().split('T')[0];
                // Validar datos necesarios para las notificaciones
                if (!organization) {
                    console.log(`No se encontró organización para el producto ID ${product.id}`);
                    return;
                }

                const productDetails = {
                    attendantName: product.attendantName,
                    bussisnesName: organization.bussisnesName,
                    productName,
                    attendantEmail: product.attendantEmail,
                };
                // Notificación al asistente
                if (product.attendantEmail) {
                    await NotificationDonor.cnd03(productDetails);
                }

                // Notificación a la organización
                if (organization.email) {
                    await NotificationFoundation.cnf03({
                        email: organization.email,
                        bussisnesName: organization.bussisnesName,
                        productName,
                        attendantName: product.attendantName,
                    });
                }
                await NotificationAdministrator.cna03({
                    productName,
                    bussisnesName: organization.bussisnesName,
                    attendantName: product.attendantName,
                    date
                });
            })
        );

        return {
            code: 200,
            message: { translationKey: "product.successful" },
        };
    } catch (err) {
        console.error("Error al actualizar los productos", err);
        return {
            code: 500,
            message: { translationKey: "product.error_server" },
        };
    }
};

export const getProductsReserved = async (idUser?: number, idOrganization?: number, idOrganizationProductReserved?: number) => {
    try {
        const db = await connectToSqlServer();
        let query = `SELECT DISTINCT
        tbpo.id,
        tbp.product,
        tbp.urlImage,
        tbo.bussisnesName,
        tbpo.quantity,
        tbm.measure,
        tbpo.attendantName,
        tbpo.attendantEmail,
        tbpo.attendantPhone,
        tbpo.attendantAddres,
        tbpo.expirationDate,
        tbpc.city AS attendantCity,
        tbpd.department AS attendantDepartment,
        tbpo.idUser,
        tbu.idCity,
        tbu.googleAddress,
        tbc.city,
        tbu.phone,
        tbpo.deliverDate,
        tbs.[status],
        tbpo.price,
        tbpo.price * tbpo.quantity AS totalPrice
        FROM TB_User AS tbu
        LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
        LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
        LEFT JOIN TB_ProductsOrganization AS tbpo ON tbpo.idUser = tbu.id
        LEFT JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct
        LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbpo.idOrganization
        LEFT JOIN TB_Measure AS tbm ON tbm.id = tbpo.idmeasure
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
        LEFT JOIN TB_City AS tbpc ON tbpc.id = tbpo.idCity
        LEFT JOIN TB_Departments AS tbpd ON tbpd.id = tbpo.idDepartment
        WHERE tbs.id = 3`;

        if (idUser) {
            query += ` AND tbpo.idUser = ${idUser}`;
        }

        if (idOrganization) {
            query += ` AND tbpo.idOrganization = ${idOrganization}`;
        }

        if (idOrganizationProductReserved) {
            query += ` AND tbpo.idOrganizationProductReserved = ${idOrganizationProductReserved}`;
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

        // Verificar si el producto existe
        const checkProductQuery = `
            SELECT id, idOrganization, idProduct, attendantEmail, attendantName
            FROM TB_ProductsOrganization 
            WHERE id = ${id}
        `;
        const checkProductResult: any = await db?.request().query(checkProductQuery);

        if (!checkProductResult.recordset || checkProductResult.recordset.length === 0) {
            return {
                code: 404,
                message: { translationKey: "product.not_found" },
            };
        }

        const product = checkProductResult.recordset[0];


        // Actualizar el estado del producto
        const updateQuery = `
            UPDATE TB_ProductsOrganization 
            SET idStatus = 5, deliverDate = getDate() 
            WHERE id = ${id}
        `;
        await db?.request().query(updateQuery);

        // Obtener información de la organización
        const organizationQuery = `
            SELECT email, bussisnesName 
            FROM TB_Organizations 
            WHERE id = ${product.idOrganization}
        `;
        const organizationResult: any = await db?.request().query(organizationQuery);
        const organization = organizationResult.recordset[0];

        if (!organization) {
            console.log(`No se encontró información de la organización para el producto ID ${id}`);
        }

        const productDetails = {
            attendantName: product.attendantName,
            bussisnesName: organization?.bussisnesName,
            attendantEmail: product.attendantEmail,
        };
        // Enviar notificación al asistente
        if (product.attendantEmail) {
            await NotificationDonor.cnd04(productDetails);
        }

        // Enviar notificación a la organización
        if (organization?.email) {
            await NotificationFoundation.cnf04({
                email: organization.email,
                bussisnesName: organization.bussisnesName,
                productId: product.id,
                attendantName: product.attendantName,
            });
        }

        return {
            code: 200,
            message: { translationKey: "product.successful" },
        };
    } catch (err) {
        console.error("Error al actualizar el producto", err);
        return {
            code: 500,
            message: { translationKey: "product.error_server" },
        };
    }
};

export const getProductsDeliveredByOrganization = async(idOrganization?: number): Promise<ProductRepositoryService> => {
    try {
        const db = await connectToSqlServer();
        const queryHistory = `SELECT tbpo.id AS idProductOrganization, tbo.id AS idOrganization, tbo.logo, tbpo.quantity, tbpo.attendantName, tbpo.attendantEmail,
                                tbpo.attendantPhone, tbpo.attendantAddres, tbpc.city AS attendantCity, tbpd.department AS attendantDepartment, tbpo.deliverDate, tbpo.expirationDate, tbs.[status],
                                tbto.typeOrganization, tbpo.price, tbpo.price * tbpo.quantity AS totalPrice
                                FROM TB_ProductsOrganization AS tbpo
                                LEFT JOIN TB_Organizations  AS tbo ON tbpo.idOrganization = tbo.id
                                LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
                                LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
                                LEFT JOIN TB_City AS tbpc ON tbpc.id = tbpo.idCity
                                LEFT JOIN TB_Departments AS tbpd ON tbpd.id = tbpo.idDepartment
                                 WHERE tbpo.idStatus = 5 AND tbo.id = @idOrganization`;
        const result = await db?.request()
                                .input('idOrganization', idOrganization)
                                .query(queryHistory);
        const productHistory = result?.recordset;
        if( productHistory && productHistory.length > 0 ){
            return {
                code: 200,
                message: { translationKey : "product.successful"},
                data: productHistory
            };
        } else {
            return {
                code: 204,
                message: { translationKey : "product.emptyResponse"},
            };
        }
    } catch (err) {
        console.log("Error al traer el historial de productos por organización", err);
        return {
            code: 400,
            message: { translationKey: "product.error_server"},
        }
    }
}

export const deleteProductOrganization = async (id: number): Promise<ProductRepositoryService> => {
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

        const checkQualificationQuery = `SELECT * FROM TB_Qualification WHERE idProductsOrganization = ${id}`;
        const checkQualificationResult: any = await db?.request().query(checkQualificationQuery);

        if (checkQualificationResult.recordset && checkQualificationResult.recordset.length > 0) {
            return {
                code: 400,
                message: { translationKey: "product.cannot_delete_qualified" }
            };
        }

        const deleteQuery = `DELETE FROM TB_ProductsOrganization WHERE id = ${id}`;
        await db?.request().query(deleteQuery);

        return {
            code: 200,
            message: { translationKey: "product.successful" }
        }
    } catch (err) {
        console.log("Error al eliminar producto", err);
        return {
            code: 500,
            message: { translationKey: "product.error_server" },
        };
    }
};


export const putProductNotReserved = async (id: number): Promise<ProductRepositoryService> => {
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

        const updateQuery = `UPDATE TB_ProductsOrganization SET idStatus = 4, solicitDate = getDate() WHERE id = ${id}`;
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

export const uploadImageProductToAzure = async (filePath: string): Promise<string> => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);
        const containerName = process.env.CONTAINERNAME || 'filesgivesharingfood';
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const uniqueId = uuidv4();
        const blobExtension = path.extname(filePath);
        const blobName = `${uniqueId}${blobExtension}`;

        const fileBuffer = fs.readFileSync(filePath);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const fileMimeType = mime.lookup(filePath) || 'application/octet-stream';

        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: fileMimeType }
        });

        const blobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blobName}`;
        return blobUrl;
    } catch (error) {
        console.error('Error uploading image to Azure:', error);
        throw error;
    }
};

export const deleteTemporaryFiles = (productData: PostNewProductData, imageFields: ImageField[]) => {
    for (let field of imageFields) {
        if (productData[field]) {
            try {
                if (fs.existsSync(productData[field]!)) {
                    fs.unlinkSync(productData[field]!);
                }
            } catch (unlinkError) {
                console.error(`Error deleting file ${productData[field]}:`, unlinkError);
            }
        }
    }
};