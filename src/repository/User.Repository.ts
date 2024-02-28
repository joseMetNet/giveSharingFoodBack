import { connectToSqlServer } from "../DB/config";
import { IresponseRepositoryService, dataUser } from "../interface/User.Insterface";

export const postContacts = async (data: dataUser): Promise<IresponseRepositoryService> => {
    try {
        const { name, phone, email, googleAddress, idOrganization, idCity, idDepartmen } = data;
        const db = await connectToSqlServer();

        const organizationQuery = `
            SELECT idTypeOrganitation
            FROM TB_Organizations
            WHERE id = @IdOrganization
        `;
        const organizationResult = await db?.request()
            .input('IdOrganization', idOrganization)
            .query(organizationQuery);
        console.log(organizationResult?.recordset)
        let idRol: number = 4; // Valor por defecto asignado aquí
        if (organizationResult?.recordset.length) {
            const idTypeOrganization = organizationResult.recordset[0].idTypeOrganitation; // corregido aquí

            if (idTypeOrganization === 1) {
                idRol = 5;
            }
        }

        const insertQuery = `
            INSERT INTO TB_User (Name, Phone, Email, GoogleAddress, IdOrganization, idRole, IdCity, idDepartmen) 
            VALUES (@Name, @Phone, @Email, @GoogleAddress, @IdOrganization, @IdRole, @IdCity, @idDepartmen) 
        `; // corregido aquí
        const insertResult = await db?.request()
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
