import { connectToSqlServer } from "../DB/config";
import { IresponseRepositoryService, IresponseRepositoryServiceGet, dataOrganization, updateOrganizationById } from "../interface/Organization.Interface";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import mime from 'mime-types';
import { createUserInUserManagement } from "../helpers/UserManagment.Helper";

export const postOrganization = async (data: dataOrganization): Promise<IresponseRepositoryService> => {
    try {
        const { representativaName, bussisnesName, email, password, representativePhone, idTypeOrganitation } = data;
        const db = await connectToSqlServer();

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
            INSERT INTO TB_User (name, phone, email, idRole, idOrganization, idAuth)
            VALUES (@name, @phone, @email, @idRole, @idOrganization, @idAuth)
        `;
        const insertUserResult = await db?.request()
            .input('name', representativaName)
            .input('phone', representativePhone)
            .input('email', email)
            .input('idRole', idRole)
            .input('idOrganization', insertedOrganization.id)
            .input('idAuth', idAuth)
            .query(insertUser);

        return {
            code: 200,
            message: 'organizations.successful',
            data: insertedOrganization
        }
    } catch (err) {
        console.log("Error creating organization", err);
        return {
            code: 400,
            message: { translationKey: "organizations.error_server", translationParams: { name: "createOrganization" } },
        };
    }
}

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
            name, phone, email, idCity, googleAddress } = data;

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
                idStatus = CASE WHEN @idStatus IS NOT NULL THEN @idStatus ELSE idStatus END
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

export const getListOrganizations = async (page: number = 0, size: number = 10) => {
    try {
        const db = await connectToSqlServer();

        const offset = page * size;
        
        const organizations: any = await db?.request().query(`
        SELECT DISTINCT tbo.id, tbto.typeOrganization, tbs.[status], tbo.bussisnesName, tbu.phone, tbo.email FROM  TB_Organizations AS tbo
        LEFT JOIN TB_TypeOrganization AS tbto ON tbto.id = tbo.idTypeOrganitation
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus
        LEFT JOIN TB_User AS tbu ON tbu.idOrganization = tbo.id
        ORDER BY tbo.id
        OFFSET ${offset} ROWS
        FETCH NEXT ${size} ROWS ONLY`);

        if (!organizations || !organizations.recordset || !organizations.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "organizations.emptyResponse" },
            };
        }

        const totalCountQuery = await db?.request().query(`SELECT COUNT(*) AS totalCount FROM TB_Organizations`);
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
        tbo.id, logo, bussisnesName AS razonSocial, tbti.typeIdentification, identification, dv, 
        representativaName, representativePhone, tbo.email AS representativeEmail, tbs.[status], tbu.googleAddress, tbc.city,td.department,
        tbu.[name], tbu.phone, tbu.email
        FROM TB_Organizations AS tbo
        LEFT JOIN TB_TypeIdentification AS tbti ON tbti.id = tbo.idTypeIdentification
        LEFT JOIN TB_User AS tbu ON tbu.idOrganization = tbo.id
        LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
        LEFT JOIN TB_Departments AS td ON td.id = tbc.idDepartment
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbo.idStatus
            WHERE tbo.id = @id AND tbu.idRole NOT IN (4,5)`;

        const usersQuery = `
        SELECT tbu.idAuth, tbu.[name], tbu.phone, tbu.email, tbr.[role], tbc.city, tbu.googleAddress, tbd.department 
        FROM TB_User AS tbu
        LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
        LEFT JOIN TB_Departments AS tbd ON tbd.id = tbu.idDepartmen
        LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
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





