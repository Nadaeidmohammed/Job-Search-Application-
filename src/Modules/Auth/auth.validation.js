import { generalField } from "../../middlewares/validation.middleware.js";
import joi from "joi"

export const registerSchema=joi.object({
    firstName:generalField.firstName.required(),
    lastName:generalField.lastName.required(),
    email:generalField.email.required(),
    password:generalField.password.required(),
    confirmPassword:generalField.confirmPassword.required(),
    mobileNumber:generalField.mobileNumber,
}).required()

export const confirmEmailSchema=joi.object({
    email:generalField.email.required(),
    code:generalField.code.required(),
}).required();

export const loginSchema=joi.object({
    email:generalField.email.required(),
    password:generalField.password.required(),
}).required();

export const forgetPasswordSchema=joi.object({
    email:generalField.email.required(),
}).required()

export const resetPasswordSchema=joi.object({
    email:generalField.email.required(),
    code:generalField.code.required(),
    password:generalField.password.required(),
    confirmPassword:generalField.confirmPassword.required()
}).required()