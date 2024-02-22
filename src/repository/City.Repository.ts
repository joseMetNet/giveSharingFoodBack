import { connectToSqlServer } from "../DB/config";
import { CitiesRepositoryService, dataCity } from "../interface/City.Interface";

export const getCityByDepartment = async (data: dataCity): Promise<CitiesRepositoryService> => {
    try {
        const { idDepartament } = data;
        const db = await connectToSqlServer();
        let query = `SELECT id, city,idDepartment FROM TB_City WHERE idDepartment = @idDepartament`;
        const result = await db?.request()
                               .input('idDepartament', idDepartament)
                               .query(query);
        const cities = result?.recordset;

        if (cities && cities.length > 0) {
            return {
                code: 200,
                message: { translationKey: "departments.succesfull" },
                data: cities
            };
        } else {
            return {
                code: 204,
                message: { translationKey: "departments.emptyResponse" }
            };
        }
    } catch (err) {
        console.log("Error al traer departamentos", err);
        return {
            code: 400,
            message: { translationKey: "departments.error_server" },
        };
    }
}