import connectDB from "./DB/connection.js";
import authRouter from "./Modules/Auth/auth.controller.js"
import userRouter from "./Modules/User/user.controller.js"
import jobRouter from "./Modules/jobs/jobs.controller.js"
import companyRouter from "./Modules/Company/company.controller.js"
import globalErrorHandler from "./utils/errorHandling/globalErrorHandler.js";
import notFoundHandler from "./utils/errorHandling/notFoundHandler.js";
import cors from "cors";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./Modules/app.graph.js";

export const bootstrab=async(app,express)=>{

    app.use(express.json());
    await connectDB();
    // const whitelist=["http://localhost:3000"];
    // app.use((req,res,next)=>{
    //     if(!whitelist.includes(req.header("origin")))
    //         return next(new Error("Bloked By Cors"));

    //     res.header("Access-Control-Allow-Origin",(req.header("origin")))
    //     res.header("Access-Control-Allow-Methods","*")
    //     res.header("Access-Control-Allow-Headers","*")
    //     res.header("Access-Control-Allow-Network",true)
    //     return next();
    // })
    app.use("/auth",authRouter);
    app.use("/user",userRouter);
    app.use("/companies",companyRouter)
    app.use("/jobs",jobRouter)
    app.use("/graphql",createHandler({schema:schema}))
    app.all("*",notFoundHandler)
    app.use(globalErrorHandler);
}
