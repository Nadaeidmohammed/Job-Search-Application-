const notFoundHandler=(req,res,next)=>{
    return next(new Error("Route Not Found",{cause:404}))
}
export default notFoundHandler;