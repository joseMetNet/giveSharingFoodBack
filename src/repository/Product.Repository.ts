import { connectToSqlServer } from "../DB/config"

export const getProducts = async () => {
    try {
        const db = await connectToSqlServer();
        const products : any = await db?.request().query(`SELECT * FROM TB_Profucts`);
        if(!products || !products.recordset || !products.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "departments.emptyResponse" },
            };
        }

        return {
            code: 200,
            message: { translationKey: "departments.succesfull" },
            data: products.recordset
        }
    } catch (err) {
        console.log("Error al traer los productos", err)
        return {
            code: 400,
            message: { translationKey: "departments.error_server", translationParams: { name: "getDepartments" } },
        };
    };
}