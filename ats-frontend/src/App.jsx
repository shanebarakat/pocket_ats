import React, { useState } from 'react';
import { 
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Toolbar,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  styled
} from '@mui/material';
import { FileUp, Send, FileCheck, Info } from 'lucide-react';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [explanation, setExplanation] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setResume(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) return alert('Please upload a resume!');

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch('http://localhost:5000/api/ats/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults(data);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGetExplanation = async (e) => {
    e.preventDefault();

    if (!resume) {
      alert('Please upload a resume!');
      return;
    }
    // Use FormData so that the resume file is properly sent
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDescription', jobDescription);
    // Append the scores too
    formData.append('tfidfScore', results?.tfidfScore);
    formData.append('keywordScore', results?.keywordScore);
    formData.append('semanticScore', results?.semanticScore);

    try {
      const response = await fetch('http://localhost:5000/api/ats/explain', {
        method: 'POST',
        body: formData, // Let the browser set the multipart boundary automatically
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // Set the explanation from the API response.
      setExplanation(data.explanation);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getColor = (score) => {
    if (score >= 75) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  const renderResultBox = (title, score) => (
    <Box sx={{ flex: 1, textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2, m: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <Typography variant="h4" sx={{ color: getColor(score) }}>{score}</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>Good Score: 75+</Typography>
    </Box>
  );

  const renderExplanationBox = (explanationText) => (
    <Box sx={{ mt: 4, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
      <Typography variant="body1">{explanationText}</Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ 
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Toolbar>
          <Container maxWidth="lg">
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
              Pocket ATS
            </Typography>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h2" component="h1" sx={{ 
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: '2.5rem', md: '3.75rem' }
          }}>
            Pocket ATS
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h5" color="text.secondary">
              Will Your Resume Pass?
            </Typography>
            <IconButton onClick={handleClickOpen} sx={{ ml: 1 }}>
              <Info />
            </IconButton>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Paper
            elevation={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              p: 5,
              mb: 4,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: isDragging ? 'primary.main' : resume ? 'success.main' : 'grey.300',
              bgcolor: (isDragging || resume) ? 'grey.50' : 'transparent',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' }
            }}
          >
            <Box component="label" htmlFor="resume-upload">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {resume ? (
                  <>
                    <FileCheck size={48} color="#2e7d32" style={{ marginBottom: 16 }} />
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                      {resume.name}
                    </Typography>
                  </>
                ) : (
                  <>
                    <FileUp size={48} color="#757575" style={{ marginBottom: 16 }} />
                    <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
                      Drag and drop your resume here, or click to select
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supports PDF, DOC, DOCX
                    </Typography>
                  </>
                )}
              </Box>
              <VisuallyHiddenInput id="resume-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            </Box>
          </Paper>

          <TextField
            fullWidth
            multiline
            rows={6}
            label="Job Description"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            sx={{ mb: 4 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Send />}
              sx={{ borderRadius: 28, px: 4, py: 1.5, textTransform: 'none' }}
            >
              Analyze Resume
            </Button>
          </Box>
        </form>

        {results && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 8 }}>
            {renderResultBox('Keyword Matching', results.keywordScore)}
            {renderResultBox('TF-IDF', results.tfidfScore)}
            {renderResultBox('Semantic Search', results.semanticScore)}
            <Button
              type="button"
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={handleGetExplanation}
              sx={{ borderRadius: 28, px: 4, py: 1.5, textTransform: 'none', m: 1 }}
            >
              Improve with AI
            </Button>
          </Box>
        )}

        {explanation && (
          <Box sx={{ mt: 8 }}>
            {renderExplanationBox(explanation)}
          </Box>
        )}
      </Container>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>About Pocket ATS</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Pocket ATS</strong> helps you analyze how well your resume matches a job description using three advanced methods used in Applicant Tracking Systems (ATS).
            <br /><br />
            <strong>🔍 How It Works</strong><br />
            <strong>1️⃣ Keyword Matching</strong> – Finds exact words from the job description in your resume.<br />
            ✅ Used by <strong>Workday, Greenhouse, Taleo</strong>.<br />
            ❌ Can miss synonyms and be tricked by keyword stuffing.
            <br /><br />
            <strong>2️⃣ TF-IDF (Term Frequency-Inverse Document Frequency)</strong> – Identifies key terms based on importance.<br />
            ✅ Used by <strong>Lever, iCIMS</strong>.<br />
            ❌ Still lacks deep understanding of meaning.
            <br /><br />
            <strong>3️⃣ Semantic Search (AI Matching)</strong> – Uses AI to understand meaning & intent, not just words.<br />
            ✅ Used by <strong>LinkedIn Recruiter, HireVue, Google Cloud Talent</strong>.<br />
            ❌ More computationally expensive but highly accurate.
            <br /><br />
            <strong>Pocket ATS combines all three methods</strong> to give you a comprehensive match score and help optimize your resume!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
