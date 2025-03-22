"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slide,
  styled,
  useMediaQuery,
  Fade,
  Grow,
  CircularProgress,
  Chip,
  Divider,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material"
import { FileUp, Send, FileCheck, Info, ArrowUp, DoorClosedIcon as Close } from "lucide-react"
import { motion } from "framer-motion"
import AnimatedDots from "./animated-dots"

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#ce93d8",
    },
    background: {
      default: "#000000",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    success: {
      main: "#66bb6a",
    },
    warning: {
      main: "#ffa726",
    },
    error: {
      main: "#f44336",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          overflow: "hidden auto",
          width: "100vw",
          height: "100vh",
          boxSizing: "border-box",
          "& #root": {
            width: "100%",
            height: "100%",
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          "@media (max-width:600px)": {
            padding: "0 12px",
          },
        },
      },
    },
  },
})

// Interactive Grid Background Component
const GridBackground = () => {
  const canvasRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const animationFrameId = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    // For touch devices
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        setMousePosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Grid properties
    const gridSize = 30
    const dotSize = 1.5
    const maxDistortion = 20
    const influenceRadius = 250

    const drawGrid = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.fillStyle = "rgba(100, 100, 100, 0.3)"

      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          // Calculate distance from mouse
          const dx = x - mousePosition.x
          const dy = y - mousePosition.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Apply distortion based on distance
          let distortionFactor = 0
          if (distance < influenceRadius) {
            distortionFactor = (1 - distance / influenceRadius) * maxDistortion
          }

          // Calculate distorted position
          const angle = Math.atan2(dy, dx)
          const distortedX = x + Math.cos(angle) * distortionFactor
          const distortedY = y + Math.sin(angle) * distortionFactor

          // Draw dot
          ctx.beginPath()
          ctx.arc(distortedX, distortedY, dotSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animationFrameId.current = requestAnimationFrame(drawGrid)
    }

    drawGrid()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [mousePosition, dimensions])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  )
}

// Styled components
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
})

const AnimatedBox = styled(motion.div)({
  width: "100%",
})

const StyledPaper = styled(Paper)(({ theme }) => ({
  transition: "all 0.3s ease",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    boxShadow: theme.shadows[6],
  },
}))

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 28,
  padding: "10px 24px",
  textTransform: "none",
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[8],
  },
}))

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function App() {
  const [started, setStarted] = useState(false)
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState(null)
  const [explanation, setExplanation] = useState("")
  const [loading, setLoading] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [animatedDotsVisible, setAnimatedDotsVisible] = useState(true)

  const theme = darkTheme
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  // Check scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Handle Get Started button click
  const handleGetStarted = () => {
    setAnimatedDotsVisible(false)
    setStarted(true)
  }

  // LANDING PAGE: When not started show a large title with stats and a get started btn.
  const renderLanding = () => (
    <Fade in={!started} timeout={800}>
      <Box sx={{ textAlign: "center", mt: 1, px: isMobile ? 2 : 0, width: "100%", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography
            variant={isMobile ? "h3" : "h1"}
            sx={{ fontWeight: 700, mb: 1, color: "text.primary", mt: isMobile ? 4 : 0 }}
          >
            Pocket ATS
          </Typography>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 500, mb: 4, color: "text.secondary" }}>
            The Open Source Resume Improvement System
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: "flex",
            flexDirection: isTablet ? "column" : "row",
            justifyContent: "center",
            mb: 4,
            gap: 2,
            width: "100%",
          }}
        >
          {[
            { count: "150+", label: "Resumes Analyzed" },
            { count: "100+", label: "Resumes Improved with AI" },
            { count: "50%", label: "Interview Selection Probability" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              style={{ width: isTablet ? "100%" : "auto", flex: isTablet ? "0 0 auto" : "1" }}
            >
              <StyledPaper
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  bgcolor: "background.paper",
                  width: "100%",
                  backdropFilter: "blur(10px)",
                  background: "rgba(30, 30, 30, 0.8)",
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 600, color: "primary.main" }}>
                  {stat.count}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </StyledPaper>
            </motion.div>
          ))}
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              justifyContent: "center",
              mt: 10,
              width: "100%",
            }}
          >
            <StyledButton
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              color="primary"
              fullWidth={isMobile}
            >
              Get Started
            </StyledButton>
            <StyledButton
              variant="outlined"
              size="large"
              onClick={handleClickOpen}
              startIcon={<Info />}
              fullWidth={isMobile}
            >
              How It Works
            </StyledButton>
          </Box>
        </motion.div>
      </Box>
    </Fade>
  )

  // FORM HEADER when started is true (title shrinks and moves higher)
  const renderHeader = () => (
    <Fade in={started} timeout={800}>
      <Box sx={{ textAlign: "center", mb: 4, width: "100%", position: "relative", zIndex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: "text.primary", mt: isMobile ? 5 : 0 }}>
          Pocket ATS
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Will Your Resume Pass?
        </Typography>
      </Box>
    </Fade>
  )

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setResume(e.target.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.[0]) {
      setResume(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!resume) return alert("Please upload a resume!")

    setLoading(true)
    const formData = new FormData()
    formData.append("resume", resume)
    formData.append("jobDescription", jobDescription)

    try {
      const response = await fetch("http://localhost:5000/api/ats/analyze", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      setResults(data)
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetExplanation = async (e) => {
    e.preventDefault()

    if (!resume) {
      alert("Please upload a resume!")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("resume", resume)
    formData.append("jobDescription", jobDescription)
    formData.append("tfidfScore", results?.tfidfScore)
    formData.append("keywordScore", results?.keywordScore)
    formData.append("semanticScore", results?.semanticScore)

    try {
      const response = await fetch("http://localhost:5000/api/ats/explain", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setExplanation(data.explanation)
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const getColor = (score) => {
    if (score >= 75) return theme.palette.success.main
    if (score >= 50) return theme.palette.warning.main
    return theme.palette.error.main
  }

  const getScoreLabel = (score) => {
    if (score >= 75) return "Excellent"
    if (score >= 50) return "Good"
    return "Needs Improvement"
  }

  const renderResultBox = (title, score, index) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      style={{
        width: isMobile ? "100%" : "auto",
        flex: isMobile ? "0 0 auto" : "1",
        marginBottom: isMobile ? "16px" : "0",
      }}
    >
      <StyledPaper
        sx={{
          flex: 1,
          textAlign: "center",
          p: 3,
          m: isMobile ? 0 : 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "180px",
          position: "relative",
          overflow: "hidden",
          backdropFilter: "blur(10px)",
          background: "rgba(30, 30, 30, 0.8)",
          width: "100%",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "4px",
            bgcolor: getColor(score),
          }}
        />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: "text.primary" }}>
          {title}
        </Typography>

        <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
          <CircularProgress
            variant="determinate"
            value={score}
            size={80}
            thickness={4}
            sx={{ color: getColor(score) }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h5" component="div" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {score}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={getScoreLabel(score)}
          sx={{
            bgcolor: getColor(score) + "20",
            color: getColor(score),
            fontWeight: 500,
          }}
        />
      </StyledPaper>
    </motion.div>
  )

  const renderExplanationBox = (explanationText) => (
    <Grow in={!!explanationText} timeout={800}>
      <StyledPaper
        sx={{
          mt: 4,
          p: 3,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          backdropFilter: "blur(10px)",
          background: "rgba(30, 30, 30, 0.8)",
          width: "100%",
          maxHeight: "500px", // Constrains the box height
          overflowY: "auto", // Enables scrolling if content is too tall
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: "text.primary" }}>
          AI Recommendations
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography
          variant="body1"
          component="div"
          sx={{
            fontFamily: "monospace",
            color: "text.primary",
            whiteSpace: "pre-wrap", // Preserves line breaks while wrapping text
            wordBreak: "break-word", // Breaks long words to prevent horizontal overflow
            overflowWrap: "break-word", // Ensures text wraps properly
            lineHeight: 1.6,
            "& strong": { color: "primary.main" },
          }}
          // Removes <pre> tags and preserves new lines
          dangerouslySetInnerHTML={{
            __html: explanationText.replace(/<pre>/g, "").replace(/<\/pre>/g, ""),
          }}
        />
      </StyledPaper>
    </Grow>
  )

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
          color: "text.primary",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Interactive Grid Background */}
        <GridBackground />

        {/* Animated Dots Background */}
        <AnimatedDots visible={animatedDotsVisible} />

        <Container
          maxWidth="md"
          sx={{
            pt: started ? 4 : 12,
            pb: 8,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            px: { xs: 2, sm: 3 },
            position: "relative",
            zIndex: 1,
          }}
        >
          {!started ? (
            renderLanding()
          ) : (
            <AnimatedBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ width: "100%" }}
            >
              {renderHeader()}
              {!results ? (
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                  <StyledPaper
                    elevation={2}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                      p: { xs: 3, sm: 5 },
                      mb: 4,
                      textAlign: "center",
                      border: "2px dashed",
                      borderColor: isDragging ? "primary.main" : resume ? "success.main" : "grey.600",
                      backdropFilter: "blur(10px)",
                      background: "rgba(30, 30, 30, 0.8)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main" },
                      width: "100%",
                    }}
                  >
                    <Box component="label" htmlFor="resume-upload">
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {resume ? (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          >
                            <FileCheck size={48} color={theme.palette.success.main} style={{ marginBottom: 16 }} />
                            <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                              {resume.name}
                            </Typography>
                            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: "block" }}>
                              Resume uploaded successfully
                            </Typography>
                          </motion.div>
                        ) : (
                          <>
                            <motion.div
                              animate={{ y: [0, -10, 0] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                            >
                              <FileUp size={48} color={theme.palette.text.secondary} style={{ marginBottom: 16 }} />
                            </motion.div>
                            <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
                              Drag and drop your resume here, or click to select
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Supports PDF, DOC, DOCX
                            </Typography>
                          </>
                        )}
                      </Box>
                      <VisuallyHiddenInput
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </Box>
                  </StyledPaper>

                  <StyledPaper
                    elevation={2}
                    sx={{
                      p: 3,
                      mb: 4,
                      backdropFilter: "blur(10px)",
                      background: "rgba(30, 30, 30, 0.8)",
                      width: "100%",
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Job Description"
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 2 },
                      }}
                    />
                  </StyledPaper>

                  <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                    <StyledButton
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      sx={{ width: isMobile ? "100%" : "auto" }}
                    >
                      {loading ? "Analyzing..." : "Analyze Resume"}
                    </StyledButton>
                  </Box>
                </form>
              ) : null}

              {results && (
                <Box sx={{ mt: 8, width: "100%" }}>
                  <Typography variant="h5" sx={{ mb: 3, textAlign: "center", fontWeight: 600, color: "text.primary" }}>
                    Analysis Results
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      flexDirection: isMobile ? "column" : "row",
                      width: "100%",
                      gap: isMobile ? 2 : 1,
                    }}
                  >
                    {renderResultBox("Keyword Matching", results.keywordScore, 0)}
                    {renderResultBox("TF-IDF", results.tfidfScore, 1)}
                    {renderResultBox("Semantic Search", results.semanticScore, 2)}
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4, width: "100%" }}>
                    <StyledButton
                      type="button"
                      variant="contained"
                      size="large"
                      color="secondary"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      onClick={handleGetExplanation}
                      sx={{ width: isMobile ? "100%" : "auto" }}
                    >
                      {loading ? "Processing..." : "Improve with AI"}
                    </StyledButton>
                  </Box>
                </Box>
              )}

              {explanation && renderExplanationBox(explanation)}
            </AnimatedBox>
          )}
        </Container>

        <Dialog
          open={open}
          onClose={handleClose}
          TransitionComponent={Transition}
          fullScreen={isMobile}
          maxWidth="md"
          PaperProps={{
            sx: {
              bgcolor: "background.paper",
              margin: isMobile ? 0 : 2,
              width: isMobile ? "100%" : "auto",
              maxHeight: isMobile ? "100%" : "calc(100% - 64px)",
              borderRadius: isMobile ? 0 : 4,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.dark",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">About Pocket ATS</Typography>
            <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3, bgcolor: "background.paper" }}>
            <DialogContentText component="div" sx={{ p: 2, color: "text.primary" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
                Pocket ATS helps you analyze how well your resume matches a job description
              </Typography>

              <Typography variant="body1" sx={{ mb: 3, color: "text.primary" }}>
                We use three advanced methods used in Applicant Tracking Systems (ATS) to give you the most accurate
                assessment.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                🔍 How It Works
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                  1️⃣ Keyword Matching
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: "text.primary" }}>
                  Finds exact words from the job description in your resume.
                </Typography>
                <Typography variant="body2" sx={{ color: "success.main", mb: 0.5 }}>
                  ✅ Used by <strong>Workday, Greenhouse, Taleo</strong>.
                </Typography>
                <Typography variant="body2" sx={{ color: "error.main" }}>
                  ❌ Can miss synonyms and be tricked by keyword stuffing.
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                  2️⃣ TF-IDF (Term Frequency-Inverse Document Frequency)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: "text.primary" }}>
                  Identifies key terms based on importance.
                </Typography>
                <Typography variant="body2" sx={{ color: "success.main", mb: 0.5 }}>
                  ✅ Used by <strong>Lever, iCIMS</strong>.
                </Typography>
                <Typography variant="body2" sx={{ color: "error.main" }}>
                  ❌ Still lacks deep understanding of meaning.
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                  3️⃣ Semantic Search (AI Matching)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: "text.primary" }}>
                  Uses AI to understand meaning & intent, not just words.
                </Typography>
                <Typography variant="body2" sx={{ color: "success.main", mb: 0.5 }}>
                  ✅ Used by <strong>LinkedIn Recruiter, HireVue, Google Cloud Talent</strong>.
                </Typography>
                <Typography variant="body2" sx={{ color: "error.main" }}>
                  ❌ More computationally expensive but highly accurate.
                </Typography>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  bgcolor: "primary.dark",
                  color: "primary.contrastText",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                Pocket ATS combines all three methods to give you a comprehensive match score and help optimize your
                resume!
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: "background.paper" }}>
            <Button onClick={handleClose} color="primary" variant="contained" fullWidth={isMobile}>
              Got it
            </Button>
          </DialogActions>
        </Dialog>

        {/* Scroll to top button */}
        <Fade in={showScrollTop}>
          <Box
            onClick={scrollToTop}
            sx={{
              position: "fixed",
              bottom: 20,
              right: 20,
              zIndex: 99,
              cursor: "pointer",
              bgcolor: "primary.main",
              color: "white",
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 6,
              },
            }}
          >
            <ArrowUp />
          </Box>
        </Fade>

        <Box
          component="footer"
          sx={{
            textAlign: "center",
            mt: "auto",
            bgcolor: "grey.900",
            borderTop: "1px solid",
            borderColor: "grey.800",
            py: 2,
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary">
              Built by Shane Barakat 2025 | Check out the code here 🙂{" "}
              <a href="https://github.com/shanebarakat/pocket_ats" style={{ color: "#90caf9" }}>
                Github
              </a>
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App

