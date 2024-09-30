import { RequestHandler } from "express";
import * as repository from "../repository/Documents.Repository";
import { DocumentsRepositoryService } from "../interface/Documents.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";
import { UploadedFile } from "express-fileupload";

export const uploadFile: RequestHandler = async(req, res) => {
    try {
        const { blobName, idOrganization, idTypeDocument } = req.body;
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

        const { code, message, ...resto }: DocumentsRepositoryService = await repository.uploadFile(`./tmp/${filePath.name}`, blobName, idOrganization, idTypeDocument);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });  
    }
}

export const uploadProductFile: RequestHandler = async(req, res) => {
  try {
      const { blobName, idProductOrganization, idTypeDocument } = req.body;
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

      const { code, message, ...resto }: DocumentsRepositoryService = await repository.uploadProductFile(`./tmp/${filePath.name}`, blobName, idProductOrganization, idTypeDocument);
      res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: parseMessageI18n('error_server', req) });  
  }
}

export const updateFileController: RequestHandler = async(req, res) => {
  try {
      const { blobName, idDocument } = req.body;
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

        const { code, message, ...resto }: DocumentsRepositoryService = await repository.updateFileRepository(`./tmp/${filePath.name}`, blobName, idDocument);


        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: parseMessageI18n('error_server', req) });  
  }
}

export const downloadFile: RequestHandler = async (req, res) => {
  try {
      const { idDocument } = req.params;
      const documentId = parseInt(idDocument, 10);

      const { code, message, data, fileName }: DocumentsRepositoryService = await repository.downloadFile(documentId);

      if (code === 200 && data) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.end(data); 
      } else {
        res.status(code).json({ message: parseMessageI18n(message, req) });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: parseMessageI18n('error_server', req) });
  }
};

export const getDocumentType: RequestHandler = async (req, res) => {
  try {
      const { code, message, ...resto }: DocumentsRepositoryService = await repository.getDocumentType();
      res.status(code).json({message: parseMessageI18n(message, req), ...resto});
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: parseMessageI18n('error_server', req)});
  }
}

export const getDocumentsByIdOrganization: RequestHandler = async (req, res) => {
  try {
    const idOrganization = Number(req.params.idOrganization);
      const { code, message, ...resto }: DocumentsRepositoryService = await repository.getDocumentsByIdOrganization(idOrganization);
      res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: parseMessageI18n('error_server', req) });
  }
};