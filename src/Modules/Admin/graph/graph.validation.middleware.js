
export const validation=(schema,args)=>{
      
    const results=schema.validate(args,{abortEarly:false })
    if(results.error){
        throw new Error(results.error)
    }
    return true;

}

