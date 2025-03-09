import mongoose, { Schema, model, Types } from "mongoose";
import { ROLE_TYPE } from "../../utils/constant.js";

const chatSchema = new Schema({
    senderId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
        validate: {
            validator: async function (senderId) {
                const user = await mongoose.model("User").findById(senderId);
                return user && (user.role === ROLE_TYPE.HR || user.role === ROLE_TYPE.ADMIN);
            },
            message: "Sender must be an HR or Admin.",
        },
    },
    receiverId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    messages: [{
        message: {
            type: String,
            required: true,
            trim: true,
        },
        senderId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    }],
}, { timestamps: true });

export const ChatModel = mongoose.models.Chat || model("Chat", chatSchema);