const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse")

const storage = multer.memoryStorage();
const upload = multer({ storage });



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

    // Run ATS Scoring Algorithms
    const keywordScore = keywordMatching(resumeText, jobDescription);
    const tfidfScore = tfidfMatching(resumeText, jobDescription);
    const semanticScore = semanticSimilarity(resumeText, jobDescription);

    res.json({
        keywordScore,
        tfidfScore,
        semanticScore
    });
});

// Dummy Scoring Algorithms (To Be Improved)
function keywordMatching(resume, job) {
    const resumeWords = resume.toLowerCase().split(/\s+/);
    const jobWords = job.toLowerCase().split(/\s+/);
    const matchCount = resumeWords.filter(word => jobWords.includes(word)).length;
    return Math.round((matchCount / jobWords.length) * 100);
}

function tfidfMatching(resume, job) {
    return Math.random() * 100; // Placeholder for TF-IDF logic
}

function semanticSimilarity(resume, job) {
    return Math.random() * 100; // Placeholder for AI-based semantic search
}

module.exports = router;