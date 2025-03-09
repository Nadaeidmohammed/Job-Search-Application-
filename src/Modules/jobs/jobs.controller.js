import { Router } from "express";
import * as jobService from "./jobs.service.js";
import * as jobValidation from "./jobs.validation.js";
import asyncHandler from "../../utils/errorHandling/asyncHandler.js";
import { allowTo, authentication } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { uploadCloud } from "../../utils/file Uploading/multerCloud.js";

const router=Router({mergeParams:true});

router.post("/",
     authentication(),
     validation(jobValidation.addJobSchema),
     asyncHandler(jobService.addJob));

router.patch("/:jobId",
     authentication(),
     validation(jobValidation.updateJobSchema),
     asyncHandler(jobService.updateJob));

router.delete("/:jobId",
     authentication(),
     validation(jobValidation.jobIdSchema),
     asyncHandler( jobService.deleteJob));

router.get("/",
     validation(jobValidation.getJobsSchema),
     asyncHandler(jobService.getJobsForCompany));

router.get("/getFilteredJobs", 
    validation(jobValidation.getFilteredJobsSchema),
    asyncHandler(jobService.getFilteredJobs));

router.get("/:jobId/getJobApplications",
     authentication(),
     validation(jobValidation.jobIdSchema),
     asyncHandler(jobService.getJobApplications));

router.post("/:jobId/apply",
     authentication(),
     allowTo(["User"]),
     uploadCloud().single("userCV"),
     validation(jobValidation.applyToJobSchema),
     asyncHandler(jobService.applyToJob));

router.patch("/applications/:applicationId",
     authentication(),
     validation(jobValidation.acceptOrRejectApplicantSchema),
     asyncHandler(jobService.acceptOrRejectApplicant));

export default router;