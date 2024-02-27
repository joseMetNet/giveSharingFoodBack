import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient } from '@azure/storage-blob';
import mime from 'mime-types';
import { connectToSqlServer } from '../DB/config';

export const uploadFile = async (filePath: string, originalBlobName: string) => {
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
            .input('document', blockBlobClient.name)
            .input('url', blobUrl)
            .query('INSERT INTO TB_Documents (document, url) VALUES (@document, @url)');

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
