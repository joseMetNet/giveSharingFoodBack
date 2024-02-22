import { RequestHandler } from "express";
import * as repository from "../repository/Documents.Repository";
import { DocumentsRepositoryService } from "../interface/Documents.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";
import { UploadedFile } from "express-fileupload";

export const uploadFile: RequestHandler = async(req, res) => {
    try {
        const { containerName, blobName } = req.body;
        if (!req.files || Object.keys(req.files).length === 0) {
            res.status(400).send("No files were uploaded.");
            return;
          }
          if (!req.files.filePath) {
            res.status(400).send("No files were uploaded.");
            return;
          }
          const filePath = req.files.filePath as UploadedFile
          filePath.mv('./tmp/' + filePath.name, function(err) {
            if (err)

              return res.status(500).send(err);
          });

        const { code, message, ...resto }: DocumentsRepositoryService = await repository.uploadFile(containerName, `./tmp/${filePath.name}`, blobName);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });  
    }
}

