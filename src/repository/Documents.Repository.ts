import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient } from '@azure/storage-blob';
import mime from 'mime-types';
import { connectToSqlServer } from '../DB/config';

export const uploadFile = async (filePath: string, originalBlobName: string, idOrganization: number) => {
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
            .query('INSERT INTO TB_Documents (document, url, idOrganitation) VALUES (@document, @url, @idOrganitation)');

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