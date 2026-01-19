import { 
    getAllJobs, 
    getJobById, 
    createJob, 
    ApplyingToJob, 
    generateJobOfferForUser 
} from "../services/jobService.js";
import { getProfileByUserId } from "../services/profileService.js";
import catchAsync from "../utils/catchAsync.js";

export const getJobs = catchAsync(async (req, res) => {
    const jobs = await getAllJobs();
    res.status(200).json({
        status: "success",
        results: jobs.length,
        data: {
            jobs
        }
    });
});

export const getJob = catchAsync(async (req, res) => {
    const job = await getJobById(req.params.id);
    res.status(200).json({
        status: "success",
        data: {
            job
        }
    });
});

export const createNewJob = catchAsync(async (req, res) => {
    const job = await createJob(req.body);
    res.status(201).json({
        status: "success",
        data: {
            job
        }
    });
});

export const applyJob = catchAsync(async (req, res) => {
    const job = await ApplyingToJob(req.params.id, req.user.id);
    res.status(200).json({
        status: "success",
        data: {
            job
        }
    });
});

export const generateJobs = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);
    
    if (!profile) {
        return res.status(404).json({
            status: "fail",
            message: "User profile not found. Please create a profile first."
        });
    }

    const jobs = await generateJobOfferForUser(profile);
    
    res.status(200).json({
        status: "success",
        results: jobs.length,
        data: {
            jobs
        }
    });
});
