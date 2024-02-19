import { connectToSqlServer } from "../DB/config";
import { IresponseRepositoryService, dataUser } from "../interface/User.Insterface";

export const postContacts = async (data: dataUser): Promise<IresponseRepositoryService> => {
    try {
        const { idAuth, name, phone, email, googleAddress, idOrganization, idRole, idCity } = data;
        const db = await connectToSqlServer();

        const checkEmailQuery = `
        SELECT COUNT(*) AS count FROM TB_User WHERE Email = @Email
        `;
        const emailCheckResult = await db?.request()
            .input('Email', email)
            .query(checkEmailQuery);

        const emailExists = emailCheckResult?.recordset[0]?.count > 0;
        if (emailExists) {
            return {
                code: 400,
                message: { translationKey: "users.emailExists", translationParams: { email: email } },
            };
        }

        const insertQuery = `
    INSERT INTO TB_User (IdAuth, Name, Phone, Email, GoogleAddress, IdOrganization, IdRole, IdCity) 
    VALUES (@IdAuth, @Name, @Phone, @Email, @GoogleAddress, @IdOrganization, @IdRole, @IdCity)
`;
        const insertResult = await db?.request()
            .input('IdAuth', idAuth || null)
            .input('Name', name)
            .input('Phone', phone)
            .input('Email', email || null)
            .input('GoogleAddress', googleAddress || null)
            .input('IdOrganization', idOrganization)
            .input('IdRole', idRole)
            .input('IdCity', idCity)
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
            message: { translationKey: "users.errorInRepository", translationParams: { name: "createUser" } },
        };
    }
}
