"use client"

import React, { useState, useEffect } from "react"
import { Box } from "@mui/material"

const AnimatedDots = ({ visible }) => {
  const [dots, setDots] = useState([])

  useEffect(() => {
    // Create 50 random dots
    const newDots = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 2, // Size between 2-8px
      x: Math.random() * 100, // Random position
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10, // Animation duration between 10-30s
      delay: Math.random() * 5, // Random delay for animation start
    }))

    setDots(newDots)
  }, [])

  if (!visible) return null

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <style jsx global>{`
        @keyframes floatAround {
          0% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          25% {
            transform: translate(100px, 50px) rotate(90deg);
          }
          50% {
            transform: translate(50px, 100px) rotate(180deg);
          }
          75% {
            transform: translate(-50px, 50px) rotate(270deg);
          }
          100% {
            transform: translate(0px, 0px) rotate(360deg);
          }
        }
      `}</style>

      {dots.map((dot) => (
        <Box
          key={dot.id}
          sx={{
            position: "absolute",
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            borderRadius: "50%",
            backgroundColor: "rgba(144, 202, 249, 0.3)", // Using primary color from theme with opacity
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            animation: `floatAround ${dot.duration}s infinite ease-in-out ${dot.delay}s`,
          }}
        />
      ))}
    </Box>
  )
}

export default AnimatedDots

