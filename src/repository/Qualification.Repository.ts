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

// export const postQualification = async (data: dataQualification): Promise<QualificationRepositoryService> => {
//     try {
//         const { idOrganization, idProductsOrganization, idPointsToGrade, qualification, observations } = data;
//         const db = await connectToSqlServer();
//         const organizationQuery = `SELECT idTypeOrganitation
//                                     FROM TB_Organizations
//                                     WHERE id = @IdOrganization`;

//         const organizationResult = await db?.request()
//             .input('IdOrganization', idOrganization)
//             .query(organizationQuery);
            
//         const validateOrganization = organizationResult?.recordset;
//         if ( validateOrganization && validateOrganization.length > 0 ) {
//             const insertQualification = `INSERT INTO TB_Qualification 
//             (idOrganization, idProductsOrganization, idPointsToGrade, qualification, observations)
//             OUTPUT INSERTED.* 
//             VALUES (@idOrganization, @idProductsOrganization, @idPointsToGrade, @qualification, @observations)`

//             const insertQuery = await db?.request()
//                     .input('idOrganization', idOrganization)
//                     .input('idProductsOrganization', idProductsOrganization)
//                     .input('idPointsToGrade', idPointsToGrade)
//                     .input('qualification', qualification)
//                     .input('observations', observations || null)
//                     .query(insertQualification);

//             const getQualificationsQuery = `SELECT qualification
//             FROM TB_Qualification
//             WHERE idProductsOrganization = @idProductsOrganization`;

//             const qualificationsResult = await db?.request()
//             .input('idProductsOrganization', idProductsOrganization)
//             .query(getQualificationsQuery);

//             const qualifications = qualificationsResult?.recordset.map((record: any) => record.qualification) || [];

//             const totalQualifications = qualifications.length;
//             const sumQualifications = qualifications.reduce((sum: number, qual: number) => sum + qual, 0);
//             const avarage = totalQualifications > 0 ? sumQualifications / totalQualifications : null;

//             const insertAverage = `INSERT INTO TB_Avarage 
//             (idOrganization, idPointsToGrade, avarage)
//             OUTPUT INSERTED.*
//             VALUES (@idOrganization, @idPointsToGrade, @avarage)`;

//             await db?.request()
//             .input('idOrganization', idOrganization)
//             .input('idPointsToGrade', idPointsToGrade)
//             .input('avarage', avarage)
//             .query(insertAverage);
//             return {
//                 code: 200,
//                 message: 'qualification.succesfull',
//                 data: insertQuery?.recordset
//             };
//         }
//         return {
//             code: 204,
//             message: 'qualification.emptyResponse'
//         };
//     } catch (err) {
//         console.log("Error al crear calificación", err);
//         return {
//             code: 404,
//             message: { translationKey: "qualification..error_server" },
//         }
//     }
// }

export const postQualification = async (data: dataQualification): Promise<QualificationRepositoryService> => {
    try {
        const { idOrganization, idProductsOrganization, idPointsToGrade, qualification, observations } = data;
        const db = await connectToSqlServer();

        // Validar datos de entrada
        if (!Array.isArray(idPointsToGrade) || !Array.isArray(qualification) || idPointsToGrade.length !== qualification.length) {
            return {
                code: 400,
                message: 'qualification.invalidData',
            };
        }

        // Verificar si ya existe una calificación para esta organización y producto
        const existingQualificationQuery = `
            SELECT 1 
            FROM TB_Qualification 
            WHERE idOrganization = @idOrganization AND idProductsOrganization = @idProductsOrganization
        `;

        const existingQualificationResult: any = await db?.request()
            .input('idOrganization', idOrganization)
            .input('idProductsOrganization', idProductsOrganization)
            .query(existingQualificationQuery);

        if (existingQualificationResult?.recordset.length > 0) {
            return {
                code: 409,
                message: 'qualification.alreadyExists',
            };
        }
        const organizationQuery = `SELECT idTypeOrganitation FROM TB_Organizations WHERE id = @IdOrganization`;
        const organizationResult = await db?.request()
            .input('IdOrganization', idOrganization)
            .query(organizationQuery);

        const validateOrganization = organizationResult?.recordset;
        if (validateOrganization && validateOrganization.length > 0) {
            const insertQualificationQuery = `
                INSERT INTO TB_Qualification 
                (idOrganization, idProductsOrganization, idPointsToGrade, qualification, observations)
                OUTPUT INSERTED.* 
                VALUES (@idOrganization, @idProductsOrganization, @idPointsToGrade, @qualification, @observations)
            `;

            for (let i = 0; i < idPointsToGrade.length; i++) {
                const pointToGrade = idPointsToGrade[i];
                const qual = qualification[i];

                await db?.request()
                    .input('idOrganization', idOrganization)
                    .input('idProductsOrganization', idProductsOrganization)
                    .input('idPointsToGrade', pointToGrade)
                    .input('qualification', qual)
                    .input('observations', observations || null)
                    .query(insertQualificationQuery);
            }

            const getQualificationsQuery = `
                SELECT qualification
                FROM TB_Qualification
                WHERE idProductsOrganization = @idProductsOrganization
            `;

            const qualificationsResult = await db?.request()
                .input('idProductsOrganization', idProductsOrganization)
                .query(getQualificationsQuery);

            const qualifications = qualificationsResult?.recordset.map((record: any) => record.qualification) || [];
            const totalQualifications = qualifications.length;
            const sumQualifications = qualifications.reduce((sum: number, qual: number) => sum + qual, 0);
            const avarage = totalQualifications > 0 ? sumQualifications / totalQualifications : null;

            const insertAverageQuery = `
                INSERT INTO TB_Avarage 
                (idOrganization, idPointsToGrade, avarage)
                OUTPUT INSERTED.*
                VALUES (@idOrganization, @idPointsToGrade, @avarage)
            `;

            await db?.request()
                .input('idOrganization', idOrganization)
                .input('idPointsToGrade', null)
                .input('avarage', avarage)
                .query(insertAverageQuery);

            return {
                code: 200,
                message: 'qualification.succesfull',
                data: qualificationsResult?.recordset
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
            message: { translationKey: "qualification.error_server" },
        };
    }
};


export const getCommentsQuailification = async(id: idOrganizationQualification): Promise<QualificationRepositoryService> => {
    try {
        const { idOrganization } = id;
        const db = await connectToSqlServer();
        let comments = `SELECT tbo.bussisnesName, AVG(tba.avarage) as max_average, tbq.observations 
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

// export const getQualification = async(id: idOrganizationQualification): Promise<QualificationRepositoryService> => {
//     try {
//         const { idOrganization } = id;
//         const db = await connectToSqlServer();

//         const organizationCheckQuery = `SELECT id FROM TB_Organizations WHERE id = @idOrganization`;
//         const organizationCheckResult = await db?.request()
//             .input('idOrganization', idOrganization)
//             .query(organizationCheckQuery);

//         if (organizationCheckResult?.recordset.length === 0) {
//             return {
//                 code: 400,
//                 message: { translationKey: "qualification.invalid_organization" }
//             };
//         }

//         // Consultar las calificaciones
//         const qualificationsQuery = `
//             SELECT 
//             tbptg.description, 
//             tbq.qualification,
//             AVG(tbq.qualification) OVER (PARTITION BY tbptg.description) AS max_average
//             FROM TB_Qualification AS tbq
//             LEFT JOIN TB_PointsToGrade AS tbptg ON tbq.idPointsToGrade = tbptg.id
//             WHERE tbq.idOrganization = @idOrganization`;

//         const resultQualifications = await db?.request()
//             .input('idOrganization', idOrganization)
//             .query(qualificationsQuery);

//         const qualification = resultQualifications?.recordset;

//         if (qualification && qualification.length > 0) {
//             return {
//                 code: 200,
//                 message: { translationKey: "qualification.succesfull" },
//                 data: qualification
//             };
//         } else {
//             return {
//                 code: 400,
//                 message: { translationKey: "qualification.emptyResponse" }
//             };
//         }
//     } catch (err) {
//         console.log("Error al traer las calificaciones", err);
//         return {
//             code: 400,
//             message: { translationKey: "qualification.error_server" }
//         };
//     }
// };

export const getQualification = async (id: idOrganizationQualification): Promise<QualificationRepositoryService> => {
    try {
        const { idOrganization } = id;
        const db = await connectToSqlServer();

        // Verificar si la organización existe y obtener el idRol del usuario relacionado
        const organizationCheckQuery = `
            SELECT org.id AS organizationId, usr.idRole 
            FROM TB_Organizations AS org
            INNER JOIN TB_User AS usr ON org.id = usr.idOrganization
            WHERE org.id = @idOrganization
        `;
        const organizationCheckResult = await db?.request()
            .input('idOrganization', idOrganization)
            .query(organizationCheckQuery);

        if (!organizationCheckResult || organizationCheckResult.recordset.length === 0) {
            return {
                code: 400,
                message: { translationKey: "qualification.invalid_organization" }
            };
        }

        const { idRole } = organizationCheckResult.recordset[0];

        // Si el idRol es 1, devolver calificaciones de todas las organizaciones
        if (idRole === 1) {
            const allQualificationsQuery = `
                SELECT 
                    org.id AS organizationId,
                    org.bussisnesName,
                    org.identification,
                    org.representativaName,
                    tbptg.description,
                    tbq.qualification,
                    AVG(tbq.qualification) OVER (PARTITION BY tbptg.description) AS max_average
                FROM TB_Qualification AS tbq
                LEFT JOIN TB_PointsToGrade AS tbptg ON tbq.idPointsToGrade = tbptg.id
                LEFT JOIN TB_Organizations AS org ON tbq.idOrganization = org.id
            `;

            const resultAllQualifications = await db?.request().query(allQualificationsQuery);
            const qualifications = resultAllQualifications?.recordset;

            return {
                code: 200,
                message: { translationKey: "qualification.successful" },
                data: qualifications
            };
        }

        // Si el idRol no es 1, devolver solo las calificaciones de la organización
        const qualificationsQuery = `
            SELECT 
                tbptg.description, 
                tbq.qualification,
                AVG(tbq.qualification) OVER (PARTITION BY tbptg.description) AS max_average
            FROM TB_Qualification AS tbq
            LEFT JOIN TB_PointsToGrade AS tbptg ON tbq.idPointsToGrade = tbptg.id
            WHERE tbq.idOrganization = @idOrganization
        `;

        const resultQualifications = await db?.request()
            .input('idOrganization', idOrganization)
            .query(qualificationsQuery);

        const qualifications = resultQualifications?.recordset;

        if (qualifications && qualifications.length > 0) {
            return {
                code: 200,
                message: { translationKey: "qualification.succesfull" },
                data: qualifications
            };
        } else {
            return {
                code: 400,
                message: { translationKey: "qualification.emptyResponse" }
            };
        }
    } catch (err) {
        console.log("Error al traer las calificaciones", err);
        return {
            code: 400,
            message: { translationKey: "qualification.error_server" }
        };
    }
};

export const getQualificationGeneral = async () => {
    try {
        const db = await connectToSqlServer();
        const qualification: any = await db?.request()
            .query(`SELECT DISTINCT 
                    tbpo.id AS product_id,
                    tbp.product,
                    CASE 
                    WHEN tbq.idOrganization = tbpo.idOrganization THEN tbq.idOrganization
                    ELSE tbpo.idOrganizationProductReserved
                    END AS organization_id,
                    CASE 
                    WHEN tbq.idOrganization = tbpo.idOrganization THEN tbo.bussisnesName
                    ELSE rtbo.bussisnesName
                    END AS organization_name,
                    CASE 
                    WHEN tbq.idOrganization = tbpo.idOrganization THEN rtbo.bussisnesName
                    ELSE tbo.bussisnesName
                    END AS reserved_organization_name,
                    MAX(tbq.qualification) AS qualification,
                    MAX(tbq.observations) AS observations,
                    MAX(tbpg.description) AS description,
                    MAX(tba.avarage) AS avarage
                    FROM TB_Qualification AS tbq
                    LEFT JOIN TB_ProductsOrganization AS tbpo ON tbpo.id = tbq.idProductsOrganization
                    LEFT JOIN TB_Products AS tbp ON tbp.id = tbpo.idProduct
                    LEFT JOIN TB_PointsToGrade AS tbpg ON tbpg.id = tbq.idPointsToGrade
                    LEFT JOIN TB_Avarage AS tba ON tba.idOrganization = tbq.idOrganization
                    LEFT JOIN TB_Organizations AS tbo ON tbo.id = tbpo.idOrganization
                    LEFT JOIN TB_Organizations AS rtbo ON rtbo.id = tbpo.idOrganizationProductReserved
                    GROUP BY 
                    tbpo.id,
                    tbq.idOrganization,
                    tbpo.idOrganizationProductReserved,
                    tbo.bussisnesName,
                    rtbo.bussisnesName,
                    tbpo.idOrganization,
                    tbp.product`);

        if (!qualification || !qualification.recordset || !qualification.recordset.length) {
            return {
                code: 204,
                message: { translationKey: "qualification.emptyResponse" },
            };
        }

        return {
            code: 200,
            message: { translationKey: "qualification.succesfull" },
            data: qualification.recordset
        }
    } catch (err) {
        console.error("Error al traer calificaciones", err);
        return {
            code: 400,
            message: { translationKey: "qualification.error_server", translationParams: { name: "getQualificationGeneral" } },
        };        
    }
};