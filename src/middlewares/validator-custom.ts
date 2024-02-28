import { CustomValidator } from "express-validator";
import { connectToSqlServer } from "../DB/config";

export const validateEmailUserExist = async (email: string) => {
    const db = await connectToSqlServer();
    const result = `SELECT COUNT(*) AS count FROM TB_User WHERE Email = @Email`;
    const emailCheckResult = await db?.request()
    .input('Email', email)
    .query(result);
  
    const emailExists = emailCheckResult?.recordset[0]?.count > 0
  
    if (emailExists) {
      throw new Error("user.emailExists");
    }
    else {
      return true;
    }
  };

export const validateEmailOrganizationExist = async (email: string) => {
    const db = await connectToSqlServer();
    const result = `SELECT COUNT(*) AS count FROM TB_Organizations WHERE Email = @Email`;
    const emailCheckResult = await db?.request()
    .input('Email', email)
    .query(result);
  
    const emailExists = emailCheckResult?.recordset[0]?.count > 0
  
    if (emailExists) {
      throw new Error("organizations.exist_mail");
    }
    else {
      return true;
    }
  };

  export const validateLogoFile = (filePath: string) => {
    const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
    const fileExtension = filePath.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        throw new Error("El archivo subido no es una imagen válida (jpg, jpeg, png, gif).");
    }

    return true;
};

