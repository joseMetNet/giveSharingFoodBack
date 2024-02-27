import { connectToSqlServer } from "../DB/config";
import axios from 'axios';
import { IresponseRepositoryService, IresponseRepositoryServiceGet, dataOrganization, updateOrganizationById } from "../interface/Organization.Interface";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import mime from 'mime-types';

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

        let idRole;
        if (idTypeOrganitation === 1) {
            idRole = 3;
        } else if (idTypeOrganitation === 2) {
            idRole = 2;
        } else {
            idRole = 1;
        }

        const userManagementUrl = process.env.USERA_MANAGEMENT_URL || 'https://usermanagementservicemetnet.azurewebsites.net/UserManagement';
        const userManagementData = {
            userGroup: process.env.USER_GROUP || 'Usersguivesharingfood',
            userName: email,
            password: password
        };

        const userManagementResponse = await axios.post(userManagementUrl, userManagementData);

        const idAuth = userManagementResponse.data.data[0].id;
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
            SELECT tbo.bussisnesName AS razonSocial, tbti.typeIdentification, tbo.identification, tbo.dv,
            tbo.representativaName, tbo.representativePhone, tbo.email AS emailRepresentative,
            tbu.name, tbu.phone, tbu.email, tbu.googleAddress, tbc.City, tbd.department
            FROM TB_Organizations AS tbo
            LEFT JOIN TB_TypeIdentification AS tbti ON tbti.id = tbo.idTypeIdentification
            LEFT JOIN TB_User AS tbu ON tbu.idOrganization = tbo.id
            LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
            LEFT JOIN TB_Departments AS tbd ON tbd.id = tbc.idDepartment
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

export const updateOrganization = async (id: number,filePath: string, data: updateOrganizationById): Promise<IresponseRepositoryServiceGet> => {
    try {
        const { bussisnesName, idTypeIdentification, identificacion, dv, representativaName, representativePhone, representativeEmail,
        name, phone, email, idCity, googleAddress } = data;
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

        const db = await connectToSqlServer();

        if ((representativeEmail && representativeEmail !== data.representativeEmail) || (email && email !== data.email)) {
            const emailCheckQuery = `
                SELECT 
                    (SELECT COUNT(*)
                    FROM TB_Organizations
                    WHERE email = @email) AS organizationsCount,
                    (SELECT COUNT(*)
                    FROM TB_User
                    WHERE email = @userEmail) AS userCount
            `;
        
            const CheckResult = await db?.request()
                .input('email', representativeEmail ? representativeEmail : email)
                .input('userEmail', email)
                .query(emailCheckQuery);
        
            const organizationsCount = CheckResult?.recordset[0]?.organizationsCount || 0;
            const userCount = CheckResult?.recordset[0]?.userCount || 0;
        
            if (organizationsCount > 0) {
                return {
                    code: 400,
                    message: 'organizations.exist_mail',
                };
            }
        
            if (userCount > 0) {
                return {
                    code: 400,
                    message: 'user.emailExists',
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
        WHERE idOrganization = @idOrganization
    `;
    
    const updateOrganizationQuery = `
    UPDATE TB_Organizations SET 
        bussisnesName = CASE WHEN @bussisnesName IS NOT NULL THEN @bussisnesName ELSE bussisnesName END,
        idTypeIdentification = CASE WHEN @idTypeIdentification IS NOT NULL THEN @idTypeIdentification ELSE idTypeIdentification END,
        identification = CASE WHEN @identificacion IS NOT NULL THEN @identificacion ELSE identification END,
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
        .input('identificacion', identificacion)
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







