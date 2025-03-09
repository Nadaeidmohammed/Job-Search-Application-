import joi from "joi";
import { generalField } from "../../middlewares/validation.middleware.js";


export const updateProfileSchema=joi.object({
    firstName:generalField.firstName,
    lastName:generalField.lastName,
    mobileNumber:generalField.mobileNumber,
    gender:generalField.gender,
    DOB:generalField.DOB,
    address:generalField.address,
 }).required();
export const getProfileForAnotherUserSchema=joi.object({
    userId:generalField.id.required(),
}).required();
export const updatePasswordSchema=joi.object({
    oldPassword:generalField.password.required(),
    password:generalField.password.not(joi.ref("oldPassword")).required(),
    confirmPassword:generalField.confirmPassword.required()
}).required();
export const uploadProfilePicSchema=joi.object({
    file:joi.object(generalField.fileObject)
}).required();
export const uploadCoverPicSchema=joi.object({
    file:joi.object(generalField.fileObject)
}).required();


