import mongoose, { Schema, model, Types } from "mongoose";
import { APPLICATION_STATUSES } from "../../utils/constant.js";

const applicationSchema = new Schema({
    jobId: {
        type: Types.ObjectId,
        ref: "Job",
        required: true,
    },
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    userCV: {
        secure_url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
        },
    },
    status: {
        type: String,
        enum: Object.values(APPLICATION_STATUSES),
        default: APPLICATION_STATUSES.PENDING,
    },
}, { timestamps: true });

export const ApplicationModel = mongoose.models.Application || model("Application", applicationSchema);