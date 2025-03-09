import * as dbService from "../../DB/dbService.js"
import {ApplicationModel} from "../../DB/Models/application.model.js"
import { JobModel } from "../../DB/Models/job.model.js";
import {CompanyModel} from "../../DB/Models/company.model.js"
import {paginate} from "../../utils/pagination/paginate.js"
import {setupSocket} from "../../utils/Socket/soket.js"

export const addJob = async (req, res, next) => {
    const{companyId}=req.params;

    const company = await dbService.findById({ model: CompanyModel, id: companyId });
    if (!company) return next(new Error("Company not found", { cause: 404 }));

    const addedBy = req.user._id;
    if (company.createdBy.toString() !== addedBy.toString() && !company.HRs.includes(addedBy)) {
        return next(new Error("Unauthorized: Only company HR or owner can add jobs", { cause: 403 }));
    }
    const job = await dbService.create({
        model: JobModel,
        data: {
          ...req.body,
          companyId: company._id,
          addedBy: addedBy,
        },
    });
    return res.status(201).json({ success: true, message: "Job added successfully", job });
};
export const updateJob = async (req, res, next) => {
    const { jobId } = req.params;
    const updatedBy = req.user._id;
    const updateData = req.body;

    const job = await dbService.findById({ model: JobModel, id: jobId });
    if (!job) return next(new Error("Job not found", { cause: 404 }));

    const company = await dbService.findById({ model: CompanyModel, id: job.companyId });
    if (!company) return next(new Error("Company not found", { cause: 404 }));

    if (company.createdBy.toString() !== updatedBy.toString()) {
        return next(new Error("Unauthorized: Only company owner can update jobs", { cause: 403 }));
    }
    const updatedJob = await dbService.findOneAndUpdate({
        model: JobModel,
        filter: { _id: jobId },
        data: { ...updateData, updatedBy },
        options: { new: true, runValidators: true },
    });
    return res.status(200).json({ success: true, message: "Job updated successfully", job: updatedJob });
};
export const deleteJob = async (req, res, next) => {
    const { jobId } = req.params;

    const job = await dbService.findOne({
        model: JobModel,
        filter: { _id: jobId }
    });
    if (!job) return next(new Error("Job not found", { cause: 404 }));

    const company = await dbService.findOne({
        model: CompanyModel,
        filter: { _id: job.companyId, $or: [{ createdBy: req.user._id }, { HRs: req.user._id }] }
    });

    if (!company) return next(new Error("Unauthorized! Only company owner or HR can delete jobs", { cause: 403 }));

    if (!company.HRs.includes(req.user._id)) {
        return next(new Error("Unauthorized! Only company HR can delete jobs", { cause: 403 }));
    }
    await dbService.deleteMany({
        model: ApplicationModel,
        filter: { jobId: jobId }
    });
    await dbService.findByIdAndDelete({
        model: JobModel,
        id: jobId
    });

    return res.status(200).json({ success: true, message: "Job and all related applications deleted successfully" });
};
export const getJobsForCompany = async (req, res, next) => {
    const { companyId } = req.params;
    const { page = 1, jobTitle, companyName } = req.query;

    const filter = {};

    if (companyId) filter.companyId = companyId;
    if (jobTitle) filter.jobTitle = new RegExp(jobTitle, "i");

    if (companyName) {
        const company = await dbService.findOne({
            model: CompanyModel,
            filter: { companyName: new RegExp(companyName, "i") },
        });

        if (!company) return next(new Error("Company not found", { cause: 404 }));

        filter.companyId = company._id;
    }

    const results = await paginate(JobModel, filter, page, { sort: { createdAt: -1 } });

    return res.status(200).json({ success: true, message: "Jobs fetched successfully", ...results });
};
export const getFilteredJobs = async (req, res, next) => {
    const { page = 1, workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;
    let filter = {};
    if (workingTime) filter.workingTime = workingTime;
    if (jobLocation) filter.jobLocation = jobLocation;
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
    if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: "i" };
    if (technicalSkills) filter.technicalSkills = { $in: technicalSkills.split(",") };
    
    const jobs = await paginate(JobModel, filter, page);
    return res.status(200).json({ success: true, message: "Jobs fetched successfully", ...jobs });
};
export const getJobApplications = async (req, res, next) => {
    const { jobId } = req.params;
    const { page = 1 } = req.query; 
    const userId = req.user._id; 

    const job = await dbService.findById({ model: JobModel, id: jobId });
        if (!job) return next(new Error("Job not found", { cause: 404 }));

        const company = await dbService.findOne({
            model: CompanyModel,
            filter: { 
                _id: job.companyId, 
                $or: [{ createdBy: userId }, { HRs: userId }] 
            },
        });
        if (!company) {
            return next(new Error("Unauthorized: Only company owner or HR can view applications", { cause: 403 }));
        }

        const applications = await paginate(ApplicationModel, { jobId }, page, {
            sort: { createdAt: -1 },
            populate: "user", 
        });

        return res.status(200).json({
            success: true,
            message: "Applications fetched successfully",
            ...applications,
        });
};
export const applyToJob = async (req, res, next) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    if (!req.file) {
        return next(new Error("CV file is required", { cause: 400 }));
    }

    const uploadedCV = await cloudinary.uploader.upload(req.file.path, {
        folder: `Users/${userId}/CVs`
    });

    const { secure_url, public_id } = uploadedCV;
    const userCV = { secure_url, public_id };

    const { error } = applyToJobSchema.validate({ jobId, userCV });
    if (error) return next(new Error(error.details.map((err) => err.message).join(", "), { cause: 400 }));

    if (req.user.role !== "User") {
        return next(new Error("Unauthorized: Only users can apply to jobs", { cause: 403 }));
    }

    const job = await dbService.findById({ model: JobModel, id: jobId });
    if (!job) return next(new Error("Job not found", { cause: 404 }));
    if (job.closed) return next(new Error("Job is closed", { cause: 400 }));

    const existingApplication = await dbService.findOne({
        model: ApplicationModel,
        filter: { jobId, userId },
    });
    if (existingApplication) {
        return next(new Error("You have already applied to this job", { cause: 400 }));
    }

    const application = await dbService.create({
        model: ApplicationModel,
        data: { jobId, userId, userCV },
    });

    const company = await dbService.findById({ model: JobModel, id: job.companyId });
    io.to(company.companyId.toString()).emit("newApplication", {
        message: `New application for job: ${job.jobTitle}`,
        applicationId: application._id,
        jobId,
    });

    return res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application,
    });
};
export const acceptOrRejectApplicant = async (req, res, next) => {
    const { applicationId } = req.params;
    const { status } = req.body; 
    const userId = req.user._id;
  
        if (!["accepted", "rejected"].includes(status)) {
            return next(new Error("Invalid status. Use 'accepted' or 'rejected'", { cause: 400 }));
        }

        const application = await dbService.findById({
            model: ApplicationModel,
            id: applicationId,
            options: { populate: "user" }, 
        });
        if (!application) return next(new Error("Application not found", { cause: 404 }));

        const job = await dbService.findById({ model: JobModel, id: application.jobId });
        const company = await dbService.findById({ model: CompanyModel, id: job.companyId });

        if (!company.HRs.includes(userId)) {
            return next(new Error("Unauthorized: Only HR can manage applications", { cause: 403 }));
        }

        const updatedApplication = await dbService.findOneAndUpdate({
            model: ApplicationModel,
            filter: { _id: applicationId },
            data: { status },
            options: { new: true, runValidators: true },
        });

        // Send email
        const userEmail = application.user.email; 
        const subject = `Application Status Update for ${job.jobTitle}`;
        const text = status === "accepted"
            ? `Congratulations! Your application for ${job.jobTitle} at ${company.companyName} has been accepted.`
            : `We regret to inform you that your application for ${job.jobTitle} at ${company.companyName} has been rejected.`;

        await sendEmail(userEmail, subject, text);

        return res.status(200).json({
            success: true,
            message: `Application ${status} successfully`,
            data: updatedApplication,
        });
    
};






