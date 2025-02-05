import axios, { AxiosError } from "axios";
import { IresponseRepositoryService, dataLogin } from "../interface/Login.Interface";
import { authenticateUser } from '../helpers/UserManagment.Helper';
import { connectToSqlServer } from "../DB/config";
import { generateJWT, parseJwt } from "../helpers/generateJWT";

export const loginUser = async (data: dataLogin): Promise<IresponseRepositoryService> => {
    try {
        const { email, password } = data;
        const db = await connectToSqlServer();

        const checkUserQuery = `
        SELECT * 
        FROM TB_User 
        WHERE email = @Email
        `;

        const checkUserResult = await db?.request()
            .input('Email', email)
            .query(checkUserQuery);

        if (!checkUserResult?.recordset.length) {
            return {
                code: 404,
                message: { translationKey: "login.error_user_not_found" },
            };
        }

        const userManagementResponse = await authenticateUser(email, password);

        
        const user = `
        SELECT TOP 1 tbu.id, tbu.idOrganization, tbo.idStatus AS idStatusOrganization, tbso.status AS statusOrganization, 
        [name], tbu.email, idRole, tbr.[role], tbs.id AS idStatus, tbs.[status], tbss.status AS subscriptionStatus
        FROM TB_User AS tbu
        LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbu.idStatus
        LEFT JOIN TB_Organizations AS tbo ON  tbo.id = tbu.idOrganization
        LEFT JOIN TB_Status AS tbso ON tbso.id = tbo.idStatus
        LEFT JOIN TB_Subscriptions AS tbss ON tbo.id = tbss.idOrganization 
        WHERE tbu.email = @email
        ORDER BY tbss.id DESC;
        `;

        const token = await generateJWT(user, '1h');
        const expiresIn = await parseJwt(token);
        const result = await db?.request()
            .input('email', email)
            .query(user);
        return {
            code: 200,
            message: { translationKey: "login.successful" },
            data: {
                "user": result?.recordset,
                token,
                expiresIn
            }
        }
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError;
            if (axiosError.response?.status === 401) {
                return {
                    code: 401,
                    message: { translationKey: "login.error_invalid_credentials" },
                };
            }
        }
        console.log("Error al loguearse", err);
        return {
            code: 400,
            message: { translationKey: "login.error_server" },
        };
    }
}
