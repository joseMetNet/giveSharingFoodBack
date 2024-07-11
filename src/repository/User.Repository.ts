import { connectToSqlServer } from "../DB/config";
import { createUserInUserManagement } from "../helpers/UserManagment.Helper";
import { IresponseRepositoryService, UserRepositoryService, dataUser, idOrganization } from "../interface/User.Insterface";

export const postContacts = async (data: dataUser): Promise<IresponseRepositoryService> => {
    try {
        const { name, phone, email, password, googleAddress, idOrganization, idCity, idDepartmen } = data;
        const db = await connectToSqlServer();

        const organizationQuery = `
            SELECT idTypeOrganitation
            FROM TB_Organizations
            WHERE id = @IdOrganization
        `;
        const organizationResult = await db?.request()
            .input('IdOrganization', idOrganization)
            .query(organizationQuery);
        
        let idRol: number = 4;
        if (organizationResult?.recordset.length) {
            const idTypeOrganization = organizationResult.recordset[0].idTypeOrganitation;

            if (idTypeOrganization === 1) {
                idRol = 5;
            }
        }
        const idAuth = await createUserInUserManagement(email, password);
        const insertQuery = `
            INSERT INTO TB_User (idAuth, Name, Phone, Email, GoogleAddress, IdOrganization, idRole, IdCity, idDepartmen, idStatus)
            OUTPUT INSERTED.* 
            VALUES (@idAuth, @Name, @Phone, @Email, @GoogleAddress, @IdOrganization, @IdRole, @IdCity, @idDepartmen, @idStatus)`;

        const insertResult = await db?.request()
            .input('idAuth', idAuth)
            .input('Name', name)
            .input('Phone', phone)
            .input('Email', email || null)
            .input('GoogleAddress', googleAddress || null)
            .input('IdOrganization', idOrganization)
            .input('IdRole', idRol)
            .input('IdCity', idCity)
            .input('idDepartmen', idDepartmen)
            .input('idStatus', 7)
            .query(insertQuery);

        return {
            code: 200,
            message: 'user.succesfull',
            data: insertResult?.recordset
        };
    } catch (err) {
        console.log("Error creating user", err);
        return {
            code: 400,
            message: { translationKey: "user.error_server", translationParams: { name: "createUser" } },
        };
    }
}

export const getUserByOrganization = async (data: idOrganization): Promise<UserRepositoryService> => {
    try {
        const idOrganization: string = data.idOrganization ? String(data.idOrganization) : '';
        const organizationExists = await checkOrganizationExists(idOrganization);

        if (!organizationExists) {
            return {
                code: 404,
                message: { translationKey: "organizations.emptyResponse" }
            };
        }

        const db = await connectToSqlServer();
        let query = `SELECT tbu.id, tbu.idAuth, tbu.[name], tbu.phone, tbu.email, tbr.[role], tbc.city, tbd.department, tbo.bussisnesName FROM TB_User AS tbu
        LEFT JOIN TB_Rol AS tbr ON tbu.idRole = tbr.id
        LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
        LEFT JOIN TB_Departments AS tbd ON tbd.id = tbu.idDepartmen
        LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbu.idOrganization
        WHERE tbu.idOrganization = @idOrganization AND idRole NOT IN (1,2,3)`;
        const result = await db?.request()
                            .input('idOrganization', idOrganization)
                            .query(query);
        const users = result?.recordset;
        if (users && users.length > 0) {
            return {
                code: 200,
                message: { translationKey: "user.succesfull"},
                data: users
            };
        } else {
            return {
                code: 204,
                message: { translationKey: "user.emptyResponse" }
            };
        }
    } catch (err) {
        console.log("Error al traer usuarios", err);
        return {
            code: 400,
            message: { translationKey: "user.error_server" },
        };
    }
}

export const putActivateStatusUser = async (id: number): Promise<IresponseRepositoryService> => {
    try {
        const db = await connectToSqlServer();
        const query = `
            UPDATE TB_User
            SET idStatus = 6
            WHERE id = @id
        `;
        const result = await db?.request().input('id', id).query(query);
        return {
            code: 200,
            message: 'user.activate'
        };
    } catch (err) {
        console.log("Error al activar usuario", err);
        return {
            code: 400,
            message: { translationKey: "user.error_server", translationParams: { name: "activateUser" } }
        };
    }
}

const checkOrganizationExists = async (idOrganization: string): Promise<boolean> => {
    try {
        const db = await connectToSqlServer();
        const query = `
            SELECT COUNT(*) AS count
            FROM TB_Organizations
            WHERE id = @idOrganization
        `;
        const result = await db?.request().input('idOrganization', idOrganization).query(query);
        const count = result?.recordset[0]?.count;
        return !!count;
    } catch (err) {
        console.error("Error al verificar idOrganization", err);
        return false;
    }
}