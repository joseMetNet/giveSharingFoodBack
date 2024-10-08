import axios, { AxiosError } from "axios";
import { IresponseRepositoryService, dataLogin } from "../interface/Login.Interface";
import { authenticateUser } from '../helpers/UserManagment.Helper';
import { connectToSqlServer } from "../DB/config";
import { generateJWT, parseJwt } from "../helpers/generateJWT";

export const loginUser = async (data: dataLogin): Promise<IresponseRepositoryService> => {
    try {
        const { email, password } = data;
        const userManagementResponse = await authenticateUser(email, password);

        const db = await connectToSqlServer();
        const user = `
        SELECT tbu.id, tbu.idOrganization, tbo.idStatus AS idStatusOrganization, tbso.status AS statusOrganization, 
        [name], tbu.email, idRole, tbr.[role], tbs.id AS idStatus, tbs.[status]
        FROM TB_User AS tbu
        LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
        LEFT JOIN TB_Status AS tbs ON tbs.id = tbu.idStatus
        LEFT JOIN TB_Organizations AS tbo ON  tbo.id = tbu.idOrganization
        LEFT JOIN TB_Status AS tbso ON tbso.id = tbo.idStatus
        WHERE tbu.email = @email
        `;

        const token = await generateJWT(user, '1h');
        const expiresIn = await parseJwt(token);
        const result = await db?.request()
            .input('email', email)
            .query(user);
        return {
            code: 200,
            message: { translationKey: "login.successful" },
            // data: result?.recordset
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
