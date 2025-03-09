import joi from "joi";
import { generalField } from "../../middlewares/validation.middleware.js";

export const addJobSchema = joi.object({
    companyId: generalField.id.required(),
    jobTitle:generalField.jobTitle.required(),
    jobLocation:generalField.jobLocation.required(),
    workingTime:generalField.workingTime.required(),
    seniorityLevel:generalField.seniorityLevel.required(),
    jobDescription:generalField.jobDescription.required(),
    technicalSkills: generalField.technicalSkills.required(),
    softSkills: generalField.softSkills.required(),
}).required();

export const updateJobSchema = joi.object({
    jobId:generalField.id.required(),
    jobTitle:generalField.jobTitle,
    jobLocation:generalField.jobLocation,
    workingTime:generalField.workingTime,
    seniorityLevel:generalField.seniorityLevel,
    jobDescription:generalField.jobDescription,
    technicalSkills: generalField.technicalSkills,
    softSkills: generalField.softSkills,
}).required();

export const jobIdSchema = joi.object({
    jobId: generalField.id.required(),
}).required();

export const getJobsSchema = joi.object({
    companyId: generalField.id.required(),
    companyName:generalField.companyName,
    jobTitle:generalField.jobTitle.required(),
    page: joi.number().min(1),
}).required();

export const getFilteredJobsSchema = joi.object({
    jobTitle:generalField.jobTitle,
    jobLocation:generalField.jobLocation,
    workingTime:generalField.workingTime,
    seniorityLevel:generalField.seniorityLevel,
    technicalSkills: generalField.technicalSkills,
}).required();

export const getJobApplicationsSchema = joi.object({
    jobId: generalField.id.required(),
    page: joi.number().min(1).optional(),
}).required();

export const applyToJobSchema = joi.object({
    jobId: generalField.id.required(),
    userCV: joi.object({
        secure_url: joi.string().required(),
        public_id: joi.string().required()
    }).required()
}).required();

export const acceptOrRejectApplicantSchema = joi.object({
    applicationId: generalField.id.required(),
    status: joi.string().required(),
}).required();


