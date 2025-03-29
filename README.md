# 🚀 Pocket ATS (pocket-ats.live)

Pocket ATS is an AI-powered web application that analyzes resumes against job descriptions to determine how effectively they match. It leverages three different algorithms used by real-world Applicant Tracking Systems (ATS), helping users optimize resumes for better hiring outcomes.




https://github.com/user-attachments/assets/e4ea46ea-803e-42db-a6c7-428e46379567


## 📌 Overview

Pocket ATS processes resumes through three distinct algorithms:

- **Keyword Matching**: Quickly identifies exact word matches between your resume and the job description.  
- **TF-IDF Scoring**: Weighs terms based on their frequency and importance, highlighting key skills.  
- **Semantic Search (Gemini AI)**: Utilizes AI to understand the underlying meaning and context, evaluating matches beyond simple keywords.

By combining these methods, Pocket ATS provides comprehensive insights into resume effectiveness.


## 🌐 Frontend

- Built with **React** and styled with **Material UI** for a modern, intuitive user interface.
- Supports drag-and-drop file uploads for PDFs and text files.
- Clearly displays ATS scores from each algorithm separately.

## ⚙️ Backend

- Powered by **Node.js and Express** for efficient API handling.
- Uses **`pdf-parse`** to extract text from resumes.
- Integrates **Google's Gemini API** for advanced semantic comparison.
- Stores job descriptions, resumes, and scoring results securely in a **Supabase PostgreSQL database**.
