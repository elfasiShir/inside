
import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PresentationScreen from "../components/PresentationScreen";
import HeadsUpMenu from "../components/HeadsUpMenu";
import { ColorProvider } from "../components/ColorContext";

export default function Layout({ children, currentPageName }) {
  const [showPresentation, setShowPresentation] = useState(() => !sessionStorage.getItem('presentationShown'));
  const navigate = useNavigate();

  const handlePresentationComplete = () => {
    setShowPresentation(false);
    sessionStorage.setItem('presentationShown', 'true');
    navigate(createPageUrl("About"));
  };

  return (
    <ColorProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#FCFAFA' }}>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap');
            
            * {
              font-family: 'PT Serif', serif;
            }

            .font-inter {
              font-family: 'Inter', sans-serif;
            }

            body, html {
              cursor: auto;
              background-color: #FCFAFA;
            }
          `}
        </style>
        
        {/* Presentation Screen */}
        <AnimatePresence>
          {showPresentation && (
            <PresentationScreen onComplete={handlePresentationComplete} />
          )}
        </AnimatePresence>

        {/* Navigation Bar */}
        {!showPresentation && <HeadsUpMenu />}

        {/* Main Content */}
        {!showPresentation && (
          <main className="relative">
            {children}
          </main>
        )}
      </div>
    </ColorProvider>
  );
}
