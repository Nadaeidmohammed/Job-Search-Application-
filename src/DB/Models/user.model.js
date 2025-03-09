import mongoose,{Schema,model,Types} from "mongoose";
import { ROLES,GENDERS,AUTH_PROVIDERS,OTP_TYPES} from "../../utils/constant.js";
import { hash } from "../../utils/hashing/hash.js";
import {decrypt, encrypt} from "../../utils/encryption/encryption.js"
const userSchema=new Schema({
    firstName:{
        type:String,
        minlength:[3,"firstName must be at least 3 characters long"],
        maxlength:[20,"firstName must be at most 20 characters long"],
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        minlength:[3,"lastName must be at least 3 characters long"],
        maxlength:[20,"lastName must be at most 20 characters long"],
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true, 
        lowercase:true,
        unique:true,
    },
    password:{
        type:String,
        minlength:[6,"password must be at least 6 characters long"],
    },
    provider:{
        type:String,
        enum:Object.values(AUTH_PROVIDERS),
        default:AUTH_PROVIDERS.SYSTEM,
    },
    gender:{
        type:String,
        enum:Object.values(GENDERS),
        default:GENDERS.MALE,
    },
    DOB:{ 
        type: Date, 
        validate: {
            validator: function (value) {
                const age = new Date().getFullYear() - value.getFullYear();
                return age >= 18 && value < new Date();
            },
          message: "User must be at least 18 years old and the date must be in the past"
        }
    },
    mobileNumber:{
        type:String,
        trim: true,
    },
    role:{
        type:String,
        enum:Object.values(ROLES),
        default:ROLES.USER,
    },
    isConfirmed:{
        type:Boolean,
        default:false,
    },
    deletedAt: {
       type: Date,
    },
    bannedAt: { 
       type: Date, 
    },
    updatedBy:{
        type:Types.ObjectId,
        ref: "User", 
    },
    changeCredentialTime: {
       type: Date, 
       default: Date.now 
    },
    profilePic: { 
      secure_url: String,
      public_id: String 
    },
    coverPic: {
      secure_url: String,
      public_id: String 
    },
    OTP: [{
        hashedCode: String, 
        type: { 
            type: String,
             enum: Object.values(OTP_TYPES) 
            }, 
        expiresIn: {
            type: Date, 
        }
      }]
},{timestamps:true,toJSON:true,toObject:true})
userSchema.virtual("username").get(function () {
    return `${this.firstName} ${this.lastName}`;
})

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
      this.password = hash({ plainText: this.password });
  }
  if (this.isModified("mobileNumber")) {
      this.mobileNumber = encrypt({ plainText: this.mobileNumber, signature: process.env.ENCRYPTION_SECRET });
  }
  next();
});

userSchema.post("findOne", function (doc, next) {
    if (doc) {
        if (doc.mobileNumber) {
            doc.mobileNumber = decrypt({ encrypted: doc.mobileNumber, signature: process.env.ENCRYPTION_SECRET });
        }
    }
    next();
});


export const UserModel= mongoose.models.User || model("User",userSchema)