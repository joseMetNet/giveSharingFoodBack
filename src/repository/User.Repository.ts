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

export const putActiveOrInactiveUser = async (id: number): Promise<IresponseRepositoryService> => {
    try {
        const db = await connectToSqlServer();

        // Consultar el estado actual del usuario
        const selectQuery = `
            SELECT idStatus
            FROM TB_User
            WHERE id = @id
        `;
        const selectResult = await db?.request().input('id', id).query(selectQuery);
        const currentStatus = selectResult?.recordset[0]?.idStatus;

        if (currentStatus === undefined) {
            return {
                code: 404,
                message: 'user.not_found'
            };
        }
        const newStatus = currentStatus === 6 ? 7 : 6;
        const updateQuery = `
            UPDATE TB_User
            SET idStatus = @newStatus
            WHERE id = @id
        `;
        await db?.request().input('id', id).input('newStatus', newStatus).query(updateQuery);

        return {
            code: 200,
            message: currentStatus === 6 ? 'user.deactivate' : 'user.activate'
        };
    } catch (err) {
        console.log("Error al cambiar el estado del usuario", err);
        return {
            code: 400,
            message: { translationKey: "user.error_server", translationParams: { name: "toggleUserStatus" } }
        };
    }
}

export const putStatusUser = async (id: number, idStatus: number): Promise<IresponseRepositoryService> => {
    try {
        const db = await connectToSqlServer();

        const selectQuery = `
            SELECT idStatus
            FROM TB_User
            WHERE id = @id
        `;
        const selectResult = await db?.request().input('id', id).query(selectQuery);
        const currentStatus = selectResult?.recordset[0]?.idStatus;

        if (currentStatus === undefined) {
            return {
                code: 404,
                message: 'user.not_found'
            };
        }

        await db?.request()
            .input('id', id)
            .input('newStatus', idStatus)
            .query(`
                UPDATE TB_User
                SET idStatus = @newStatus
                WHERE id = @id
            `);

        let message = '';
        if ((currentStatus === 6 && idStatus === 7) || (currentStatus === 7 && idStatus === 6)) {
            message = currentStatus === 6 ? 'user.deactivate' : 'user.activate';
        } else {
            message = 'user.status';
        }

        return {
            code: 200,
            message: message
        };
    } catch (err) {
        console.log("Error al cambiar el estado del usuario", err);
        return {
            code: 400,
            message: { translationKey: "user.error_server", translationParams: { name: "putStatusUser" }}
        };
    }
};

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

export const getUsersByIdStatus = async (page: number = 0, size: number = 10, idStatus?: number) => {
    try {
        const db = await connectToSqlServer();
        const offset = page * size;

        let filters: string[] = [];
        if (typeof idStatus !== 'undefined') {
            filters.push(`tbu.idStatus = ${idStatus}`);
        }

        const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : '';

        const query = `
            SELECT 
                tbu.id,
                tbu.idAuth,
                tbu.phone,
                tbu.email,
                tbu.idRole,
                tbr.role,
                tbu.idCity,
                tbc.city,
                tbu.idDepartmen,
                tbd.department,
                tbu.googleAddress,
                tbu.idOrganization,
                tbo.bussisnesName,
                tbu.idStatus,
                tbs.status
            FROM TB_User AS tbu
            LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbu.idOrganization
            LEFT JOIN TB_Status AS tbs ON tbs.id = tbu.idStatus
            LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
            LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
            LEFT JOIN TB_Departments AS tbd ON tbd.id = tbu.idDepartmen
            ${whereClause}
            ORDER BY tbu.id DESC
            OFFSET ${offset} ROWS
            FETCH NEXT ${size} ROWS ONLY`;

        const users: any = await db?.request().query(query);

        if (!users || !users.recordset || !users.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "user.emptyResponse" },
            };
        }

        // Query para contar el total de registros
        const totalCountQuery = await db?.request().query(`
            SELECT COUNT(*) AS totalCount 
            FROM TB_User AS tbu
            LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbu.idOrganization
            LEFT JOIN TB_Status AS tbs ON tbs.id = tbu.idStatus
            LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
            LEFT JOIN TB_City AS tbc ON tbc.id = tbu.idCity
            LEFT JOIN TB_Departments AS tbd ON tbd.id = tbu.idDepartmen
            ${whereClause}`);

        const totalCount = totalCountQuery?.recordset[0]?.totalCount || 0;
        const totalPages = Math.ceil(totalCount / size);

        return {
            code: 200,
            message: { translationKey: "user.succesfull" },
            data: {
                users: users.recordset,
                pagination: {
                    totalCount,
                    totalPages,
                    currentPage: page,
                    size,
                }
            }
        };
    } catch (err) {
        console.error(err);
        return {
            code: 400,
            message: { translationKey: "user.error_server" },
        };
    }
};