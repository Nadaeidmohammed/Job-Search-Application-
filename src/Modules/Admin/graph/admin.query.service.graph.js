import * as dbService from "../../../DB/dbService.js"
import {UserModel} from "../../../DB/Models/user.model.js"
import {CompanyModel} from "../../../DB/Models/company.model.js"
import { ROLES } from "../../../utils/constant.js";
import {authentication} from "./graph.auth.middleware.js"
import {  getAllCompaniesSchema, getAllUsersSchema } from "../admin.validation.js";
export const getAllUsers=async(parent,args)=>{
   const {authorization}=args;
   const user = await authentication({authorization,accessRoles:ROLES.ADMIN})

   await validation(getAllUsersSchema,args)

   const users = await dbService.find({ model: UserModel ,deletedAt:null});
   
   return { message: "Done", statusCode: 200, data: users };
}

export const getAllCompanies=async(parent,args)=>{
   const {authorization}=args;
   const user = await authentication({authorization,accessRoles:ROLES.ADMIN})

   await validation(getAllCompaniesSchema,args)

   const companies = await dbService.find({ model: CompanyModel ,deletedAt:null});
   
   return { message: "Done", statusCode: 200, data: companies };
}