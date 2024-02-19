import { connectToSqlServer } from "../DB/config"

export const getTypeIdentification = async () => {
    try {
        const db = await connectToSqlServer();
        const typeIdentidication: any = await db?.request()
            .query(`SELECT * FROM TB_TypeIdentification`);
        if (!typeIdentidication || !typeIdentidication.recordset || !typeIdentidication.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "departments.emptyResponse" },
            };
        }
        return {
            code: 200,
            message: { translationKey: "departments.succesfull" },
            data: typeIdentidication.recordset
        }
    } catch (err) {
        console.log("Error al traer departamentos", err)
        return {
            code: 400,
            message: { translationKey: "departments.error_server", translationParams: { name: "getDepartments" } },
        };        
    };       
}
