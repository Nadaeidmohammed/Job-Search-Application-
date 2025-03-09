import { Router } from "express";
import * as userService from "./user.service.js"
import * as userValidation from "./user.validation.js"
import asyncHandler from "../../utils/errorHandling/asyncHandler.js";
import { authentication } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { uploadCloud } from "../../utils/file Uploading/multerCloud.js";

const router=Router();


router.patch("/update_profile",
     validation(userValidation.updateProfileSchema),
     authentication(),
     asyncHandler(userService.updateProfile));

router.get("/getProfile",
     authentication(),
     asyncHandler(userService.getProfile));


router.get("/getProfileForAnotherUser/:userId",
validation(userValidation.getProfileForAnotherUserSchema),
authentication(),
asyncHandler(userService.getProfileForAnotherUser));

router.patch("/update_password",
    validation(userValidation.updatePasswordSchema),
    authentication(),
    asyncHandler(userService.updatePassword));

router.patch("/softDelete",
     authentication(),
     asyncHandler(userService.softDeleteAccount));

router.post("/uploadProfilePic",
    authentication(),
    uploadCloud().single("image"),
    validation(userValidation.uploadProfilePicSchema),
    asyncHandler(userService.uploadProfilePic)
)
router.post("/uploadCoverPic",
     authentication(),
     uploadCloud().single("image"),
     validation(userValidation.uploadCoverPicSchema),
     asyncHandler(userService.uploadCoverPic)
 )
router.delete("/deleteProfilePic",
    authentication(),
    asyncHandler(userService.deleteProfilePic)
)

router.delete("/deleteCoverPic",
    authentication(),
    asyncHandler(userService.deleteCoverPic)
)
export default router;