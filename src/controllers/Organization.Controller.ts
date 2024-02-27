import { RequestHandler } from "express";
import * as repository from "../repository/Organization.Repository";
import { IresponseRepositoryService, IresponseRepositoryServiceGet } from "../interface/Organization.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";
import { json } from "sequelize";
import { UploadedFile } from "express-fileupload";

export const createOrganization: RequestHandler = async(req, res) => {
    try {
        console.log("llego")
        const { code, message, ...resto }: IresponseRepositoryService = await repository.postOrganization(req.body);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: parseMessageI18n("error_server", req)})
    }
}

export const getOrganizationById: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const {code,message, ...resto}: IresponseRepositoryServiceGet = await repository.getOrganizationById({id});
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto})

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
}

export const updateOrganizationById: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
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
        const {code,message, ...resto}: IresponseRepositoryServiceGet = await repository.updateOrganization(id,`./tmp/${filePath.name}`,req.body);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto})
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
}