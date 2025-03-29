const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const natural = require("natural");
const { Pool } = require("pg");
const { spawn } = require("child_process");
const axios = require("axios");
require("dotenv").config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

let pool;

function getPool() {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("❌ DATABASE_URL is missing!");
        }

        pool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
        });
    }

    return pool;
}



router.post("/explain", upload.single("resume"), async (req, res) => {
    const { jobDescription, semanticScore, tfidfScore, keywordScore } = req.body;

    if (!req.file || !jobDescription || semanticScore === undefined || tfidfScore === undefined || keywordScore === undefined) {
        return res.status(400).json({ error: "Resume, job description, and scores are required!" });
    }

    let resumeText = "";

    if (req.file.mimetype === "application/pdf") {
        try {
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text;
        } catch (err) {
            return res.status(500).json({ error: "Error processing PDF file." });
        }
    } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf-8");
    } else {
        return res.status(400).json({ error: "Only PDF and TXT resumes are supported!" });
    }

    const explanation = await generateExplanation(jobDescription, resumeText, semanticScore, tfidfScore, keywordScore);
    res.json({ explanation });
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function generateExplanation(jobDescription, resumeText, semanticScore, tfidfScore, keywordScore) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing!");
            return "API key is missing.";
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `You are an AI Resume Reviewer. After using the amazing tool: Pocket-ATS, the user received the following scores out of 100:

keywordScore (checking if words match between the resume and job description): ${keywordScore}  
tfidfScore (using a TF-IDF system to analyze natural language similarity): ${tfidfScore}  
semanticScore (LLMs assessing candidate relevance): ${semanticScore}  

These scores were determined based on the following job description and resume:  
Job Description: ${jobDescription}  
Resume: ${resumeText}  

Provide an in-depth explanation of why these scores were assigned and suggest specific, detailed improvements to the resume text to increase the scores. Use first-person perspective and get straight to the point without an introduction. Format everything in HTML with appropriate line breaks. Ensure there is no title in the response, and maintain consistent formatting for every output.

The response should follow this format exactly:

<pre>
<strong>Keyword Score Analysis:</strong><br>
Your keyword score is ${keywordScore}. This score is based on the number of exact keyword matches between your resume and the job description. <br>
<strong>Issues:</strong><br>
- Missing key phrases such as "project management" and "data analytics".<br>
- Lack of specific technical terms like "SQL", "Python", and "cloud computing".<br>
<strong>Improvements:</strong><br>
- Add relevant keywords directly from the job description where applicable.<br>
- Ensure job titles and responsibilities align with industry-standard terminology.<br>

<strong>TF-IDF Score Analysis:</strong><br>
Your TF-IDF score is ${tfidfScore}. This measures how relevant the overall wording of your resume is compared to the job description beyond just exact matches.<br>
<strong>Issues:</strong><br>
- The wording of certain sections is too general, reducing relevance.<br>
- Key phrases are present but not in meaningful context.<br>
<strong>Improvements:</strong><br>
- Rewrite bullet points to better align with the language of the job description.<br>
- Use industry-specific jargon to improve contextual alignment.<br>

<strong>Semantic Score Analysis:</strong><br>
Your semantic score is ${semanticScore}. This score reflects how well your resume aligns with the job description based on AI-powered meaning analysis.<br>
<strong>Issues:</strong><br>
- Some experience descriptions lack measurable impact and clarity.<br>
- Skills section does not sufficiently demonstrate proficiency.<br>
<strong>Improvements:</strong><br>
- Use quantifiable achievements in your experience section (e.g., "Increased efficiency by 30% by automating workflows").<br>
- Highlight practical applications of your skills instead of just listing them.<br>

<strong>Final Recommendations:</strong><br>
By implementing these changes, your resume will better align with the job description and improve your overall ATS score.<br>
</pre>`;



        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log(text);
        return text;
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        return "Error generating explanation.";
    }
}







// API Endpoint: Analyze Resume Against Job Description
router.post("/analyze", upload.single("resume"), async (req, res) => {
    const { jobDescription } = req.body;
    if (!req.file || !jobDescription) {
        return res.status(400).json({ error: "Resume and job description are required!" });
    }
    
    let resumeText = "";

    if (req.file.mimetype === "application/pdf") {
        try {
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text;
        } catch (err) {
            return res.status(500).json({ error: "Error processing PDF file." });
        }
    } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf-8");
    } else {
        return res.status(400).json({ error: "Only PDF and TXT resumes are supported!" });
    }

    try {
        // Assume resume is uploaded to a storage service (Supabase Storage, S3, Firebase, etc.)
        const resumeFileName = req.file.originalname; // Original filename
        const resumeURL = `https://your-storage-service.com/resumes/${resumeFileName}`; // Adjust based on your storage

        // Compute ATS Scoring Algorithms
        const semanticScore = await computeSemanticSimilarity(resumeText, jobDescription);
        const keywordScore = keywordMatching(resumeText, jobDescription);
        const tfidfScore = tfidfScoring(resumeText, jobDescription);

        // Store data in PostgreSQL (without embeddings)
        await getPool().query(
            `INSERT INTO ats_results 
            (job_description, resume_text, resume_url, keyword_score, tfidf_score, semantic_score) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                jobDescription, 
                resumeText, 
                resumeURL, // Link to the uploaded resume
                keywordScore, 
                tfidfScore, 
                semanticScore
            ]
        );

        res.json({
            resumeURL,
            keywordScore,
            tfidfScore,
            semanticScore
        });

    } catch (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Database error while storing results." });
    }
});



async function computeSemanticSimilarity(resumeText, jobDescription) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing!");
            return 0;
        }

        // ✅ FIXED: Use Correct Model Name
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        // ✅ FIXED: Proper Prompt
        const prompt = `You are an AI that compares resumes and job descriptions for similarity. 
        Rate the similarity from 0 (no match) to 100 (perfect match). 

        Job Description: ${jobDescription}

        Resume: ${resumeText}

        How similar are they? Provide only a single numeric score from 0-100.`;

        // ✅ FIXED: Proper Response Handling
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log("🔍 Gemini API Response:", text); // Debugging Log

        // ✅ FIXED: Properly Extract Numeric Score
        const similarityScoreMatch = text.match(/\d+/);
        if (similarityScoreMatch) {
            const similarityScore = parseInt(similarityScoreMatch[0]);
            console.log("✅ Gemini Semantic Similarity Score:", similarityScore);
            return Math.max(0, Math.min(similarityScore, 100)); // Ensure score is between 0-100
        } else {
            console.error("❌ Could not extract similarity score from Gemini response:", text);
            return 0;
        }
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        return 0;
    }
}



// Basic Keyword Matching
function keywordMatching(resume, job) {
    const resumeWords = resume.toLowerCase().split(/\s+/);
    const jobWords = job.toLowerCase().split(/\s+/);
    const matchCount = resumeWords.filter(word => jobWords.includes(word)).length;
    const final = Math.round((matchCount / jobWords.length) * 100);
    if (final>100){return 99}
    else{return final}
}

// TF-IDF Scoring
function tfidfScoring(resume, job) {
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    tfidf.addDocument(job.toLowerCase());
    tfidf.addDocument(resume.toLowerCase());

    let totalScore = 0;
    let keywords = job.toLowerCase().split(/\s+/);

    keywords.forEach(word => {
        tfidf.tfidfs(word, (docIndex, measure) => {
            if (docIndex === 1) { // Resume is the second document
                totalScore += measure;
            }
        });
    });

    const final = Math.round((totalScore / keywords.length) * 100);
    if (final>100){return 99}
    else{return final}
}














module.exports = router;
