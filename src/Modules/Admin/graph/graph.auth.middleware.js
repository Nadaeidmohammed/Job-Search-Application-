import * as dbService from "../../../DB/dbService.js"
import { UserModel } from "../../../DB/Models/user.model.js";
import { tokenTypes } from "../../../utils/constant.js";
import { verify } from "../../../utils/token/token.js";

export const authentication=async({
    authorization="",
    tokenType=tokenTypes.access,
    accessRoles=[]
})=>{
    const [bearer,token]=authorization.split(" ") || [];
    if(!bearer || ! token)
        throw new Error("In_Valid token");

    let ACCESS_SIGNATURE=undefined;
    let REFRESH_SIGNATURE=undefined;
    switch (bearer) {
        case "Admin":
            ACCESS_SIGNATURE = process.env.ADMIN_ACCESS_TOKEN;
            REFRESH_SIGNATURE = process.env.ADMIN_REFRESH_TOKEN;
            break;
        case "User":
            ACCESS_SIGNATURE = process.env.USER_ACCESS_TOKEN;
            REFRESH_SIGNATURE=process.env.USER_REFRESH_TOKEN;
            break;
        default:
           break;
    }
    
    const decoded = verify({ token , 
        signature : tokenType ? ACCESS_SIGNATURE:REFRESH_SIGNATURE
    });
        
    const user = await dbService.findOne({
        model:UserModel,
        filter:{ _id: decoded.id, deletedAt:null }});


    if (!user) {
        throw new Error("User not found")
    }
    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000)
        throw new Error("In_Valid token");
    
    if(!accessRoles.includes(user.role))
        throw new Error("Forbidden");
    return user;
}

