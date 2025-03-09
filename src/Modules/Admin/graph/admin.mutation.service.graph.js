import * as dbService from "../../../DB/dbService.js";
import { UserModel } from "../../../DB/Models/user.model.js";
import { CompanyModel } from "../../../DB/Models/company.model.js";
import { authentication } from "./graph.auth.middleware.js";
import { ROLES } from "../../../utils/constant.js";
import { validation } from "../graph/graph.validation.middleware.js";
import { approveCompanySchema, banCompanySchema, banUserSchema } from "../admin.validation.js";

export const banUser = async (parent, args) => {
    const {userId,authorization}=args;
    await authentication({authorization,accessRoles:ROLES.ADMIN})
    await validation(banUserSchema,args)
    const user = await dbService.findOne({ model: UserModel, filter: { _id: userId } });
    if (!user) throw new Error("User not found");

    user.bannedAt = user.bannedAt ? null : new Date();
    await user.save();

    return { message: user.bannedAt ? "User banned successfully" : "User unbanned successfully", success: true };
};

export const banCompany = async (parent, args) => {
    const {companyId,authorization}=args;

    await authentication({authorization,accessRoles:ROLES.ADMIN})
    await validation(banCompanySchema,args)

    const company = await dbService.findOne({ model: CompanyModel, filter: { _id: companyId } });
    if (!company) throw new Error("Company not found");

    company.bannedAt = company.bannedAt ? null : new Date();
    await company.save();

    return { message: company.bannedAt ? "Company banned successfully" : "Company unbanned successfully", success: true };
};

export const approveCompany = async (parent, args) => {
    const {companyId,authorization}=args;

    await authentication({authorization,accessRoles:ROLES.ADMIN})
    await validation(approveCompanySchema,args)

    const company = await dbService.findOne({ model: CompanyModel, filter: { _id: companyId } });
    if (!company) throw new Error("Company not found");

    if (company.approvedByAdmin) throw new Error("Company already approved");

    company.approvedByAdmin = true;
    await company.save();

    return { message: "Company approved successfully", success: true };
};
