import { Router } from "express";
import * as companyService from "./company.service.js";
import * as companyValidation from "./company.validation.js";
import asyncHandler from "../../utils/errorHandling/asyncHandler.js";
import { authentication } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { uploadCloud } from "../../utils/file Uploading/multerCloud.js";
import jobRouter from "../jobs/jobs.controller.js"

const router = Router();

router.use("/:companyId/jobs",jobRouter)

router.post(
    "/",
    authentication(),
    validation(companyValidation.addCompanySchema),
    asyncHandler(companyService.addCompany)
);

router.patch(
    "/:companyId",
    authentication(),
    validation(companyValidation.updateCompanySchema),
    asyncHandler(companyService.updateCompany)
);

router.delete(
    "/:companyId",
    authentication(),
    validation(companyValidation.companyIdSchema),
    asyncHandler(companyService.softDeleteCompany)
);

router.get(
    "/:companyId/getCompanyWithJobs",
    validation(companyValidation.companyIdSchema),
    asyncHandler(companyService.getCompanyWithJobs)
);
router.get(
    "/search",
    validation(companyValidation.searchCompanySchema),
    asyncHandler(companyService.searchCompanyByName)
);

router.post(
    "/:companyId/logo",
    authentication(),
    uploadCloud().single("image"),
    validation(companyValidation.uploadCompanyLogoSchema),
    asyncHandler(companyService.uploadCompanyLogo)
);

router.post(
    "/:companyId/cover",
    authentication(),
    uploadCloud().single("image"),
    validation(companyValidation.uploadCompanyCoverPicSchema),
    asyncHandler(companyService.uploadCompanyCoverPic)
);

router.delete(
    "/:companyId/logo",
    authentication(),
    validation(companyValidation.companyIdSchema),
    asyncHandler(companyService.deleteCompanyLogo)
);

router.delete(
    "/:companyId/cover",
    authentication(),
    validation(companyValidation.companyIdSchema),
    asyncHandler(companyService.deleteCompanyCoverPic)
);

export default router;