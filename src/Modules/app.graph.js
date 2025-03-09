import { GraphQLObjectType, GraphQLSchema } from "graphql";
import * as adminGraphController from "./Admin/graph/admin.graph.controller.js"


export const schema=new GraphQLSchema({
    query:new GraphQLObjectType({
        name:"jobSearchApp",
        fields:{
            ...adminGraphController.query
        }
    }),
    mutation:new GraphQLObjectType({
        name:"socialAppMutation",
        fields:{
            ...adminGraphController.mutation
        }
    }),
})
