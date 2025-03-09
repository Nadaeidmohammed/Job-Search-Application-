import * as dbService from "../../DB/dbService.js"
import { UserModel } from "../../DB/Models/user.model.js";
import { decrypt, encrypt } from "../../utils/encryption/encryption.js";
import { compareHash, hash } from "../../utils/hashing/hash.js";
import cloudinary from "../../utils/file Uploading/cloudinaryConfig.js"
import { defaultImageOnCloud, defaultPublicIdOnCloud } from "../../utils/constant.js";

export const updateProfile=async(req,res,next)=>{
    if(req.body.mobileNumber)
        req.body.mobileNumber=encrypt({plainText:req.body.mobileNumber,signature:process.env.ENCRYPTION_SECRET})
    const user =await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{_id:req.user._id},
        data:{...req.body},
        options:{new:true,runValidators:true}
     });
    return res.status(200).json({ success: true, message: "Profile updated successfully", user });
}
export const getProfile = async (req, res, next) => {
    const user = await dbService.findOne({
        model: UserModel,
        filter: { _id: req.user._id },
        select: "-_id",
    });
    if (!user) return next(new Error("User not found", { cause: 404 }));

    return res.status(200).json({ success: true, user });
};
export const updatePassword=async(req,res,next)=>{
    const{oldPassword,password}=req.body;
    
         const user =await dbService.findById({model:UserModel,
         id:{_id:req.user._id},
       }); 
    if(!compareHash({plainText:oldPassword,hash:req.user.password}))
      return next(new Error("In_valid password",{cause:404}))
   
       user.password=password;
       await user.save();
    return res.status(200).json({ success: true, message: "Password updated successfully" });
}
export const getProfileForAnotherUser = async (req, res, next) => {
    const { userId } = req.params;

    if (!userId) {
        return next(new Error('User ID is required', { cause: 400 }));
    }
    const user = await dbService.findById({
        model: UserModel,
        id: userId,
        select: 'firstName lastName mobileNumber profilePic coverPic'
    });

    if (!user) {
        return next(new Error('User not found', { cause: 404 }));
    }
    return res.status(200).json({
        success: true,
        data: {
            userName: `${user.firstName} ${user.lastName}`,
            mobileNumber:user.mobileNumber,
            profilePic: user.profilePic,
            coverPic: user.coverPic
        }
    });
};
export const uploadProfilePic = async (req, res, next) => {
    const user = await dbService.findById({
        model: UserModel,
        id: req.user._id,
    });

    if (user.profilePic?.public_id) {
        await cloudinary.uploader.destroy(user.profilePic.public_id);
    }
    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `Users/${req.user._id}/profilePicture`,
    });
    const updatedUser = await dbService.findByIdAndUpdate({
        model: UserModel,
        id: req.user._id,
        data: { profilePic: { public_id, secure_url } },
        options: { new: true }
    });

    return res.status(200).json({ success: true, message: "Profile picture uploaded successfully", user: updatedUser });
};
export const uploadCoverPic = async (req, res, next) => {
      const user = await dbService.findById({
        model: UserModel,
        id: req.user._id,
    });
    if (user.coverPic?.public_id) {
        await cloudinary.uploader.destroy(user.coverPic.public_id);
    }
    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `Users/${req.user._id}/coverPicture`,
    });
    const updatedUser = await dbService.findByIdAndUpdate({
        model: UserModel,
        id: req.user._id,
        data: { coverPic: { public_id, secure_url } },
        options: { new: true }
    });
    return res.status(200).json({ success: true, message: "Cover picture uploaded successfully", user: updatedUser });
};
export const deleteProfilePic = async (req, res, next) => {
    const user = await dbService.findById({ model: UserModel, id: req.user._id });

    if (user.profilePic?.public_id) {
        await cloudinary.uploader.destroy(user.profilePic.public_id);
    }

    user.profilePic = { public_id: defaultPublicIdOnCloud, secure_url: defaultImageOnCloud };
    await user.save();

    return res.status(200).json({ success: true, message: "Profile picture deleted", user });
};
export const deleteCoverPic = async (req, res, next) => {
    const user = await dbService.findById({ model: UserModel, id: req.user._id });

    if (user.coverPic?.public_id) {
        await cloudinary.uploader.destroy(user.coverPic.public_id);
    }

    user.coverPic = { public_id: defaultPublicIdOnCloud, secure_url: defaultImageOnCloud };
    await user.save();

    return res.status(200).json({ success: true, message: "Cover picture deleted", user });
};
export const softDeleteAccount = async (req, res, next) => {
    const user = await dbService.findByIdAndUpdate({
        model: UserModel,
        id: req.user._id,
        data: { deletedAt: new Date() },
        options: { new: true }
    });

    return res.status(200).json({ success: true, message: "Account soft deleted", user });
};

