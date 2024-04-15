import { connectToSqlServer } from "../DB/config"
import { QualificationRepositoryService, dataQualification } from "../interface/Qualification.Interface"

export const postQualification = async (data: dataQualification): Promise<QualificationRepositoryService> => {
    try {
        const { idOrganization, timelyColection, timelyComunication, totalQualification, observations } = data;
        const db = await connectToSqlServer();
        const organizationQuery = `SELECT idTypeOrganitation
                                    FROM TB_Organizations
                                    WHERE id = @IdOrganization`;

        const organizationResult = await db?.request()
            .input('IdOrganization', idOrganization)
            .query(organizationQuery);
            
        const validateOrganization = organizationResult?.recordset;
        if ( validateOrganization && validateOrganization.length > 0 ) {
            const insertQualification = `INSERT INTO TB_Qualification 
            (timelyColection, timelyComunication, totalQualification, observations, idOrganization)
            OUTPUT INSERTED.* 
            VALUES (@timelyColection, @timelyComunication, @totalQualification, @observations, @idOrganization)`

            const insertQuery = await db?.request()
                    .input('timelyColection', timelyColection)
                    .input('timelyComunication', timelyComunication)
                    .input('totalQualification',(timelyColection+timelyComunication)/2)
                    .input('observations', observations || null)
                    .input('idOrganization', idOrganization)
                    .query(insertQualification);
        
            return {
                code: 200,
                message: 'qualification.succesfull',
                data: insertQuery?.recordset
            };
        }
        return {
            code: 204,
            message: 'qualification.emptyResponse'
        };
    } catch (err) {
        console.log("Error al crear calificación", err);
        return {
            code: 404,
            message: { translationKey: "qualification..error_server" },
        }
    }
}