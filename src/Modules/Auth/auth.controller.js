import { Router } from "express";
import * as authService from "./auth.service.js"
import * as authValidation from "./auth.validation.js"
import { validation } from "../../middlewares/validation.middleware.js";
import asyncHandler from "../../utils/errorHandling/asyncHandler.js";
const router=Router();

router.post("/register",
    validation(authValidation.registerSchema),
    asyncHandler(authService.register));

router.post("/login",
        validation(authValidation.loginSchema),
        asyncHandler(authService.login));

router.patch("/verifyEmail",
        validation(authValidation.confirmEmailSchema),
        asyncHandler(authService.confirmEmail));

router.get("/refresh_token",
        asyncHandler(authService.refresh_token));

router.patch("/forget_password",
        validation(authValidation.forgetPasswordSchema),
         asyncHandler(authService.forgetPassword));

router.patch("/reset_password",
        validation(authValidation.resetPasswordSchema),
        asyncHandler(authService.resetPassword));
        
router.post("/loginWithGmail",
        asyncHandler(authService.loginWithGmail));


export default router;