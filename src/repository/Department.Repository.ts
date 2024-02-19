import { connectToSqlServer } from "../DB/config"

export const getDepartments = async () => {
    try {
        const db = await connectToSqlServer();
        const departaments: any = await db?.request()
            .query(`SELECT * FROM TB_Departments`);
        
        if (!departaments || !departaments.recordset || !departaments.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "departments.emptyResponse" },
            };
        }

        return {
            code: 200,
            message: { translationKey: "departments.succesfull" },
            data: departaments.recordset
        }
    } catch (err) {
        console.log("Error al traer departamentos", err)
        return {
            code: 400,
            message: { translationKey: "departments.error_server", translationParams: { name: "getDepartments" } },
        };        
    };
}
