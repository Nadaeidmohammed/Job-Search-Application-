import * as dbService from "../../DB/dbService.js"
import { CompanyModel } from "../../DB/Models/company.model.js";
import cloudinary from "../../utils/file Uploading/cloudinaryConfig.js"
import { defaultImageOnCloud, defaultPublicIdOnCloud, ROLES } from "../../utils/constant.js";

export const addCompany = async (req, res,next) => {
    const { companyName, companyEmail } = req.body;

    const existingCompany = await dbService.findOne({model:CompanyModel,filter:{ $or: [{ companyName }, { companyEmail }] }});
    if (existingCompany) {
        return next(new Error("Company name or email already exists", { cause: 400 }))
    }

    const createdBy = req.user._id;

    const newCompany = await dbService.create({
        model: CompanyModel,
        data: {
            ...req.body,
            createdBy 
        }
    });
   return res.status(201).json({ success: true, message: "Company added successfully", data: { newCompany } });
};
export const updateCompany  = async (req, res, next) => {
    const { companyId } = req.params;
    const updateData = { ...req.body };

    const company = await dbService.findOne({
        model: CompanyModel,
        filter: { _id: companyId }
    });
    if (!company) {
       return next(new Error("Company not found", { cause: 404 })) 
    }

    if (company.createdBy.toString() !== req.user._id.toString()) {
       return next(new Error("Unauthorized: Only the company owner can update the data", { cause: 403 }))
    }
    delete updateData.legalAttachment;
    const updatedCompany = await dbService.findOneAndUpdate({
        model: CompanyModel,
        filter: { _id: companyId },
        data: updateData,
        options: { new: true ,runValidators:true}
    });

    return res.status(200).json({ message: "Company updated successfully", updatedCompany });
};
export const softDeleteCompany   = async (req, res, next) => {
    const { companyId } = req.params;
    const company = await dbService.findOne({
        model: CompanyModel,
        filter: { _id: companyId }
    });

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }

    if (company.deletedAt) {
        return next(new Error("Company is already soft deleted", { cause: 400 }));
    }
    const isAdmin = req.user.role === ROLES.ADMIN;
    const isOwner = company.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
       return next(new Error("Unauthorized: Only admin or company owner can perform this action", { cause: 403 })) 
    }

    company.deletedAt = new Date();
    await company.save();

    return res.status(200).json({ message: "Company soft deleted successfully" });
};
export const getCompanyWithJobs = async (req, res,next) => {
    const { companyId } = req.params;

    const company = await dbService.findById({
        model: CompanyModel, 
        id: companyId,
        select: " -_id companyEmail coverPic description",
        populate: { path: "jobs", select: "jobTitle jobLocation workingTime" }
    });
     
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }

    return res.status(200).json({ success: true, data: { company } });
};
export const searchCompanyByName = async (req, res,next) => {
    const { companyName } = req.query;

    if (!companyName) 
        return next(new Error("Company name is required for search", { cause: 400 })) 
    const company = await dbService.find({
        model: CompanyModel,
        filter: { companyName: { $regex: companyName, $options: "i" } }, // Case-insensitive search
        select: "companyName companyEmail logo coverPic",
    });
    return res.status(200).json({ message: "Company fetched successfully", company });
};
export const uploadCompanyLogo = async (req, res, next) => {
    const { companyId } = req.params;
    
    const company = await dbService.findById({ model: CompanyModel, id: companyId });
    if (!company) return next(new Error("Company not found", { cause: 404 }));

    if (company.logo?.public_id) await cloudinary.uploader.destroy(company.logo.public_id);
    if (company.createdBy.toString() !== req.user._id.toString()) 
        return next(new Error("Unauthorized", { cause: 403 }));

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `Companies/${companyId}/logo`
    });

    company.logo = { secure_url, public_id };
    await company.save();

    return res.status(200).json({ success: true, message: "Company logo uploaded", data: { company } });
};
export const uploadCompanyCoverPic = async (req, res, next) => {
    const { companyId } = req.params;
    
    const company = await dbService.findById({ model: CompanyModel, id: companyId });
    if (!company) return next(new Error("Company not found", { cause: 404 }));

    if (company.createdBy.toString() !== req.user._id.toString()) 
        return next(new Error("Unauthorized", { cause: 403 }));

    if (company.coverPic?.public_id) 
        await cloudinary.uploader.destroy(company.coverPic.public_id);

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `Companies/${companyId}/cover`
    });

    company.coverPic = { secure_url, public_id };
    await company.save();

    return res.status(200).json({ success: true, message: "Company cover picture uploaded", data: { company } });
};
export const deleteCompanyLogo = async (req, res, next) => {
    const { companyId } = req.params;
    
    const company = await dbService.findById({ model: CompanyModel, id: companyId });
    if (!company) return next(new Error("Company not found", { cause: 404 }));

    if (company.createdBy.toString() !== req.user._id.toString()) 
        return next(new Error("Unauthorized", { cause: 403 }));

    if (!company.logo || !company.logo.public_id) 
        return next(new Error("No logo found to delete", { cause: 400 }));

    const results=await cloudinary.uploader.destroy(company.logo.public_id);
    if (results.result === "ok") {
        company.logo = { 
            secure_url: defaultImageOnCloud, 
            public_id: defaultPublicIdOnCloud 
        };
        await company.save();
    }

    return res.status(200).json({ success: true, message: "Company logo deleted", data: { company } });
};
export const deleteCompanyCoverPic = async (req, res, next) => {
    const { companyId } = req.params;
    
    const company = await dbService.findById({ model: CompanyModel, id: companyId });
    if (!company) return next(new Error("Company not found", { cause: 404 }));

    if (company.createdBy.toString() !== req.user._id.toString()) 
        return next(new Error("Unauthorized", { cause: 403 }));

    if (!company.coverPic || !company.coverPic.public_id) 
        return next(new Error("No cover picture found to delete", { cause: 400 }));

    const results=await cloudinary.uploader.destroy(company.coverPic.public_id);
    if (results.result === "ok") {
        company.coverPic = { 
            secure_url: defaultImageOnCloud, 
            public_id: defaultPublicIdOnCloud 
        };
        await company.save();
    }

    return res.status(200).json({ success: true, message: "Company cover picture deleted", data: { company } });
};


