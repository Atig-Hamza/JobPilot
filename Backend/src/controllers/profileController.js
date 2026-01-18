import { getProfileByUserId, createOrUpdateProfile } from "../services/profileService.js";
import catchAsync from "../utils/catchAsync.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import { generateCompletion } from "../services/LLMService.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const extractPdfText = async (buffer) => {
    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer)
    });

    const pdf = await loadingTask.promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
    }

    return text;
};

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "cvs", resource_type: "auto" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

export const analyzeCV = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            status: "fail",
            message: "No file uploaded"
        });
    }

    let text = "";

    try {
        if (req.file.mimetype === "application/pdf") {
            text = await extractPdfText(req.file.buffer);
        }
        else if (
            req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            req.file.mimetype === "application/msword"
        ) {
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            text = result.value;
        }
        else {
            text = req.file.buffer.toString("utf-8");
        }

        if (!text || !text.trim()) {
            throw new Error("No text extracted from document");
        }
    } catch (err) {
        console.error("Text extraction failed:", err);
        return res.status(500).json({
            status: "error",
            message: `Failed to extract text from file: ${err.message}`
        });
    }

    let uploadResult;
    try {
        uploadResult = await uploadToCloudinary(req.file.buffer);
    } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res.status(500).json({
            status: "error",
            message: "Failed to upload CV"
        });
    }

    const systemPrompt = `
You are an expert CV parser. Extract the following information from the CV text and return it in strict JSON format:
{
  "bio": "Short professional summary (max 300 chars)",
  "phoneNumber": "Phone number found in contact details",
  "contactEmail": "Email address found in contact details",
  "socialLinks": [
    { "platform": "Platform Name (e.g. LinkedIn, GitHub, Website)", "url": "URL" }
  ],
  "languages": [
    { "language": "Language Name", "proficiency": "Native/Fluent/Advanced/Intermediate/Basic" }
  ],
  "certificates": [
    { "name": "Certificate Name", "issuer": "Issuing Organization", "date": "Date Obtained" }
  ],
  "skills": ["Array", "of", "skills"],
  "experience": [
    { "role": "Job Title", "company": "Company Name", "startDate": "YYYY-MM-DD (approx)", "endDate": "YYYY-MM-DD or Present", "description": "Short description" }
  ],
  "education": [
    { "degree": "Degree Name", "institution": "University Name", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }
  ]
}
Do not include markdown. Return raw JSON only.
`;

    let parsedData = {};

    try {
        const llmResponse = await generateCompletion(
            text.substring(0, 10000),
            systemPrompt
        );

        const cleanJson = llmResponse
            .replace(/```json|```/g, "")
            .trim();

        parsedData = JSON.parse(cleanJson);
    } catch (err) {
        console.error("LLM parsing failed:", err);
        parsedData = { bio: "Failed to parse AI response" };
    }

    parsedData.cv = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url
    };

    return res.status(200).json({
        status: "success",
        data: parsedData
    });
});

export const getProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);

    if (!profile) {
        return res.status(404).json({
            status: "fail",
            message: "Profile not found"
        });
    }

    res.status(200).json({
        status: "success",
        data: { profile }
    });
});

export const upsertProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const profileData = req.body;

    const profile = await createOrUpdateProfile(userId, profileData);

    res.status(200).json({
        status: "success",
        data: { profile }
    });
});
