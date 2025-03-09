import * as dbService from "../DB/dbService.js"
import { UserModel } from "../DB/Models/user.model.js";
import asyncHandler from "../utils/errorHandling/asyncHandler.js"
import { verify } from "../utils/token/token.js";
 import { tokenTypes } from "../utils/constant.js";
export const decodedToken=async({
    authorization="",
    tokenType=tokenTypes.access,
    next={}
})=>{
    const [bearer,token]=authorization.split(" ") || [];
    if(!bearer || ! token)
        return next(new Error("In_Valid token" , {cause:400}))

    let signature=undefined;
    switch (bearer) {
        case "Admin":
            signature = tokenType === tokenTypes.access ? process.env.ADMIN_ACCESS_TOKEN : process.env.ADMIN_REFRESH_TOKEN;
            break;
        case "User":
            signature = tokenType === tokenTypes.access ? process.env.USER_ACCESS_TOKEN : process.env.USER_REFRESH_TOKEN;
            break;
        default:
            return next(new Error("Invalid token type", { cause: 400 }));
    }

    if (!signature) {
        return next(new Error("Invalid token signature", { cause: 400 }));
    }
    
    const decoded = verify({ token , 
        signature
    });
    
    if (!decoded?.id) {
        return next(new Error("Invalid token payload", { cause: 400 }));
    }

    const user = await dbService.findOne({
        model:UserModel,
        filter:{ _id: decoded.id ,deleteedAt:null}});


    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }
    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000)
        return next(new Error("Invalid token ", { cause: 404 }));

    return user;
}
export const authentication =()=>{
    return asyncHandler(async(req,res,next) => {
        const {authorization}=req.headers;
        req.user =await decodedToken({authorization , next})
        return next();
    });
};
export const allowTo = (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new Error("You are not authorized to access this resource", { cause: 403 }));
        }
        return next();
    });
};
