import * as adminServiceQuery from "./admin.query.service.graph.js"
import * as adminServiceMutation from "./admin.mutation.service.graph.js"
import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLBoolean, GraphQLInt, GraphQLEnumType, GraphQLNonNull } from "graphql";


export const query = {
    getAllUsers: {
        type: new GraphQLObjectType({
            name: "UserResponse",
            fields: {
                message: { type: GraphQLString },
                statusCode: { type: GraphQLInt },
                data: { type: new GraphQLList(new GraphQLObjectType({
                    name:"Users",
                    fields:{
                        _id: { type: GraphQLID },
                        firstName: { type: GraphQLString },
                        lastName: { type: GraphQLString },
                        email: { type: GraphQLString },
                        password:{type: GraphQLString},
                        mobileNumber:{type:GraphQLString},
                        role:{type:new GraphQLEnumType({
                            name:"role",
                            values:{
                                User:{type:GraphQLString},
                                Admin:{type:GraphQLString},
                                HR:{type:GraphQLString}
                            }
                        })},
                        gender:{type:new GraphQLEnumType({
                            name:"gender",
                            values:{
                                male:{type:GraphQLString},
                                female:{type:GraphQLString}
                            }
                        })},
                        provider:{type:new GraphQLEnumType({
                            name:"provider",
                            values:{
                                System:{type:GraphQLString},
                                Google:{type:GraphQLString}
                            }
                        })},
                        isConfirmed: { type: GraphQLBoolean },
                        profilePic:{type:new GraphQLObjectType({
                            name:"profilePic",
                            fields:{
                                secure_url:{ type: GraphQLString },
                                public_id:{ type: GraphQLString },
                            },
                        })},
                        coverPicUser:{type:new GraphQLObjectType({
                            name:"coverPicUser",
                            fields:{
                                secure_url:{ type: GraphQLString },
                                public_id:{ type: GraphQLString },
                            },
                        })},
                        DOB:{type:GraphQLString},
                        deletedAt:{type:GraphQLString},
                        bannedAt:{type:GraphQLString},
                        changeCredentialTime:{type:GraphQLString},
                        updatedBy:{type:GraphQLID},
                        OTP:{type:new GraphQLList(new GraphQLObjectType({
                            name:"OTP",
                            fields:{
                                hashedCode:{type:GraphQLString},
                                expiresIn:{type:GraphQLString},
                                type:{type:new GraphQLEnumType({
                                    name:"type",
                                    values:{
                                        confirmEmail:{type:GraphQLString},
                                        forgetPassword:{type:GraphQLString}
                                    }
                                })},
                            }
                        }))}
                    }
                })) }
            }
        }),
        args: {
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: adminServiceQuery.getAllUsers
    },
    getAllCompanies: {
        type: new GraphQLObjectType({
            name: "CompanyResponse",
            fields: {
                message: { type: GraphQLString },
                statusCode: { type: GraphQLInt },
                data: { type: new GraphQLList(new GraphQLObjectType({
                    name:"Company",
                    fields:{
                        _id: { type: GraphQLID },
                        companyName: { type: GraphQLString },
                        description: { type: GraphQLString },
                        industry: { type: GraphQLString },
                        address: { type: GraphQLString },
                        numberOfEmployees: { type: GraphQLString },
                        companyEmail: { type: GraphQLString },
                        approvedByAdmin: { type: GraphQLBoolean },
                        createdBy:{type:GraphQLID},
                        logo:{type:new GraphQLObjectType({
                            name:"logo",
                            fields:{
                                secure_url:{ type: GraphQLString },
                                public_id:{ type: GraphQLString },
                            },
                        })},
                        coverPic:{type:new GraphQLObjectType({
                            name:"coverPic",
                            fields:{
                                secure_url:{ type: GraphQLString },
                                public_id:{ type: GraphQLString },
                            },
                        })},
                        legalAttachment:{type:new GraphQLObjectType({
                            name:"legalAttachment",
                            fields:{
                                secure_url:{ type: GraphQLString },
                                public_id:{ type: GraphQLString },
                            },
                        })},
                        HRs:{type:new GraphQLList(GraphQLID)},
                        bannedAt:{type:GraphQLString},
                        deletedAt:{type:GraphQLString},
                    }
                }))
            }
            }
        }),
        args: {
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: adminServiceQuery.getAllCompanies
    }
};
export const mutation = {
    banUser: {
        type: new GraphQLObjectType({
            name: "BanUserResponse",
            fields: {
                message: { type: GraphQLString },
                success: { type: GraphQLBoolean },
            },
        }),
        args: {
            userId: { type: GraphQLID },
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: adminServiceMutation.banUser,
    },

    banCompany: {
        type: new GraphQLObjectType({
            name: "BanCompanyResponse",
            fields: {
                message: { type: GraphQLString },
                success: { type: GraphQLBoolean },
            },
        }),
        args: {
            companyId: { type: GraphQLID },
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: adminServiceMutation.banCompany,
    },

    approveCompany: {
        type: new GraphQLObjectType({
            name: "ApproveCompanyResponse",
            fields: {
                message: { type: GraphQLString },
                success: { type: GraphQLBoolean },
            },
        }),
        args: {
            companyId: { type: GraphQLID },
            authorization: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: adminServiceMutation.approveCompany,
    },
};