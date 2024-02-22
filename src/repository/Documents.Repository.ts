import { BlobServiceClient } from "@azure/storage-blob";
import { connectToSqlServer } from "../DB/config";
import * as fs from 'fs';


export const uploadFile = async (containerName: string, filePath: string, blobName: string) => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        console.log('filepathsss',filePath)
        let fileBuffer: Buffer;
        let fileType: string;

        if (filePath.endsWith('.pdf')) {
            const { PDFDocument } = require('pdf-lib');
            const pdfBytes = fs.readFileSync(filePath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            fileType = 'application/pdf';
            fileBuffer = await pdfDoc.save();
        } else if (filePath.endsWith('.docx')) {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ path: filePath });
            fileType = 'application/msword';
            fileBuffer = Buffer.from(result.value, 'utf-8');
        } else {
            throw new Error('Formato de archivo no compatible. Solo se admiten archivos PDF y Word.');
        }
        const uploadBlobResponse = await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: fileType },
            metadata: { fileName: blobName } 
        });

        console.log(`Archivo ${blobName} subido exitosamente:`, uploadBlobResponse.requestId);

        const db = await connectToSqlServer();

        // Guardar información del archivo en la base de datos
        const blobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blobName}`;

        const result = await db?.request()
        .input('document', blobName)
        //.input('url', blockBlobClient.url + '/' + blobName)// Concatenar el nombre del blob al final de la URL
        .input('url', blobUrl)
        .query('INSERT INTO TB_Documents (document, url) VALUES (@document, @url)');

        console.log("Información del archivo guardada en la base de datos.");
        return {
            code: 200,
            message: { translationKey: "departments.succesfull" },
            data: result
        };
    } catch (err) {
        console.log("Error al subir el archivo", err);
        return {
            code: 400,
            message: { translationKey: "departments.error_server" },
        };
    }
};