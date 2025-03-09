import mongoose, { Schema, model, Types } from "mongoose";
import { JOB_LOCATIONS, WORKING_TIMES, SENIORITY_LEVELS } from "../../utils/constant.js";

const jobOpportunitySchema = new Schema({
    jobTitle: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Job title must be at least 3 characters long"],
        maxlength: [100, "Job title must be at most 100 characters long"],
    },
    jobLocation: {
        type: String,
        required: true,
        enum: Object.values(JOB_LOCATIONS),
    },
    workingTime: {
        type: String,
        required: true,
        enum: Object.values(WORKING_TIMES),
    },
    seniorityLevel: {
        type: String,
        required: true,
        enum: Object.values(SENIORITY_LEVELS),
    },
    jobDescription: {
        type: String,
        required: true,
        trim: true,
        minlength: [20, "Job description must be at least 20 characters long"],
        maxlength: [1000, "Job description must be at most 1000 characters long"],
    },
    technicalSkills: {
        type: [String],
        required: true,
        validate: {
            validator: function (skills) {
                return skills.length > 0;
            },
            message: "At least one technical skill is required.",
        },
    },
    softSkills: {
        type: [String],
        required: true,
        validate: {
            validator: function (skills) {
                return skills.length > 0;
            },
            message: "At least one soft skill is required.",
        },
    },
    addedBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: "User",
        default: null,
    },
    closed: {
        type: Boolean,
        default: false,
    },
    companyId: {
        type: Types.ObjectId,
        ref: "Company",
        required: true,
    },
}, { timestamps: true ,toJSON:true,toObject:true});

jobOpportunitySchema.virtual("application", {
    ref: "Application",
    localField: "_id",
    foreignField: "jobId",
});

export const JobModel  = mongoose.models.Job || model("Job", jobOpportunitySchema);