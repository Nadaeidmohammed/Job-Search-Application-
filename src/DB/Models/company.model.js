import mongoose, { Schema, model, Types } from "mongoose";

const companySchema = new Schema({
    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: [3, "Company name must be at least 3 characters long"],
        maxlength: [50, "Company name must be at most 50 characters long"],
    },
    description: {
        type: String,
        trim: true,
        required:true,
        minlength: [20, "Description must be at least 20 characters long"],
        maxlength: [1000, "Description must be at most 1000 characters long"],
    },
    industry: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    numberOfEmployees: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^\d+-\d+ employees$/.test(value);
            },
            message: "Number of employees must be in the format 'X-Y employees' (ex. '11-20 employees').",
        },
    },
    companyEmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
    },
    logo: {
        secure_url: String,
        public_id: String,
    },
    coverPic: {
        secure_url: String,
        public_id: String,
    },
    HRs: [{
        type: Types.ObjectId,
        ref: "User",
    }],
    bannedAt: {
        type: Date,
        default:null,
    },
    deletedAt: {
        type: Date,
        default:null,
    },
    legalAttachment: {
        secure_url: String,
        public_id: String,
    },
    approvedByAdmin: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true ,toJSON:{virtuals:true},toObject:{virtuals:true}});

companySchema.virtual("jobs", {
    ref: "Job",
    localField: "_id",
    foreignField: "companyId",
});

export const CompanyModel = mongoose.models.Company || model("Company", companySchema);