import {compareHash, hash} from "../../utils/hashing/hash.js"
import {UserModel} from "../../DB/Models/user.model.js"
import {emailEmitter} from "../../utils/email/emailEvent.js"
import { generateToken } from "../../utils/token/token.js";
import {OAuth2Client}  from 'google-auth-library';
import * as dbService from "../../DB/dbService.js"
import{decodedToken} from "../../middlewares/auth.middleware.js"
import { OTP_TYPES, ROLES,AUTH_PROVIDERS, tokenTypes } from "../../utils/constant.js";

export const register=async(req,res,next)=>{
    const{firstName,lastName,email,password,mobileNumber}=req.body;
    const user =await dbService.findOne({model:UserModel,filter:{email}})
    if(user)
        return next (new Error("User Already Exist",{cause:409}))

    const newUser=await dbService.create({
      model:UserModel,
      data:{ 
        firstName,
        lastName,
        email,
        password,
        mobileNumber
    }})
    //sendEmail
    emailEmitter.emit("sendEmail",email,firstName,newUser._id)
    return res.status(201).json({success:true,message:"User Created Successfully",newUser})
}
export const confirmEmail=async(req,res,next)=>{
    const { code, email } = req.body;

    const user = await dbService.findOne({ model: UserModel, filter: { email } });
        if (!user) {
            return next(new Error("User Not Found", { cause: 404 }));
        }
        if (user.isConfirmed === true) {
            return next(new Error("Email Already Verified", { cause: 409 }));
        }
        //[{}]
        const otpObject = user.OTP.find(
            (otp) =>
                otp.type === OTP_TYPES.CONFIRM_EMAIL &&
                compareHash({ plainText: code, hash: otp.hashedCode }) &&
                otp.expiresIn > new Date()
        );
        if (!otpObject) {
            return next(new Error("Invalid or expired OTP", { cause: 400 }));
        }
        await dbService.updateOne({
            model: UserModel,
            filter: { email },
            data: {
                isConfirmed: true,
                $pull: { OTP: { type: OTP_TYPES.CONFIRM_EMAIL } },
            },
        });

        return res.status(200).json({ success: true, message: "Email Verified Successfully" });
}
export const login=async(req,res,next)=>{
    const{email,password}=req.body;

    const user = await dbService.findOne({model:UserModel,filter:{email}});
    if(!user)
        return next (new Error("User Not Found",{cause:404}))

    if(!user.isConfirmed)
        return next (new Error("Email Not Verified",{cause:401}))

    if(!compareHash({plainText:password,hash:user.password}))
        return next (new Error("In_Valid Password",{cause:400}))

    const access_token=generateToken({payload:{id:user._id},
        signature:user.role===ROLES.USER?
        process.env.USER_ACCESS_TOKEN:
        process.env.ADMIN_ACCESS_TOKEN,
        options:{expiresIn :process.env.ACCESS_TOKEN_EXPIRES}}
        )

        const refresh_token=generateToken({payload:{id:user._id},
            signature:user.role===ROLES.USER?
            process.env.USER_REFRESH_TOKEN:
            process.env.ADMIN_REFRESH_TOKEN,
            options:{expiresIn :process.env.REFRESH_TOKEN_EXPIRES}});


    return res.status(200).json({success:true,tokens:{
        access_token,
        refresh_token
    }});
}
export const loginWithGmail=async(req,res,next)=>{
    const {idToken}=req.body;    
    const client = new OAuth2Client();
    
    if (!idToken) {
        return next(new Error("ID token is required", { cause: 400 }));
    }
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}
const {family_name,given_name,email,picture,email_verified} =await verify();

if(!email_verified)
    return next (new Error("Email Not Verified",{cause:409}))
let user =await dbService.findOne({model:UserModel,filter:{email}});
if(user?.provider===AUTH_PROVIDERS.SYSTEM)
    return next (new Error("in_valid login method ",{cause:409}))
    if(!user)
     user=await dbService.create({
    model:UserModel,
    data:{
    firstName:given_name,
    lastName:family_name,
    email,
    profilePic:picture,
    isConfirmed:email_verified,
    provider:AUTH_PROVIDERS.GOOGLE
    }})
    const access_token=generateToken({payload:{id:user._id},
        signature:user.role===ROLES.USER?
        process.env.USER_ACCESS_TOKEN:
        process.env.ADMIN_ACCESS_TOKEN,
        options:{expiresIn :process.env.ACCESS_TOKEN_EXPIRES}}
    )
    
    const refresh_token=generateToken({payload:{id:user._id},
        signature:user.role===ROLES.USER?
        process.env.USER_REFRESH_TOKEN:
        process.env.ADMIN_REFRESH_TOKEN,
        options:{expiresIn :process.env.REFRESH_TOKEN_EXPIRES}}
    );
      
    return res.status(200).json({success:true,tokens:{
        access_token,
        refresh_token
    },
    message:"success"
   });
}
export const forgetPassword=async(req,res,next)=>{
    const{email}=req.body;
    const user = await dbService.findOne({model:UserModel,filter:{email}});
    if(!user)
        return next (new Error("User Not Found",{cause:404}))
  
    emailEmitter.emit("forgetPassword",email,user.firstName,user._id)

    return res.status(200).json({success:true,message:"OTP send successfully"})
}
export const resetPassword=async(req,res,next)=>{
    const{email,code,password}=req.body;
    const user = await dbService.findOne({model:UserModel,filter:{email}})
    if(!user)
        return next (new Error("User Not Found",{cause:404}))
    const otp = user.OTP.find(
        (otp) =>
            otp.type === OTP_TYPES.FORGET_PASSWORD &&
            otp.expiresIn > new Date()
    );
    if (!otp || !compareHash({ plainText: code, hash: otp.hashedCode }))
        return next(new Error("Invalid code", { cause: 404 }));

    const hashedPassword= hash({plainText:password})
      await dbService.updateOne({model:UserModel,filter:{email},
       data:{password:hashedPassword,
      OTP: user.OTP.filter((otp) => otp.type !== OTP_TYPES.FORGET_PASSWORD)}})

  
    return res.status(200).json({success:true,
        message:"Password Reseted Successfully"
    })
}
export const refresh_token=async(req,res,next)=>{
    const {authorization}=req.headers;
    const user =await decodedToken({
        authorization,
        tokenType:tokenTypes.refresh,
        next})

        if (user.changeCredentialTime?.getTime() >= user.iat * 1000) {
            return next(new Error("Invalid Refresh Token. Please log in again.", { cause: 403 }));
        }
    const access_token = generateToken({
        payload: { id: user._id },
        signature: user.role === ROLES.USER
            ? process.env.USER_ACCESS_TOKEN
            : process.env.ADMIN_ACCESS_TOKEN,
        options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    });
    
    const refresh_token = generateToken({
        payload: { id: user._id },
        signature: user.role === ROLES.USER
            ? process.env.USER_REFRESH_TOKEN
            : process.env.ADMIN_REFRESH_TOKEN,
        options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
    });

    return res.status(200).json({
        success: true,
        tokens: {
            access_token,
            refresh_token
        }
    });
}
//In Cron Folder

