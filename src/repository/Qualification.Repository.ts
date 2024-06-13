import { connectToSqlServer } from "../DB/config"
import { IfilterQuantificationByIdRol, QualificationRepositoryService, dataQualification, idOrganizationQualification } from "../interface/Qualification.Interface"

export const getPointsToGradeByIdRol = async (filter: IfilterQuantificationByIdRol): Promise<QualificationRepositoryService> => {
    try {
        const { idRol } = filter;
        const db = await connectToSqlServer();
        let queryPointsToGrade = `SELECT tbptg.id, tbptg.[description], tbptg.idRol, tbr.[role] FROM TB_PointsToGrade AS tbptg
                    LEFT JOIN TB_Rol AS tbr ON tbr.id = tbptg.idRol
                    WHERE tbr.id = @idRol`;
        const resultPointsToGrade: any = await db?.request()
                    .input('idRol', idRol)
                    .query(queryPointsToGrade)            
        
        if (!resultPointsToGrade || !resultPointsToGrade.recordset || !resultPointsToGrade.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "qualification.emptyResponse" },
            };
        }
        return {
            code: 200,
            message: { translationKey: "qualification.succesfull" },
            data: resultPointsToGrade.recordset
        }
    } catch (err) {
        console.log("Error al traer departamentos", err)
        return {
            code: 400,
            message: { translationKey: "qualification..error_server" },
        };        
    };
}

export const postQualification = async (data: dataQualification): Promise<QualificationRepositoryService> => {
    try {
        const { idOrganization, idProductsOrganization, idPointsToGrade, qualification, observations } = data;
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
            (idOrganization, idProductsOrganization, idPointsToGrade, qualification, observations)
            OUTPUT INSERTED.* 
            VALUES (@idOrganization, @idProductsOrganization, @idPointsToGrade, @qualification, @observations)`

            const insertQuery = await db?.request()
                    .input('idOrganization', idOrganization)
                    .input('idProductsOrganization', idProductsOrganization)
                    .input('idPointsToGrade', idPointsToGrade)
                    .input('qualification', qualification)
                    .input('observations', observations || null)
                    .query(insertQualification);

            const getQualificationsQuery = `SELECT qualification
            FROM TB_Qualification
            WHERE idProductsOrganization = @idProductsOrganization`;

            const qualificationsResult = await db?.request()
            .input('idProductsOrganization', idProductsOrganization)
            .query(getQualificationsQuery);

            const qualifications = qualificationsResult?.recordset.map((record: any) => record.qualification) || [];

            const totalQualifications = qualifications.length;
            const sumQualifications = qualifications.reduce((sum: number, qual: number) => sum + qual, 0);
            const avarage = totalQualifications > 0 ? sumQualifications / totalQualifications : null;

            const insertAverage = `INSERT INTO TB_Avarage 
            (idOrganization, idPointsToGrade, avarage)
            OUTPUT INSERTED.*
            VALUES (@idOrganization, @idPointsToGrade, @avarage)`;

            await db?.request()
            .input('idOrganization', idOrganization)
            .input('idPointsToGrade', idPointsToGrade)
            .input('avarage', avarage)
            .query(insertAverage);
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

export const getCommentsQuailification = async(id: idOrganizationQualification): Promise<QualificationRepositoryService> => {
    try {
        const { idOrganization } = id;
        const db = await connectToSqlServer();
        let comments = `SELECT tbo.bussisnesName, max(tba.avarage) as max_average, tbq.observations 
        FROM TB_Avarage AS tba
        LEFT JOIN TB_Qualification AS tbq ON tbq.idOrganization = tba.idOrganization
        LEFT JOIN TB_Organizations AS tbo ON tbo.id = tba.idOrganization
        WHERE tba.idOrganization = @idOrganization
        GROUP BY tbo.bussisnesName, tbq.observations`
        const resultComments = await db?.request()
                                    .input('idOrganization', idOrganization)
                                    .query(comments);
        const comment = resultComments?.recordset;
        if(comment && comment.length > 0) {
            return {
                code: 200,
                message: { translationKey: "qualification.succesfull"},
                data: comment
            };
        } else {
            return {
                code: 204,
                message: {translationKey: "qualification.emptyResponse"}
            }
        }
    } catch (err) {
        console.log("Error al traer los comentarios", err);
        return {
            code: 400,
            message: { translationKey: "qualification..error_server"}
        }
    }
}

export const getQuailification = async(id: idOrganizationQualification): Promise<QualificationRepositoryService> => {
    try {
        const { idOrganization } = id;
        const db = await connectToSqlServer();
        let qualifications = `SELECT tbptg.description, tbq.qualification, max(tba.avarage) as max_average FROM TB_PointsToGrade AS tbptg
        LEFT JOIN TB_Qualification AS tbq ON tbq.idPointsToGrade = tbptg.id
        LEFT JOIN TB_Avarage AS tba ON tba.idOrganization = tbq.idOrganization
        WHERE tbq.idOrganization = @idOrganization
        GROUP BY tbptg.description, tbq.qualification`
        const resultQualifications = await db?.request()
                                    .input('idOrganization', idOrganization)
                                    .query(qualifications);
        const qualification = resultQualifications?.recordset;
        if(qualification && qualification.length > 0) {
            return {
                code: 200,
                message: { translationKey: "qualification.succesfull"},
                data: qualification
            };
        } else {
            return {
                code: 204,
                message: {translationKey: "qualification.emptyResponse"}
            }
        }
    } catch (err) {
        console.log("Error al traer las calificaciones", err);
        return {
            code: 400,
            message: { translationKey: "qualification.error_server"}
        }
    }
}