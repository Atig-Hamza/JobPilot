import Job from "../models/jobs.js";
import { generateCompletion } from "./LLMService.js";

export const generateJobOfferForUser = async (userProfile, userId) => {
    const systemPrompt = `You are an expert HR recruiter and job market analyst. 
    Your task is to generate 3 distinct job offers specifically tailored to the provided user profile in valid JSON format.
    These jobs should be destined for this specific user ID: ${userId}.
    Return ONLY a JSON array containing the 3 job objects. No markdown, no conversational text.`;

    const promptCommand = `
    Analyze the following user profile:
    ${JSON.stringify(userProfile)}

    Based on this profile, generate 3 specific job offers destined for this user:
    1. **Standard Match**: A role that fits the user's current skills and experience perfectly.
    2. **Stretch/Challenge**: A role that is "harder" - more senior, requiring advanced skills or strictly higher qualifications than the user currently lists.
    3. **Pivot/Niche**: A role in a similar niche/industry but a different domain (e.g., if Developer, suggest Technical Product Manager or DevRel).

    For each job, provide the following fields exactly:
    - title (string)
    - company (string, fictional or realistic names)
    - location (string)
    - salaryRange (string, FORMAT: "MIN/MAX" e.g., "5000/8000". STRICTLY NUMBERS separated by '/'. DO NOT include currency symbols like '$' or words like 'k'.)
    - description (string)
    - requirements (array of strings)
    - responsibilities (array of strings)
    - employmentType (One of: 'Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship')
    - industry (string)
    - experienceLevel (One of: 'Entry', 'Mid', 'Senior', 'Director', 'Executive')
    - remote (boolean)
    `;

    try {
        const response = await generateCompletion(promptCommand, systemPrompt);

        let jsonStr = response;
        if (response.includes('\`\`\`json')) {
            jsonStr = response.split('\`\`\`json')[1].split('\`\`\`')[0];
        } else if (response.includes('\`\`\`')) {
            jsonStr = response.split('\`\`\`')[1].split('\`\`\`')[0];
        }

        const jobOffersData = JSON.parse(jsonStr.trim());

        if (!Array.isArray(jobOffersData)) {
            throw new Error("LLM did not return an array of job offers");
        }

        const savedJobs = [];
        for (const offer of jobOffersData) {
            console.log(`Saving job designed for user: ${userId}`);
            const newJob = new Job({
                ...offer,
                jobDestinedTo: userId,
                createdBy: 'AI'
            });
            await newJob.save();
            savedJobs.push(newJob);
        }

        return savedJobs;
    } catch (error) {
        console.error("Error generating or saving job offers:", error);
        throw error;
    }
};

export const getUserJobs = async (userId) => {
    try {
        const jobs = await Job.find({ applicants: userId });
        return jobs;
    } catch (error) {
        console.error("Error fetching user jobs:", error);
        throw error;
    }
};

export const getAllJobs = async () => {
    try {
        const jobs = await Job.find();
        return jobs;
    } catch (error) {
        console.error("Error fetching all jobs:", error);
        throw error;
    }
};

export const getJobById = async (jobId) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        return job;
    } catch (error) {
        console.error("Error fetching job by ID:", error);
        throw error;
    }
};

export const ApplyingToJob = async (jobId, userId) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        if (job.applicants.includes(userId)) {
            throw new Error('User has already applied to this job');
        }
        job.applicants.push(userId);
        await job.save();
        return job;
    } catch (error) {
        console.error("Error applying to job:", error);
        throw error;
    }
};

export const createJob = async (jobData) => {
    try {
        const newJob = new Job(jobData);
        await newJob.save();
        return newJob;
    } catch (error) {
        console.error("Error creating job:", error);
        throw error;
    }
};