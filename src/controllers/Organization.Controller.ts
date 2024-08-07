import { RequestHandler } from "express";
import * as repository from "../repository/Organization.Repository";
import { IresponseRepositoryService, IresponseRepositoryServiceGet } from "../interface/Organization.Interface";
import { parseMessageI18n } from "../utils/parse-messga-i18";
import { UploadedFile } from "express-fileupload";

export const createOrganization: RequestHandler = async(req, res) => {
    try {
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

        let filePath: string = '';

        if (req.files && req.files.filePath) {
            const uploadedFile = req.files.filePath as UploadedFile;
            filePath = './tmp/' + uploadedFile.name;
            
            uploadedFile.mv(filePath, function(err) {
                if (err) {
                    return res.status(500).send(err);
                }
            });
        }

        const { code, message, ...resto }: IresponseRepositoryServiceGet = await repository.updateOrganization(id, filePath, req.body);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
};

export const getListOrganizations: RequestHandler = async (req, res) => {
    try {
        let { page = 0, size = 10 } = req.query;
        
        page = parseInt(page as string, 10);
        size = parseInt(size as string, 10);
        const { code, message, ...resto }: IresponseRepositoryServiceGet = await repository.getListOrganizations(page, size);
        res.status(code).json({message: parseMessageI18n(message, req), ...resto});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req)});
    }
}

export const getListOrganizationById: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const {code,message, ...resto}: IresponseRepositoryServiceGet = await repository.getListOrganizationById({id});
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto})

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
}

export const getDonationHistory: RequestHandler = async (req, res) => {
    try {
        const { code, message, ...resto }: IresponseRepositoryServiceGet = await repository.getDonationHistory(req.params);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
}

export const getDonationHistoryById: RequestHandler = async (req, res) => {
    try {
        const { code, message, ...resto }: IresponseRepositoryServiceGet = await repository.getDonationHistoryById(req.params);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
}

export const putActiveOrInactiveOrganization: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        console.log("llego...")
        const { code, message, ...resto }: IresponseRepositoryServiceGet = await repository.putActiveOrInactiveOrganization(id);
        res.status(code).json({ message: parseMessageI18n(message, req), ...resto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: parseMessageI18n('error_server', req) });
    }
}