import axios, { AxiosError } from "axios";
import { IresponseRepositoryService, dataLogin } from "../interface/Login.Interface";
import { authenticateUser } from '../helpers/UserManagment.Helper';

export const loginUser = async (data: dataLogin): Promise<IresponseRepositoryService> => {
    try {
        const { email, password } = data;

        const userManagementResponse = await authenticateUser(email, password);

        return {
            code: 200,
            message: { translationKey: "login.successful" },
            data: userManagementResponse.data.data
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
