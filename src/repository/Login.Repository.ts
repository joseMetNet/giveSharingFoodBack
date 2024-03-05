import axios, { AxiosError } from "axios";
import { IresponseRepositoryService, dataLogin } from "../interface/Login.Interface";
import { authenticateUser } from '../helpers/UserManagment.Helper';
import { connectToSqlServer } from "../DB/config";

export const loginUser = async (data: dataLogin): Promise<IresponseRepositoryService> => {
    try {
        const { email, password } = data;
        const userManagementResponse = await authenticateUser(email, password);

        const db = await connectToSqlServer();
        const user = `
        SELECT tbu.id, [name], email, idRole, tbr.[role] FROM TB_User AS tbu
        LEFT JOIN TB_Rol AS tbr ON tbr.id = tbu.idRole
        WHERE email = @email
        `;
        const result = await db?.request()
            .input('email', email)
            .query(user);
        return {
            code: 200,
            message: { translationKey: "login.successful" },
            data: result?.recordset
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
