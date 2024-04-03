import { connectToSqlServer } from "../DB/config";
import { createUserInUserManagement } from "../helpers/UserManagment.Helper";
import { IresponseRepositoryService, dataUser } from "../interface/User.Insterface";

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
            INSERT INTO TB_User (idAuth, Name, Phone, Email, GoogleAddress, IdOrganization, idRole, IdCity, idDepartmen)
            OUTPUT INSERTED.* 
            VALUES (@idAuth, @Name, @Phone, @Email, @GoogleAddress, @IdOrganization, @IdRole, @IdCity, @idDepartmen)`;

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
