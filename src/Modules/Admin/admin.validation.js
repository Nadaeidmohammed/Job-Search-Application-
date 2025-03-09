import joi from "joi"
import {generalField} from "../../middlewares/validation.middleware.js"
export const getAllUsersSchema =joi.object({
    authorization:joi.string().required()
}).required();

export const getAllCompaniesSchema =joi.object({
    authorization:joi.string().required()
}).required();

export const banUserSchema =joi.object({
    userId:generalField.id.required(),
    authorization:joi.string().required()
}).required()

export const banCompanySchema =joi.object({
    companyId:generalField.id.required(),
    authorization:joi.string().required()
}).required()

export const approveCompanySchema =joi.object({
    companyId:generalField.id.required(),
    authorization:joi.string().required()
}).required()

