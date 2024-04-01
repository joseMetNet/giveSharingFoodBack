import { connectToSqlServer } from "../DB/config"

export const getMeasusre = async () => {
    try {
        const db = await connectToSqlServer();
        const measure : any = await db?.request().query(`SELECT * FROM TB_Measure`);
        if (!measure || !measure.recordset || !measure.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "measure.emptyResponse" },
            };
        }
        return {
            code: 200,
            message: { translationKey: "measure.succesfull" },
            data: measure.recordset
        }
    } catch (err) {
        console.log("Error al traer las unidades de medida", err)
        return {
            code: 400,
            message: {translationKey: "measure.error_server" },
        };
    };
}