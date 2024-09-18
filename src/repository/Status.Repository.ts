import { connectToSqlServer } from "../DB/config";

export const getStatus = async () => {
    try {
        const db = await connectToSqlServer();
        const queryStatus: any = await db?.request()
            .query(`SELECT * FROM TB_Status`);
        
        if (!queryStatus || !queryStatus.recordset || !queryStatus.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "status.emptyResponse" },
            };
        }

        return {
            code: 200,
            message: { translationKey: "status.succesfull" },
            data: queryStatus.recordset
        }
    } catch (err) {
        console.log("Error al traer los estados", err)
        return {
            code: 400,
            message: { translationKey: "status.error_server", translationParams: { name: "getStatus" } },
        };        
    };
}
