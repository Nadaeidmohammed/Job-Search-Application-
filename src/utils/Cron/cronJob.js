import cron from "node-cron";
import { UserModel } from "../../DB/Models/user.model.js";

cron.schedule("0 */6 * * *", async () => { 
    try {
        console.log("Running CRON Job: Deleting expired OTPs...");
        const result = await UserModel.updateMany(
            {},
            { $pull: { OTP: { expiresIn: { $lte: new Date() } } } }
        );
        console.log("Expired OTPs deleted successfully.");
    } catch (error) {
        console.error("Error in CRON Job:", error);
    }
});
