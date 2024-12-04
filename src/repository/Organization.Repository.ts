import { connectToSqlServer } from "../DB/config";
import { IresponseRepositoryService, IresponseRepositoryServiceGet, dataOrganization, idHistory, updateOrganizationById } from "../interface/Organization.Interface";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import mime from 'mime-types';
import { createUserInUserManagement } from "../helpers/UserManagment.Helper";
import { NotificationDonor } from "../../templates/notificationsDonor";
import { NotificationAdministrator } from "../../templates/notificationsAdministrator";
import { NotificationFoundation } from "../../templates/notificationFoundation";

export const postOrganization = async (data: dataOrganization): Promise<IresponseRepositoryService> => {
    try {
        const { representativaName, bussisnesName, email, password, representativePhone, idTypeOrganitation } = data;
        const db = await connectToSqlServer();

        const typeOrgCheckQuery = `SELECT id FROM TB_TypeOrganization WHERE id = @idTypeOrganitation`;
        const typeOrgResult = await db?.request()
            .input('idTypeOrganitation', idTypeOrganitation)
            .query(typeOrgCheckQuery);

        if (typeOrgResult?.recordset.length === 0) {
            return {
                code: 400,
                message: { translationKey: "organizations.invalid_type_organization", translationParams: { idTypeOrganitation } },
            };
        }

        const emailCheckQuery = `
            SELECT COUNT(*) AS emailCount
            FROM TB_Organizations
            WHERE email = @email
        `;
        const emailCheckResult = await db?.request()
            .input('email', email)
            .query(emailCheckQuery);

        const existingEmailCount = emailCheckResult?.recordset[0]?.emailCount || 0;

        if (existingEmailCount > 0) {
            return {
                code: 400,
                message: 'organizations.exist_mail',
            };
        }

        const insertOrganization = `
            INSERT INTO TB_Organizations (representativaName, bussisnesName, email, representativePhone, idTypeOrganitation)
            OUTPUT inserted.id, inserted.representativaName, inserted.bussisnesName, inserted.email, inserted.representativePhone, inserted.idTypeOrganitation
            VALUES (@representativaName, @bussisnesName, @email, @representativePhone, @idTypeOrganitation)
        `;
        const insertResult = await db?.request()
            .input('representativaName', representativaName)
            .input('bussisnesName', bussisnesName)
            .input('email', email)
            .input('representativePhone', representativePhone)
            .input('idTypeOrganitation', idTypeOrganitation)
            .query(insertOrganization);

        const insertedOrganization = insertResult?.recordset[0];

        const idRole = idTypeOrganitation === 1 ? 3 : idTypeOrganitation === 2 ? 2 : 1;

        const idAuth = await createUserInUserManagement(email, password);

        const insertUser = `
            INSERT INTO TB_User (name, phone, email, idRole, idOrganization, idAuth, idStatus)
            VALUES (@name, @phone, @email, @idRole, @idOrganization, @idAuth, @idStatus)
        `;
        const insertUserResult = await db?.request()
            .input('name', representativaName)
            .input('phone', representativePhone)
            .input('email', email)
            .input('idRole', idRole)
            .input('idOrganization', insertedOrganization.id)
            .input('idAuth', idAuth)
            .input('idStatus', 7)
            .query(insertUser);

    
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];

        // Agregar la fecha al objeto de organización
        insertedOrganization.createdDate = formattedDate;

            if (idTypeOrganitation === 2) {
                await NotificationDonor.cnd01(insertedOrganization); 
            }
    
            if (idTypeOrganitation === 1 || idTypeOrganitation === 2) {
                await NotificationAdministrator.cna01(insertedOrganization);
            }

        return {
            code: 200,
            message: 'organizations.successful',
            data: insertedOrganization
        };
    } catch (err) {
        console.log("Error creating organization", err);
        return {
            code: 400,
            message: { translationKey: "organizations.error_server", translationParams: { name: "createOrganization" } },
        };
    }
};

export const getOrganizationById = async (filter: { id: number }): Promise<IresponseRepositoryServiceGet> => {
    try {
        const { id } = filter;
        const db = await connectToSqlServer();
        const organizationId = `
        SELECT DISTINCT tbo.logo, tbo.bussisnesName AS razonSocial, tbti.typeIdentification, tbo.identification, tbo.dv,
        tbo.representativaName, tbo.representativePhone, tbo.email AS emailRepresentative,
        tbu.name, tbu.phone, tbu.email, tbu.googleAddress, tbc.City, tbd.department
        FROM TB_Organizations AS tbo
        LEFT JOIN TB_TypeIdentification AS tbti ON tbti.id = tbo.idTypeIdentification
        LEFT JOIN TB_User AS tbu ON tbu.idOrganization = tbo.id
        LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
        LEFT JOIN TB_Departments AS tbd ON tbd.id = tbc.idDepartment
        LEFT JOIN TB_Documents AS tbds ON tbds.idOrganitation = tbo.id
            WHERE tbo.id = @id`;
        const result = await db?.request()
            .input('id', id)
            .query(organizationId);
        const organization = result?.recordset;
        if (organization && organization.length > 0) {
            return {
                code: 200,
                message: { translationKey: "organizations.successful" },
                data: organization
            };
        } else {
            return {
                code: 400,
                message: { translationKey: "organizations.emptyResponse" }
            };
        }
    } catch (err) {
        return {
            code: 400,
            message: { translationKey: "organizations.error_server" },
        };
    }
}

export const updateOrganization = async (id: number, filePath: string, data: updateOrganizationById): Promise<IresponseRepositoryServiceGet> => {
    try {
        const { bussisnesName, idTypeIdentification, identification, dv, representativaName, representativePhone, representativeEmail,
            name, phone, email, idCity, googleAddress, observations } = data;

            const allowedImageExtensions = ['.jpg', '.jpeg', '.png'];

            let fileExtension = '';
            if (filePath !== '') {
                fileExtension = path.extname(filePath).toLowerCase();
            }
    
            if (filePath !== '' && !allowedImageExtensions.includes(fileExtension)) {
                return {
                    code: 400,
                    message: { translationKey: "organizations.invalid_image" },
                };
            }
    
            const db = await connectToSqlServer();
    
            let blobUrl = '';
            if (filePath !== '') {
                blobUrl = await uploadImageToAzure(filePath);
            }
    
            const existingFilePathQuery = `
                SELECT logo FROM TB_Organizations WHERE id = @id
            `;
    
            const existingFilePathResult = await db?.request()
                .input('id', id)
                .query(existingFilePathQuery);
    
            let existingFilePath = existingFilePathResult?.recordset[0]?.logo || '';
    
            if (filePath === '') {
                blobUrl = existingFilePath;
            }

        const existingEmailQuery = `
            SELECT TOP 1 email FROM TB_Organizations WHERE id = @id
        `;

        const existingEmailResult = await db?.request()
            .input('id', id)
            .query(existingEmailQuery);

        const existingEmail = existingEmailResult?.recordset[0]?.email;

        let emailAlreadyExists = false;
        if (existingEmail !== representativeEmail) {
            const emailCheckQuery = `
                SELECT COUNT(*) AS emailCount FROM TB_Organizations WHERE email = @representativeEmail
            `;

            const emailCheckResult = await db?.request()
                .input('representativeEmail', representativeEmail)
                .query(emailCheckQuery);

            emailAlreadyExists = emailCheckResult?.recordset[0]?.emailCount > 0;

            if (emailAlreadyExists) {
                return {
                    code: 400,
                    message: { translationKey: "organizations.email_already_exists" },
                };
            }
        }

        const existingEmailQueryUser = `
            SELECT TOP 1 email FROM TB_User WHERE idOrganization = @idOrganization
        `;

        const existingEmailResultUser = await db?.request()
            .input('idOrganization', id)
            .query(existingEmailQueryUser);

        const existingEmailUser = existingEmailResultUser?.recordset[0]?.email;

        let emailAlreadyExistsUser = false;
        if (existingEmailUser !== email) {
            const emailCheckQueryUser = `
                SELECT COUNT(*) AS emailCount FROM TB_User WHERE email = @email
            `;

            const emailCheckResultUser = await db?.request()
                .input('email', email)
                .query(emailCheckQueryUser);

            emailAlreadyExistsUser = emailCheckResultUser?.recordset[0]?.emailCount > 0;

            if (emailAlreadyExistsUser) {
                return {
                    code: 400,
                    message: { translationKey: "organizations.email_already_exists" },
                };
            }
        }

        const updatedUserQuery = `
            UPDATE TB_User SET 
                name = CASE WHEN @name IS NOT NULL THEN @name ELSE name END,
                phone = CASE WHEN @phone IS NOT NULL THEN @phone ELSE phone END,
                email = CASE WHEN @email IS NOT NULL THEN @email ELSE email END,
                idCity = CASE WHEN @idCity IS NOT NULL THEN @idCity ELSE idCity END,
                googleAddress = CASE WHEN @googleAddress IS NOT NULL THEN @googleAddress ELSE googleAddress END
            WHERE idOrganization = @idOrganization AND idRole in (2,3)
        `;
        
        const updateOrganizationQuery = `
            UPDATE TB_Organizations SET 
                bussisnesName = CASE WHEN @bussisnesName IS NOT NULL THEN @bussisnesName ELSE bussisnesName END,
                idTypeIdentification = CASE WHEN @idTypeIdentification IS NOT NULL THEN @idTypeIdentification ELSE idTypeIdentification END,
                identification = CASE WHEN @identification IS NOT NULL THEN @identification ELSE identification END,
                dv = CASE WHEN @dv IS NOT NULL THEN @dv ELSE dv END,
                representativaName = CASE WHEN @representativaName IS NOT NULL THEN @representativaName ELSE representativaName END,
                representativePhone = CASE WHEN @representativePhone IS NOT NULL THEN @representativePhone ELSE representativePhone END,
                email = CASE WHEN @representativeEmail IS NOT NULL THEN @representativeEmail ELSE email END,
                logo = CASE WHEN @logo IS NOT NULL THEN @logo ELSE logo END,
                idStatus = CASE WHEN @idStatus IS NOT NULL THEN @idStatus ELSE idStatus END,
                observations = CASE WHEN @observations IS NOT NULL THEN @observations ELSE observations END
            WHERE id = @id
        `;
        
        const updatedOrganization = await db?.request()
            .input('bussisnesName', bussisnesName)
            .input('idTypeIdentification', idTypeIdentification)
            .input('identification', identification)
            .input('dv', dv)
            .input('representativaName', representativaName)
            .input('representativePhone', representativePhone)
            .input('representativeEmail', representativeEmail)
            .input('logo', blobUrl)
            .input('idStatus', 1)
            .input('observations', observations)
            .input('id', id)
            .query(updateOrganizationQuery);
            
        const updatedUser = await db?.request()
            .input('name', name)
            .input('phone', phone)
            .input('email', email)
            .input('idCity', idCity)
            .input('googleAddress', googleAddress)
            .input('idOrganization', id)
            .query(updatedUserQuery);

        return {
            code: 200,
            message: { translationKey: "organizations.updated" },
        };
    } catch (err) {
        console.log("Error updating organization", err);
        return {
            code: 400,
            message: { translationKey: "organizations.error_server" },
        };
    }
};

export const getListOrganizations = async (page: number = 0, size: number = 10, status?: string) => {
    try {
        const db = await connectToSqlServer();

        const offset = page * size;

        let statusFilter = "";
        if (status) {
            statusFilter = `WHERE tbs.[status] = '${status}'`;
        }

        const query = `
            SELECT DISTINCT 
                tbo.id, 
                tbto.typeOrganization, 
                tbs.[status] AS organizationStatus, 
                tbo.bussisnesName, 
                tbu.phone, 
                tbo.email, 
                tbu.idStatus AS userIdStatus, 
                tbs2.[status] AS userStatus 
            FROM TB_Organizations AS tbo
            LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
            LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus
            LEFT JOIN TB_User AS tbu ON tbu.idOrganization = tbo.id
            LEFT JOIN TB_Status AS tbs2 ON tbs2.id = tbu.idStatus
            ${statusFilter}
            ORDER BY tbo.id DESC
            OFFSET ${offset} ROWS
            FETCH NEXT ${size} ROWS ONLY`;

        const organizations: any = await db?.request().query(query);

        if (!organizations || !organizations.recordset || !organizations.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "organizations.emptyResponse" },
            };
        }
        console.log(statusFilter)
        const totalCountQuery = await db?.request().query(`SELECT COUNT(*) AS totalCount FROM TB_Organizations AS tbo
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus ${statusFilter}`);
        const totalCount = totalCountQuery?.recordset[0].totalCount;

        const totalPages = Math.ceil(totalCount / size);

        return {
            code: 200,
            message: { translationKey: "organizations.successful" },
            data: {
                organizations: organizations.recordset,
                pagination: {
                    totalCount,
                    totalPages,
                    currentPage: page,
                    size,
                }
            }
        }
    } catch (err) {
        console.log(err)
        return {
            code: 400,
            message: { translationKey: "organizations.error_server" },
        };
    }
}

export const getListOrganizationById = async (filter: { id: number }): Promise<IresponseRepositoryServiceGet> => {
    try {
        const { id } = filter;
        const db = await connectToSqlServer();
        const organizationId = `
                SELECT
                tbo.id, logo, bussisnesName AS razonSocial, tbti.typeIdentification, identification, dv, representativaName, 
                representativePhone, tbo.email AS representativeEmail, tbs.[status], tbu.googleAddress, tbc.city, td.department, tbu.[name], 
                tbu.phone, tbu.email, tbo.observations, AVG(tbq.qualification) AS avgQualification
                FROM TB_Organizations AS tbo
                LEFT JOIN TB_TypeIdentification AS tbti ON tbti.id = tbo.idTypeIdentification
                LEFT JOIN TB_User AS tbu ON tbu.idOrganization = tbo.id
                LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
                LEFT JOIN TB_Departments AS td ON td.id = tbc.idDepartment
                LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus
                LEFT JOIN TB_Qualification AS tbq ON tbq.idOrganization = tbo.id
                WHERE tbo.id = @id AND tbu.idRole NOT IN (4,5)
                GROUP BY
                tbo.id, logo, bussisnesName, tbti.typeIdentification,  identification, dv, representativaName, representativePhone, 
                tbo.email,  tbs.[status], tbu.googleAddress, tbc.city, td.department, tbu.[name], tbu.phone, tbu.email, tbo.observations`;

        const usersQuery = `
        SELECT tbu.idAuth, tbu.[name], tbu.phone, tbu.email, tbr.[role], tbc.city, tbu.googleAddress, tbd.department, tbu.idStatus, tbs.[status]
        FROM TB_User AS tbu
        LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
        LEFT JOIN TB_Departments AS tbd ON tbd.id = tbu.idDepartmen
        LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbu.idStatus
        WHERE idOrganization = @id AND tbu.idRole NOT IN (1,2,3)`;

        const documentsOrganizatios = `
        SELECT id, idOrganitation, document, [url] FROM TB_Documents WHERE idOrganitation = @id`;

        const resultDocuments = await db?.request()
            .input('id', id)
            .query(documentsOrganizatios);

        const resultUsers = await db?.request()
            .input('id', id)
            .query(usersQuery);

        const result = await db?.request()
            .input('id', id)
            .query(organizationId);

        const organization = result?.recordset;
        const users = resultUsers?.recordset;
        const documents = resultDocuments?.recordset;

        if (organization && organization.length > 0) {
            return {
                code: 200,
                message: { translationKey: "organizations.successful" },
                data: {
                    organization,
                    users,
                    documents
                }
            };
        } else {
            return {
                code: 400,
                message: { translationKey: "organizations.emptyResponse" }
            };
        }
    } catch (err) {
        return {
            code: 400,
            message: { translationKey: "organizations.error_server" },
        };
    }
}

export const uploadImageToAzure = async (filePath: string): Promise<string> => {

    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);
    const containerName = process.env.CONTAINERNAME || 'filesgivesharingfood'
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const uniqueId = uuidv4();
    const blobExtension = path.extname(filePath);
    const blobName = `${uniqueId}${blobExtension}`;
    const fileBuffer = fs.readFileSync(filePath);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const fileMimeType = mime.lookup(filePath) || 'application/octet-stream';

    const uploadBlobResponse = await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: fileMimeType }
    });
    const blobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/filesgivesharingfood/${blobName}`;

    return blobUrl;
};

export const getDonationHistory = async (id: idHistory): Promise<IresponseRepositoryServiceGet> => {
    try {
        const { idOrganization, idOrganizationProductReserved } = id;
        const db = await connectToSqlServer();

        let queryHistory = `
            SELECT 
                tbo.id AS idOrganization,
                tbo.identification AS NIT,
                tbpo.id AS idProductOrganization,
                tbo.bussisnesName,
                tbpo.quantity,
                tbpo.attendantName,
                tbpo.attendantEmail,
                tbpo.attendantPhone,
                tbpo.attendantAddres,
                tbpc.city AS attendantCity,
                tbpd.department AS attendantDepartment,
                tbpo.price, 
                tbpo.price * tbpo.quantity AS totalPrice,
                tbpo.deliverDate,
                tbpo.solicitDate,
                tbs.[status],
                ROUND(AVG(CAST(tbq.qualification AS FLOAT)), 2) AS qualification,
                tbto.typeOrganization,
                tbp.product,
                tbp.urlImage,
                tbo.logo,
                tbdp.id AS idProductDocument,
                tbdp.idStatus AS idProductDocumentStatus,
                tbsd.[status] AS productDocumentStatus,
                tbdp.url
            FROM 
                TB_ProductsOrganization AS tbpo
                LEFT JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct
                LEFT JOIN TB_Qualification AS tbq ON tbpo.id = tbq.idProductsOrganization
                LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbpo.idOrganization
                LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
                LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
                LEFT JOIN TB_City AS tbpc ON tbpc.id = tbpo.idCity
                LEFT JOIN TB_Departments AS tbpd ON tbpd.id = tbpo.idDepartment
                LEFT JOIN TB_ProductDocuments AS tbdp ON tbdp.idProductOrganization = tbpo.id
                LEFT JOIN TB_Status AS tbsd ON tbsd.id = tbdp.idStatus
            WHERE 1 = 1`;

        if (idOrganization) {
            queryHistory += ` AND tbo.id = @idOrganization`;
        }
        if (idOrganizationProductReserved) {
            queryHistory += ` AND tbpo.idOrganizationProductReserved = @idOrganizationProductReserved`;
        }

        queryHistory += `
            GROUP BY tbo.id, tbo.identification, tbpo.id, tbo.bussisnesName, tbpo.quantity, tbpo.attendantName, tbpo.attendantEmail, 
                     tbpo.attendantPhone, tbpo.attendantAddres, tbpc.city, tbpd.department, tbpo.price, tbpo.deliverDate,
                     tbpo.solicitDate, tbs.[status], tbto.typeOrganization, tbp.product, tbp.urlImage, tbo.logo, tbdp.id, tbdp.idStatus, tbsd.[status], tbdp.url`;
                     
        const request = db?.request();
        if (idOrganization) request?.input('idOrganization', idOrganization);
        if (idOrganizationProductReserved) request?.input('idOrganizationProductReserved', idOrganizationProductReserved);

        const result = await request?.query(queryHistory);

        const donateHistory = result?.recordset;
        if (donateHistory && donateHistory.length > 0) {
            return {
                code: 200,
                message: { translationKey: "organizations.successful" },
                data: donateHistory
            };
        } else {
            return {
                code: 204,
                message: { translationKey: "organizations.emptyResponse" },
            };
        }
    } catch (err) {
        console.log("Error al traer el historial de donaciones", err);
        return {
            code: 400,
            message: { translationKey: "organizations.error_server" },
        };
    }
}


export const getDonationHistoryById = async(ids : idHistory): Promise<IresponseRepositoryServiceGet> => {
    try {
        const { idOrganization, idProductOrganization } = ids;
        
        const db = await connectToSqlServer();
        const queryHistory = `SELECT tbpo.id AS idProductOrganization, tbo.id AS idOrganization, tbo.logo, tbp.product, tbp.urlImage, tbpo.quantity,
                                tbpo.price, tbpo.price*tbpo.quantity AS totalPrice, tbpo.attendantName, tbpo.attendantEmail,tbpo.attendantPhone,
                                tbpo.attendantAddres, tbpc.city AS attendantCity, tbpd.department AS attendantDepartment, tbpo.deliverDate,
                                tbpo.expirationDate, tbs.[status], tbto.typeOrganization, tbdp.id AS idProductDocument,
                                tbdp.idStatus AS idProductDocumentStatus, tbsd.[status] AS productDocumentStatus, tbdp.url
                                FROM TB_ProductsOrganization AS tbpo
                                LEFT JOIN TB_Organizations  AS tbo ON tbpo.idOrganization = tbo.id
                                LEFT JOIN TB_Status AS tbs ON tbs.id = tbpo.idStatus
                                LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
                                LEFT JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct 
                                LEFT JOIN TB_City AS tbpc ON tbpc.id = tbpo.idCity
                                LEFT JOIN TB_Departments AS tbpd ON tbpd.id = tbpo.idDepartment
                                LEFT JOIN TB_ProductDocuments AS tbdp ON tbdp.idProductOrganization = tbpo.id
                                LEFT JOIN TB_Status AS tbsd ON tbsd.id = tbdp.idStatus
                                 WHERE tbo.id = @idOrganization AND tbpo.id = @idProductOrganization`;
        const result = await db?.request()
                                .input('idOrganization', idOrganization)
                                .input('idProductOrganization', idProductOrganization)
                                .query(queryHistory);

        const donateHistory = result?.recordset;
        if( donateHistory && donateHistory.length > 0 ){
            return {
                code: 200,
                message: { translationKey : "organizations.successful"},
                data: donateHistory
            };
        } else {
            return {
                code: 204,
                message: { translationKey : "organizations.emptyResponse"},
            };
        }
    } catch (err) {
        console.log("Error al traer el historial de donaciones por id", err);
        return {
            code: 400,
            message: { translationKey: "organizations.error_server"},
        }
    }
}

export const getTypeOrganization = async () => {
    try {
        const db = await connectToSqlServer();
        const typeOrganization: any = await db?.request()
            .query(`SELECT * FROM TB_TypeOrganization`);
        if (!typeOrganization || !typeOrganization.recordset || !typeOrganization.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "organizations.emptyResponse" },
            };
        }
        return {
            code: 200,
            message: { translationKey: "organizations.successful" },
            data: typeOrganization.recordset
        }
    } catch (err) {
        console.log("Error al traer los tipos de organizaciones", err)
        return {
            code: 400,
            message: { translationKey: "organizations.error_server", translationParams: { name: "getTypeOrganization" } },
        };        
    };       
}

export const putActiveOrInactiveOrganization = async (id: number): Promise<IresponseRepositoryService> => {
    try {
        const db = await connectToSqlServer();

        const selectQuery = `
            SELECT idStatus, bussisnesName, email
            FROM TB_Organizations
            WHERE id = @id
        `;
        const selectResult = await db?.request().input('id', id).query(selectQuery);
        const currentStatus = selectResult?.recordset[0]?.idStatus;
        const businessName = selectResult?.recordset[0]?.bussisnesName;
        const email = selectResult?.recordset[0]?.email;

        if (currentStatus === undefined) {
            return {
                code: 404,
                message: 'organizations.emptyResponse'
            };
        }
        const newStatus = currentStatus === 1 ? 8 : 1;
        const updateQuery = `
            UPDATE TB_Organizations
            SET idStatus = @newStatus
            WHERE id = @id
        `;
        await db?.request().input('id', id).input('newStatus', newStatus).query(updateQuery);
        if (newStatus === 1) {
            await NotificationFoundation.cnf01({
                email,
                bussisnesName: businessName,
            });
        }    
        return {
            code: 200,
            message: currentStatus === 1 ? 'organizations.deactivate' : 'organizations.activate'
        };
    } catch (err) {
        console.log("Error al cambiar el estado de la organizacion", err);
        return {
            code: 400,
            message: { translationKey: "organizations.error_server", translationParams: { name: "putActiveOrInactiveOrganization" } }
        };
    }
}

export const putStatusOrganization = async (id: number, idStatus: number): Promise<IresponseRepositoryService> => {
    try {
        const db = await connectToSqlServer();

        const selectQuery = `
            SELECT idStatus, bussisnesName, email
            FROM TB_Organizations
            WHERE id = @id
        `;
        const selectResult = await db?.request()
            .input('id', id)
            .query(selectQuery);

        const currentStatus = selectResult?.recordset[0]?.idStatus;
        const businessName = selectResult?.recordset[0]?.bussisnesName;
        const email = selectResult?.recordset[0]?.email;

        if (currentStatus === undefined) {
            return {
                code: 404,
                message: 'organizations.emptyResponse'
            };
        }
        await db?.request()
            .input('id', id)
            .input('newStatus', idStatus)
            .query(`
                UPDATE TB_Organizations
                SET idStatus = @newStatus
                WHERE id = @id
            `);

        let message = '';
        if ((currentStatus === 1 && idStatus === 8) || (currentStatus === 8 && idStatus === 1)) {
            message = currentStatus === 1 ? 'organizations.deactivate' : 'organizations.activate';
        } else if ((currentStatus === 10 && idStatus === 11) || (currentStatus === 11 && idStatus === 10)) {
            message = currentStatus === 10 ? 'organizations.unblocked' : 'organizations.blocked';
        } else {
            message = 'organizations.status';
        }
        if (idStatus === 1 || idStatus === 11) {
            await NotificationFoundation.cnf01({
                email,
                bussisnesName: businessName,
            });
        }    
        return {
            code: 200,
            message: message
        };
    } catch (err) {
        console.log("Error al cambiar el estado de la organización", err);
        return {
            code: 400,
            message: { translationKey: "organizations.error_server", translationParams: { name: "putStatusOrganization" }}
        };
    }
};

export const getFoundationTypeOrgaization = async (page: number = 0, size: number = 10) => {
    try {
        const db = await connectToSqlServer();
        const totalCountResult: any = await db?.request()
        .query(`SELECT COUNT(*) as totalCount 
                FROM TB_Organizations 
                WHERE idTypeOrganitation = 1`);
        const totalCount = totalCountResult.recordset[0].totalCount;
        const totalPages = Math.ceil(totalCount / size);
        const offset = page * size;
        const foundationType: any = await db?.request()
            .query(`SELECT tbo.id, tbo.bussisnesName, tbo.idTypeIdentification, tbti.typeIdentification, tbo.dv, 
                    tbo.representativaName,tbo.email,tbo.logo, tbo.idStatus, tbs.status, tbo.idTypeOrganitation, tbto.typeOrganization 
                    FROM TB_Organizations AS tbo
                    LEFT JOIN TB_TypeIdentification AS tbti ON tbti.id = tbo.idTypeIdentification
                    LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus
                    LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
                    WHERE tbo.idTypeOrganitation = 1
                    ORDER BY tbo.id
                    OFFSET ${offset} ROWS FETCH NEXT ${size} ROWS ONLY`);
        if (!foundationType || !foundationType.recordset || !foundationType.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "organizations.emptyResponse" },
            };
        }
        return {
            code: 200,
            message: { translationKey: "organizations.successful" },
            data: foundationType.recordset,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                size,
            }
        }
    } catch (err) {
        console.log("Error al traer las organizaciones tipo fundaciones", err)
        return {
            code: 400,
            message: { translationKey: "organizations.error_server", translationParams: { name: "getFoundationTypeOrgaization" } },
        };        
    };       
}

export const getDonatorTypeOrgaization = async (page: number = 0, size: number = 10) => {
    try {
        const db = await connectToSqlServer();
        const totalCountResult: any = await db?.request()
        .query(`SELECT COUNT(*) as totalCount 
                FROM TB_Organizations 
                WHERE idTypeOrganitation = 2`);
        const totalCount = totalCountResult.recordset[0].totalCount;
        const totalPages = Math.ceil(totalCount / size);
        const offset = page * size;
        const donatorType: any = await db?.request()
            .query(`SELECT tbo.id, tbo.bussisnesName, tbo.idTypeIdentification, tbti.typeIdentification, tbo.dv, 
                    tbo.representativaName,tbo.email,tbo.logo, tbo.idStatus, tbs.status, tbo.idTypeOrganitation, tbto.typeOrganization 
                    FROM TB_Organizations AS tbo
                    LEFT JOIN TB_TypeIdentification AS tbti ON tbti.id = tbo.idTypeIdentification
                    LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus
                    LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
                    WHERE tbo.idTypeOrganitation = 2
                    ORDER BY tbo.id
                    OFFSET ${offset} ROWS FETCH NEXT ${size} ROWS ONLY`);
        if (!donatorType || !donatorType.recordset || !donatorType.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "organizations.emptyResponse" },
            };
        }
        return {
            code: 200,
            message: { translationKey: "organizations.successful" },
            data: donatorType.recordset,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                size,
            }
        }
    } catch (err) {
        console.log("Error al traer las organizaciones tipo donante", err)
        return {
            code: 400,
            message: { translationKey: "organizations.error_server", translationParams: { name: "getDonatorTypeOrgaization" } },
        };        
    };       
}

export const putBlockOrEnableOrganization = async (id: number): Promise<IresponseRepositoryService> => {
    try {
        const db = await connectToSqlServer();

        const selectQuery = `
            SELECT idStatus, bussisnesName, email
            FROM TB_Organizations
            WHERE id = @id
        `;
        const selectResult = await db?.request().input('id', id).query(selectQuery);
        const currentStatus = selectResult?.recordset[0]?.idStatus;
        const businessName = selectResult?.recordset[0]?.bussisnesName;
        const email = selectResult?.recordset[0]?.email;

        if (currentStatus === undefined) {
            return {
                code: 404,
                message: 'organizations.emptyResponse'
            };
        }
        const newStatus = currentStatus === 10 ? 11 : 10;
        const updateQuery = `
            UPDATE TB_Organizations
            SET idStatus = @newStatus
            WHERE id = @id
        `;
        await db?.request().input('id', id).input('newStatus', newStatus).query(updateQuery);
        if (newStatus === 11) {
            await NotificationFoundation.cnf01({
                email,
                bussisnesName: businessName,
            });
        }    
        return {
            code: 200,
            message: currentStatus === 10 ? 'organizations.unblocked' : 'organizations.blocked'
        };
    } catch (err) {
        console.log("Error al cambiar el estado de la organización", err);
        return {
            code: 400,
            message: { translationKey: "organizations.error_server", translationParams: { name: "putBlockOrEnableOrganization" } }
        };
    }
}

export const getListOrganizationsByIdStatus = async (page: number = 0, size: number = 10, idStatus?: number) => {
    try {
        const db = await connectToSqlServer();

        const offset = page * size;

        let statusFilter = "";
        if (idStatus) {
            statusFilter = `WHERE tbs.id = ${idStatus}`;
        }

        const query = `
            SELECT DISTINCT 
                tbo.id, 
                tbto.typeOrganization, 
                tbs.[status] AS organizationStatus, 
                tbo.bussisnesName, 
                tbu.phone, 
                tbo.email, 
                tbu.idStatus AS userIdStatus, 
                tbs2.[status] AS userStatus 
            FROM TB_Organizations AS tbo
            LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
            LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus
            LEFT JOIN TB_User AS tbu ON tbu.idOrganization = tbo.id
            LEFT JOIN TB_Status AS tbs2 ON tbs2.id = tbu.idStatus
            ${statusFilter}
            ORDER BY tbo.id DESC
            OFFSET ${offset} ROWS
            FETCH NEXT ${size} ROWS ONLY`;

        const organizations: any = await db?.request().query(query);

        if (!organizations || !organizations.recordset || !organizations.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "organizations.emptyResponse" },
            };
        }
        console.log(statusFilter)
        const totalCountQuery = await db?.request().query(`SELECT COUNT(*) AS totalCount FROM TB_Organizations AS tbo
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus ${statusFilter}`);
        const totalCount = totalCountQuery?.recordset[0].totalCount;

        const totalPages = Math.ceil(totalCount / size);

        return {
            code: 200,
            message: { translationKey: "organizations.successful" },
            data: {
                organizations: organizations.recordset,
                pagination: {
                    totalCount,
                    totalPages,
                    currentPage: page,
                    size,
                }
            }
        }
    } catch (err) {
        console.log(err)
        return {
            code: 400,
            message: { translationKey: "organizations.error_server" },
        };
    }
}

export const getListByTypeOrganizationAndStatus = async (page: number = 0, size: number = 10, idTypeOrganization?: number, idStatus?: number) => {
    try {
        const db = await connectToSqlServer();

        const offset = page * size;

        let filters = [];
        
        if (idTypeOrganization) {
            filters.push(`tbto.id = ${idTypeOrganization}`);
        }

        if (idStatus) {
            filters.push(`tbs.id = ${idStatus}`);
        }

        let whereClause = "";
        if (filters.length > 0) {
            whereClause = `WHERE ${filters.join(" AND ")}`;
        }

        const query = `
            SELECT 
                tbo.id,
                tbo.bussisnesName,
                tbo.idTypeIdentification,
                tbti.typeIdentification,
                tbo.identification,
                tbo.dv,
                tbo.representativaName,
                tbo.representativePhone,
                tbo.email,
                tbo.logo,
                tbo.idStatus,
                tbs.[status],
                tbto.id AS idTypeOrganization,
                tbto.typeOrganization,
                tbo.observations
            FROM TB_Organizations AS tbo
            LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus
            LEFT JOIN TB_TypeIdentification AS tbti ON tbti.id = tbo.idTypeIdentification
            LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
            ${whereClause}
            ORDER BY tbo.id DESC
            OFFSET ${offset} ROWS
            FETCH NEXT ${size} ROWS ONLY`;

        const organizations: any = await db?.request().query(query);

        if (!organizations || !organizations.recordset || !organizations.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "organizations.emptyResponse" },
            };
        }

        const totalCountQuery = await db?.request().query(`
            SELECT COUNT(*) AS totalCount 
            FROM TB_Organizations AS tbo
            LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus
            LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
            ${whereClause}`);

        const totalCount = totalCountQuery?.recordset[0].totalCount;

        const totalPages = Math.ceil(totalCount / size);

        return {
            code: 200,
            message: { translationKey: "organizations.successful" },
            data: {
                organizations: organizations.recordset,
                pagination: {
                    totalCount,
                    totalPages,
                    currentPage: page,
                    size,
                }
            }
        }
    } catch (err) {
        console.log(err);
        return {
            code: 400,
            message: { translationKey: "organizations.error_server" },
        };
    }
}


