import joi from "joi";
import { generalField } from "../../middlewares/validation.middleware.js";

export const addCompanySchema = joi.object({
    companyName: generalField.companyName.required(),
    description: generalField.description.required(),
    industry: generalField.industry.required(),
    address: generalField.address.required(),
    numberOfEmployees: generalField.numberOfEmployees.required(),
    companyEmail: generalField.email.required(),
}).required();

export const updateCompanySchema = joi.object({
    companyId:generalField.id.required(),
    companyName: generalField.companyName,
    description: generalField.description,
    industry: generalField.industry,
    address: generalField.address,
    numberOfEmployees: generalField.numberOfEmployees,
    companyEmail: generalField.email,
}).required();

export const companyIdSchema = joi.object({
    companyId: generalField.id.required(),
}).required();

export const searchCompanySchema = joi.object({
    companyName: generalField.companyName.required(),
}).required();

export const uploadCompanyLogoSchema = joi.object({
    companyId: generalField.id.required(),
    file:joi.object(generalField.fileObject).required(),
}).required();

export const uploadCompanyCoverPicSchema = joi.object({
    companyId: generalField.id.required(),
    file:joi.object(generalField.fileObject).required(),
}).required();

