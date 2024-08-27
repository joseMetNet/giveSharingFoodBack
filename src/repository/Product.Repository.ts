import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import mime from 'mime-types';
import { connectToSqlServer } from "../DB/config"
import { ImageField, PostNewProductData, ProductRepositoryService, filterProduct, postProduct, postProductRepositoryService } from "../interface/Product.Interface";
import { UploadedFile } from "express-fileupload";


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
        const { idProduct, idOrganization, idMeasure, quantity, expirationDate, idUser, price } = data;
        const db = await connectToSqlServer();

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

        const insertQuery = `
        INSERT INTO TB_ProductsOrganization (idProduct, idOrganization, idMeasure, quantity, expirationDate, idStatus, idUser, price)
        OUTPUT INSERTED.*
        VALUES (@idProduct, @idOrganization, @idMeasure, @quantity, @expirationDate, @idStatus, @idUser, @price)`;

        const insertResult = await db?.request()
            .input('idProduct', idProduct)
            .input('idOrganization', idOrganization)
            .input('idMeasure', idMeasure || null)
            .input('quantity', quantity || null)
            .input('expirationDate', expirationDate || null)
            .input('idStatus', 4)
            .input('idUser', idUser)
            .input('price', price)
            .query(insertQuery);

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
                    tbs.[status],
                    tbpo.price
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

export const putProductPreReserved = async (id: number): Promise<ProductRepositoryService> => {
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

        const updateQuery = `UPDATE TB_ProductsOrganization SET idStatus = 9, solicitDate = getDate() WHERE id = ${id}`;
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

export const getProductsPreReserved = async (idUser?: number, idOrganization?: number) => {
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
        tbs.[status],
		tbpo.price
        FROM TB_User AS tbu
        LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
        LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
        LEFT JOIN TB_ProductsOrganization AS tbpo ON tbpo.idUser = tbu.id
        LEFT JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct
        LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbpo.idOrganization
        LEFT JOIN TB_Measure AS tbm ON tbm.id = tbpo.idmeasure
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
        WHERE
        tbs.id = 9 `;

        if (idUser) {
            query += ` AND tbpo.idUser = ${idUser}`;
        }

        if (idOrganization) {
            query += ` AND tbpo.idOrganization = ${idOrganization}`;
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

        const checkProductQuery = `SELECT id FROM TB_ProductsOrganization WHERE id IN (${ids.join(",")})`;
        const checkProductResult: any = await db?.request().query(checkProductQuery);

        const foundIds = checkProductResult.recordset.map((row: any) => row.id);

        if (foundIds.length !== ids.length) {
            return {
                code: 404,
                message: { translationKey: "product.not_found" },
                data: { foundIds, missingIds: ids.filter(id => !foundIds.includes(id)) },
            };
        }

        const updateQuery = `UPDATE TB_ProductsOrganization SET idStatus = 3, solicitDate = getDate() WHERE id IN (${ids.join(",")})`;
        await db?.request().query(updateQuery);

        return {
            code: 200,
            message: { translationKey: "product.successful" },
        };
    } catch (err) {
        console.log("Error al actualizar los productos", err);
        return {
            code: 500,
            message: { translationKey: "product.error_server" },
        };
    }
};

export const getProductsReserved = async (idUser?: number, idOrganization?: number) => {
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
        tbs.[status],
		tbpo.price
        FROM TB_User AS tbu
        LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
        left join TB_Rol as tbr on tbr.id = tbu.idRole
        LEFT JOIN TB_ProductsOrganization AS tbpo ON tbpo.idUser = tbu.id
        LEFT JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct
        LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbpo.idOrganization
        LEFT JOIN TB_Measure AS tbm ON tbm.id = tbpo.idmeasure
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
        WHERE
        tbs.id = 3`;

        if (idUser) {
            query += ` AND tbpo.idUser = ${idUser}`;
        }

        if (idOrganization) {
            query += ` AND tbpo.idOrganization = ${idOrganization}`;
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

export const getProductsDeliveredByOrganization = async(idOrganization?: number): Promise<ProductRepositoryService> => {
    try {
        const db = await connectToSqlServer();
        const queryHistory = `SELECT tbpo.id AS idProductOrganization, tbo.id AS idOrganization, tbo.logo, tbpo.quantity, tbpo.deliverDate, tbpo.expirationDate, tbs.[status], tbto.typeOrganization
                                FROM TB_ProductsOrganization AS tbpo
                                LEFT JOIN TB_Organizations  AS tbo ON tbpo.idOrganization = tbo.id
                                LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
                                LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
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