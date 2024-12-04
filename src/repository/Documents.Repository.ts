import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient } from '@azure/storage-blob';
import mime from 'mime-types';
import { connectToSqlServer } from '../DB/config';
import { streamToBuffer } from '../helpers/documents.Helper';
import { DocumentsRepositoryService } from '../interface/Documents.Interface';
import { NotificationDonor } from '../../templates/notificationsDonor';
import { NotificationFoundation } from '../../templates/notificationFoundation';

export const getDocumentType = async () => {
    try {
        const db = await connectToSqlServer();
        const typeDocuments: any = await db?.request()
            .query(`SELECT * FROM TB_TypeDocuments`);
        
        if (!typeDocuments || !typeDocuments.recordset || !typeDocuments.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "documents.emptyResponse" },
            };
        }

        return {
            code: 200,
            message: { translationKey: "documents.succesfull" },
            data: typeDocuments.recordset
        }
    } catch (err) {
        console.log("Error al traer tipo de documentos", err)
        return {
            code: 400,
            message: { translationKey: "documents.error_server", translationParams: { name: "getDocumentType" } },
        };        
    };
}

export const uploadFile = async (filePath: string, originalBlobName: string, idOrganization: number, idTypeDocument: number) => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);
        const containerName = process.env.CONTAINERNAME || 'filesgivesharingfood'
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const uniqueId = uuidv4();
        const blobExtension = path.extname(filePath);
        const blobName = `${originalBlobName}_${uniqueId}${blobExtension}`;

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const fileBuffer = fs.readFileSync(filePath);

        const fileMimeType = mime.lookup(filePath) || 'application/octet-stream';

        const uploadBlobResponse = await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: fileMimeType },
            metadata: { originalFileName: originalBlobName }
        });

        const blobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blockBlobClient.name}`;
        const db = await connectToSqlServer();
        const result = await db?.request()
            .input('document', originalBlobName)
            .input('url', blobUrl)
            .input('idOrganitation', idOrganization)
            .input('idTypeDocument', idTypeDocument)
            .query('INSERT INTO TB_Documents (document, url, idOrganitation, idTypeDocument) VALUES (@document, @url, @idOrganitation, @idTypeDocument)');

        return {
            code: 200,
            message: { translationKey: "documents.succesfull" },
            data: uploadBlobResponse
        };
    } catch (err) {
        console.log("Error al subir el archivo", err);
        return {
            code: 400,
            message: { translationKey: "documents.error_server" },
        };
    }
};

export const uploadProductFile = async (filePath: string, originalBlobName: string, idProductOrganization: number, idTypeDocument: number) => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);
        const containerName = process.env.CONTAINERNAME || 'filesgivesharingfood';
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const uniqueId = uuidv4();
        const blobExtension = path.extname(filePath);
        const blobName = `${originalBlobName}_${uniqueId}${blobExtension}`;

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const fileBuffer = fs.readFileSync(filePath);
        const fileMimeType = mime.lookup(filePath) || 'application/octet-stream';

        const uploadBlobResponse = await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: fileMimeType },
            metadata: { originalFileName: originalBlobName },
        });

        const blobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blockBlobClient.name}`;

        // Conexión a la base de datos
        const db = await connectToSqlServer();

        // Obtener idProduct, idOrganization y idOrganizationProductReserved desde TB_ProductsOrganization
        const productOrganizationQuery = `
            SELECT idProduct, idOrganization, idOrganizationProductReserved
            FROM TB_ProductsOrganization
            WHERE id = @idProductOrganization
        `;
        const productOrganizationResult: any = await db?.request()
            .input('idProductOrganization', idProductOrganization)
            .query(productOrganizationQuery);

        const { idProduct, idOrganization, idOrganizationProductReserved } = productOrganizationResult.recordset[0] || {};

        if (!idProduct || !idOrganization) {
            return {
                code: 404,
                message: { translationKey: "organization_or_product.not_found" },
            };
        }

        // Obtener el nombre del producto desde TB_Products
        const productQuery = `
            SELECT product
            FROM TB_Products
            WHERE id = @idProduct
        `;
        const productResult: any = await db?.request()
            .input('idProduct', idProduct)
            .query(productQuery);

        const productName = productResult.recordset[0]?.product || "Producto desconocido";

        // Obtener el email y nombre de la organización principal
        const organizationQuery = `
            SELECT email, bussisnesName
            FROM TB_Organizations
            WHERE id = @idOrganization
        `;
        const organizationResult: any = await db?.request()
            .input('idOrganization', idOrganization)
            .query(organizationQuery);

        const organizationEmail = organizationResult.recordset[0]?.email;
        const organizationName = organizationResult.recordset[0]?.bussisnesName || "Organización desconocida";

        if (!organizationEmail) {
            console.log(`No se encontró email para la organización con ID ${idOrganization}`);
        }

        // Obtener bussisnesName de idOrganizationProductReserved
        const reservedOrganizationQuery = `
            SELECT bussisnesName
            FROM TB_Organizations
            WHERE id = @idOrganizationProductReserved
        `;
        const reservedOrganizationResult: any = await db?.request()
            .input('idOrganizationProductReserved', idOrganizationProductReserved)
            .query(reservedOrganizationQuery);

        const reservedOrganizationName = reservedOrganizationResult.recordset[0]?.bussisnesName || "Organización reservada desconocida";

        // Insertar el registro en TB_ProductDocuments
        await db?.request()
            .input('document', originalBlobName)
            .input('url', blobUrl)
            .input('idProductOrganization', idProductOrganization)
            .input('idTypeDocument', idTypeDocument)
            .query(`
                INSERT INTO TB_ProductDocuments (document, url, idProductOrganization, idTypeDocument)
                VALUES (@document, @url, @idProductOrganization, @idTypeDocument)
            `);
            console.log("email",organizationEmail);
            console.log("bussisnesName",organizationName);
            console.log("productName",productName);
            console.log("reservedOrganizationName",reservedOrganizationName);
        // Enviar notificación a la organización principal
        if (organizationEmail) {
            await NotificationDonor.cnd05({
                email: organizationEmail,
                bussisnesName: organizationName,
                productName,
                reservedOrganizationName,
            });
            
        }
        
        return {
            code: 200,
            message: { translationKey: "documents.successful" },
            data: uploadBlobResponse,
        };
    } catch (err) {
        console.error("Error al subir el archivo", err);
        return {
            code: 400,
            message: { translationKey: "documents.error_server" },
        };
    }
};

export const updateFileRepository = async (filePath: string, newOriginalBlobName: string, idDocument: number) => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);
        const containerName = process.env.CONTAINERNAME || 'filesgivesharingfood'
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const db = await connectToSqlServer();
        const docResult = await db?.request()
            .input('id', idDocument)
            .query('SELECT document, url FROM TB_Documents WHERE id = @id');

        if (!docResult || !docResult.recordset || docResult.recordset.length === 0) {
            throw new Error('Documento no encontrado en la base de datos');
        }

        const document = docResult.recordset[0].document;
        const url = docResult.recordset[0].url;
        const uniqueId = uuidv4();
        const blobExtension = path.extname(filePath);
        const newBlobName = `${newOriginalBlobName}_${uniqueId}${blobExtension}`;
        const blobNameParts = url.split('/');
        const blobName = blobNameParts[blobNameParts.length - 1];

        const blockBlobClientToDelete = containerClient.getBlockBlobClient(blobName);

        await blockBlobClientToDelete.delete();
        const blobExists = await blockBlobClientToDelete.exists();
        if (!blobExists) {
            console.log("Blob eliminado correctamente.");
        } else {
            console.log("¡Error! El blob todavía existe después de la eliminación.");
        }
        const blockBlobClient = containerClient.getBlockBlobClient(newBlobName);

        const fileBuffer = fs.readFileSync(filePath);

        const fileMimeType = mime.lookup(filePath) || 'application/octet-stream';

        const uploadBlobResponse = await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: fileMimeType },
            metadata: { originalFileName: newOriginalBlobName }
        });

        const newBlobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blockBlobClient.name}`;

        const updateResult = await db?.request()
            .input('newDocument', newOriginalBlobName)
            .input('newUrl', newBlobUrl)
            .input('id', idDocument)
            .query('UPDATE TB_Documents SET document = @newDocument, url = @newUrl WHERE id = @id');
        if (!updateResult || updateResult.rowsAffected[0] !== 1) {
            throw new Error('Error al actualizar el documento en la base de datos');
        }

        return {
            code: 200,
            message: { translationKey: "documents.update_success" },
            data: uploadBlobResponse
        };
    } catch (err) {
        console.log("Error al subir el archivo", err);
        return {
            code: 400,
            message: { translationKey: "documents.error_server" },
        };
    }
};

export const downloadFile = async (idDocument: number) => {
    try {
        const db = await connectToSqlServer();

        const result = await db?.request()
            .input('idDocument', idDocument)
            .query('SELECT url, document FROM TB_Documents WHERE id = @idDocument');

        if (!result || result.recordset.length === 0) {
            return {
                code: 404,
                message: { translationKey: "documents.emptyResponse" }
            };
        }

        const fileUrl = result.recordset[0].url;
        let fileName = result.recordset[0].document;
        const blobUrl = new URL(fileUrl);
        const blobName = decodeURIComponent(blobUrl.pathname.split('/').pop() ?? '');
        const extension = blobUrl.pathname.split('.').pop();

        if (!fileName.includes('.')) {
            fileName += `.${extension}`;
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);
        const containerName = process.env.CONTAINERNAME || 'filesgivesharingfood';
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const downloadBlockBlobResponse = await blockBlobClient.download(0);

        if (!downloadBlockBlobResponse.readableStreamBody) {
            return {
                code: 500,
                message: { translationKey: "documents.download_error" }
            };
        }

        const downloadedFile = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

        return {
            code: 200,
            message: { translationKey: "documents.download_successful" },
            data: downloadedFile,
            fileName
        };
    } catch (err) {
        console.log("Error al descargar el archivo", err);
        return {
            code: 400,
            message: { translationKey: "documents.error_server" },
        };
    }
};

export const getDocumentsByIdOrganization = async (idOrganization: number): Promise<DocumentsRepositoryService> => {
    try {
        const db = await connectToSqlServer();

        let queryDocuments = `SELECT tbd.id AS idDocument, tbd.document, tbd.url, tbd.idOrganitation AS idOrganization, tbd.idTypeDocument, tbtd.documentType  
                              FROM TB_Documents AS tbd
                              LEFT JOIN TB_TypeDocuments AS tbtd ON tbtd.id = tbd.idTypeDocument
                              WHERE tbd.idOrganitation = @idOrganization`;

        const result = await db?.request()
                               .input('idOrganization', idOrganization)
                               .query(queryDocuments);

        const documents = result?.recordset;

        if (documents && documents.length > 0) {
            return {
                code: 200,
                message: { translationKey: "documents.succesfull" },
                data: documents
            };
        } else {
            return {
                code: 204,
                message: { translationKey: "documents.emptyResponse" }
            };
        }
    } catch (err) {
        console.log("Error al traer documentos", err);
        return {
            code: 400,
            message: { translationKey: "documents.error_server" },
        };
    }
};

export const getStatusDocuments = async () => {
    try {
        const db = await connectToSqlServer();
        const statusDocuments: any = await db?.request()
            .query(`SELECT * FROM  TB_Status WHERE id IN (12, 13)`);
        
        if (!statusDocuments || !statusDocuments.recordset || !statusDocuments.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "documents.emptyResponse" },
            };
        }

        return {
            code: 200,
            message: { translationKey: "documents.succesfull" },
            data: statusDocuments.recordset
        }
    } catch (err) {
        console.log("Error al traer estados de documentos", err)
        return {
            code: 400,
            message: { translationKey: "documents.error_server", translationParams: { name: "getStatusDocuments" } },
        };        
    };
}

export const putAcceptedOrRejectedDocument = async (
    id: number,
    idStatus: number,
    observations: string | null
): Promise<DocumentsRepositoryService> => {
    try {
        const db = await connectToSqlServer();

        // Obtener el estado actual y el idProductOrganization del documento
        const documentQuery = `
            SELECT idStatus, idProductOrganization
            FROM TB_ProductDocuments
            WHERE id = @id
        `;
        const documentResult: any = await db?.request().input('id', id).query(documentQuery);
        const currentStatus = documentResult?.recordset[0]?.idStatus;
        const idProductOrganization = documentResult?.recordset[0]?.idProductOrganization;

        if (!currentStatus || !idProductOrganization) {
            return {
                code: 404,
                message: 'documents.emptyResponse',
            };
        }

        // Actualizar el estado y las observaciones del documento
        const updateQuery = `
            UPDATE TB_ProductDocuments
            SET idStatus = @newStatus, observations = @observations
            WHERE id = @id
        `;
        await db?.request()
            .input('id', id)
            .input('newStatus', idStatus)
            .input('observations', observations || null)
            .query(updateQuery);

        // Obtener idOrganizationProductReserved de TB_ProductsOrganization
        const organizationProductQuery = `
            SELECT idOrganizationProductReserved
            FROM TB_ProductsOrganization
            WHERE id = @idProductOrganization
        `;
        const organizationProductResult: any = await db?.request()
            .input('idProductOrganization', idProductOrganization)
            .query(organizationProductQuery);
        const idOrganizationProductReserved = organizationProductResult?.recordset[0]?.idOrganizationProductReserved;

        if (!idOrganizationProductReserved) {
            console.log("No se encontró idOrganizationProductReserved.");
            return {
                code: 200,
                message: idStatus === 13 ? 'documents.rejected' : 'documents.accepted',
            };
        }

        const organizationQuery = `
            SELECT email, bussisnesName
            FROM TB_Organizations
            WHERE id = @idOrganizationProductReserved
        `;
        const organizationResult: any = await db?.request()
            .input('idOrganizationProductReserved', idOrganizationProductReserved)
            .query(organizationQuery);
        const organizationEmail = organizationResult?.recordset[0]?.email;
        const organizationName = organizationResult?.recordset[0]?.bussisnesName || "Organización desconocida";

        
        if (organizationEmail) {
            await NotificationFoundation.cnf05({
                email: organizationEmail,
                bussisnesName: organizationName,
            });
        }

        return {
            code: 200,
            message: idStatus === 13 ? 'documents.rejected' : 'documents.accepted',
        };
    } catch (err) {
        console.error("Error al cambiar el estado del documento", err);
        return {
            code: 400,
            message: { translationKey: "documents.error_server" },
        };
    }
};

export const updateProductFile = async (filePath: string, newOriginalBlobName: string, idProductDocument: number) => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);
        const containerName = process.env.CONTAINERNAME || 'filesgivesharingfood';
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const db = await connectToSqlServer();

        const docResult = await db?.request()
            .input('id', idProductDocument)
            .query('SELECT document, url FROM TB_ProductDocuments WHERE id = @id');

        if (!docResult || !docResult.recordset || docResult.recordset.length === 0) {
            throw new Error('Documento no encontrado en la base de datos');
        }

        const document = docResult.recordset[0].document;
        const url = docResult.recordset[0].url;

        const uniqueId = uuidv4();
        const blobExtension = path.extname(filePath);
        const newBlobName = `${newOriginalBlobName}_${uniqueId}${blobExtension}`;

        const blobNameParts = url.split('/');
        const oldBlobName = blobNameParts[blobNameParts.length - 1];

        const blockBlobClientToDelete = containerClient.getBlockBlobClient(oldBlobName);
        await blockBlobClientToDelete.delete();
        const blobExists = await blockBlobClientToDelete.exists();

        if (!blobExists) {
            console.log("Blob eliminado correctamente.");
        } else {
            console.log("¡Error! El blob todavía existe después de la eliminación.");
        }

        const blockBlobClient = containerClient.getBlockBlobClient(newBlobName);
        const fileBuffer = fs.readFileSync(filePath);
        const fileMimeType = mime.lookup(filePath) || 'application/octet-stream';

        const uploadBlobResponse = await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: fileMimeType },
            metadata: { originalFileName: newOriginalBlobName }
        });

        const newBlobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blockBlobClient.name}`;

        const updateResult = await db?.request()
            .input('newDocument', newOriginalBlobName)
            .input('newUrl', newBlobUrl)
            .input('id', idProductDocument)
            .query('UPDATE TB_ProductDocuments SET document = @newDocument, url = @newUrl WHERE id = @id');

        if (!updateResult || updateResult.rowsAffected[0] !== 1) {
            throw new Error('Error al actualizar el documento en la base de datos');
        }

        return {
            code: 200,
            message: { translationKey: "documents.update_success" },
            data: uploadBlobResponse
        };
    } catch (err) {
        console.log("Error al actualizar el archivo", err);
        return {
            code: 400,
            message: { translationKey: "documents.error_server" },
        };
    }
};

