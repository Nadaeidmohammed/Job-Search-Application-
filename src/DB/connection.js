import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        mongoose.connect(process.env.DB_URI,{
            serverSelectionTimeoutMS:3000,
        })
        console.log(`Connected To DB Successfully`);
    } catch (error) {
        console.log(`Fail To Connect To DB${error.message}`);
    }
}
export default connectDB;