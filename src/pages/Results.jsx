
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PaintableText from "../components/PaintableText";
import LabelButton from "../components/LabelButton";
import ReasonCloud from "../components/ReasonCloud";
import ReasonDetailModal from "../components/ReasonDetailModal";
import { User } from '@/api/entities';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils"; // Changed: Imported createPageUrl from utils

const emotions = ["Happy", "Sad", "Angry", "Afraid", "Surprised", "Disgusted"];

export default function Results() {
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [allPosters, setAllPosters] = useState([]);
  const [filteredPosters, setFilteredPosters] = useState([]);
  const [selectedReason, setSelectedReason] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const carouselContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (carouselContainerRef.current) {
        setContainerWidth(carouselContainerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (selectedEmotion === "") {
      setFilteredPosters(allPosters.filter(p => p.source === 'canvas'));
    } else {
      setFilteredPosters(allPosters.filter(p =>
        p.source === 'canvas' && p.emotion?.toLowerCase() === selectedEmotion.toLowerCase()
      ));
    }
    setCurrentIndex(0); // Reset to first item when filter changes
  }, [selectedEmotion, allPosters]);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      const userPosters = Array.isArray(user.posters) ? user.posters : [];
      setAllPosters(userPosters);
      setFilteredPosters(userPosters);
    } catch (error) {
      console.error("Error loading user data:", error);
      setAllPosters([]);
      setFilteredPosters([]);
    }
  };

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(prev => prev === emotion ? "" : emotion);
  };

  const handleResearchProcessClick = () => {
    navigate(createPageUrl("ResearchProcess"));
  };

  const uniqueReasons = useMemo(() => {
    const map = new Map();
    filteredPosters.forEach(p => {
      if (p.reason) {
        if (!map.has(p.reason)) {
          map.set(p.reason, { name: p.reason, posters: [] });
        }
        map.get(p.reason).posters.push(p);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredPosters]);

  const reasonTilts = useMemo(() => {
    const tilts = {};
    uniqueReasons.forEach(reason => {
      tilts[reason.name] = (Math.random() - 0.5) * 20;
    });
    return tilts;
  }, [uniqueReasons]);

  const itemsPerPage = 5; // Changed from 4 to 5

  const pages = useMemo(() => {
    const result = [];
    if (uniqueReasons.length === 0) return [];
    for (let i = 0; i < uniqueReasons.length; i += itemsPerPage) {
        result.push(uniqueReasons.slice(i, i + itemsPerPage));
    }
    return result;
  }, [uniqueReasons]);

  const maxIndex = Math.max(0, pages.length - 1);

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleDragEnd = (event, info) => {
    const pageChangeThreshold = containerWidth / 4;
    if (info.offset.x > pageChangeThreshold && currentIndex > 0) {
      handlePrevious();
    } else if (info.offset.x < -pageChangeThreshold && currentIndex < maxIndex) {
      handleNext();
    }
  };

  return (
    <div className="h-screen overflow-hidden pt-7 pb-16 px-6" style={{ backgroundColor: '#FCFAFA' }}>
      <div className="max-w-[95vw] mx-auto h-full flex flex-col relative">

        {/* Research Process Button */}
        <div className="absolute top-0 right-0 z-50 -translate-y-[15px]">
          <LabelButton
            label={"The\nresearch\nprocess"}
            onClick={handleResearchProcessClick}
            labelType="reason"
            useFlexLayout={true}
          />
        </div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex-shrink-0"
        >
          <div style={{ marginBottom: '-25px' }}>
            <PaintableText
              text="The result %"
              fontSize="70px"
              fontWeight="700"
              fontFamily="PT Serif, serif"
              className="leading-tight"
            />
          </div>
          <p className="text-[30px] text-black font-light max-w-4xl leading-relaxed mt-8">
            Discover insights about emotional patterns
          </p>
        </motion.div>

        {/* Emotion Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center flex-wrap gap-4 mb-12 flex-shrink-0"
        >
          {emotions.map((emotion, index) => (
            <LabelButton
              key={emotion}
              label={emotion}
              isSelected={selectedEmotion === emotion}
              onClick={() => handleEmotionSelect(emotion)}
              index={index}
              isInline={true}
              labelType="emotion"
            />
          ))}
        </motion.div>

        {/* Carousel Section - Made 20% bigger */}
        <div className="flex-grow flex items-center justify-center relative px-16">
          {uniqueReasons.length === 0 ? (
            <div className="text-center w-full">
              <p className="text-xl text-gray-500">No data available for this emotion.</p>
              <p className="text-gray-400 mt-2">Create some posters to see the results here.</p>
            </div>
          ) : (
            <>
              {/* Left Arrow */}
              {currentIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 z-10 p-4 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="w-8 h-8 text-gray-700" />
                </button>
              )}

              {/* Carousel Viewport */}
              <div ref={carouselContainerRef} className="overflow-hidden w-full h-[400px]" style={{ transform: 'scale(1.2)' }}>
                <motion.div
                  className="flex h-full"
                  animate={{ x: `-${currentIndex * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag={pages.length > 1 ? "x" : false}
                  dragElastic={pages.length > 1 ? 0.1 : 0}
                  onDragEnd={pages.length > 1 ? handleDragEnd : undefined}
                  style={{ cursor: pages.length > 1 ? "grab" : "default" }}
                  whileDrag={{ cursor: pages.length > 1 ? "grabbing" : "default" }}
                >
                  {pages.map((page, pageIndex) => (
                    <div key={pageIndex} className="flex-shrink-0 w-full h-full flex justify-center items-center gap-12">
                      {page.map(reason => (
                        <motion.div
                          key={reason.name}
                          initial={{ rotate: reasonTilts[reason.name] || 0 }}
                          animate={{
                            rotate: [
                              (reasonTilts[reason.name] || 0) - 5,
                              (reasonTilts[reason.name] || 0) + 5,
                              (reasonTilts[reason.name] || 0) - 5
                            ]
                          }}
                          transition={{
                            duration: 5 + Math.random() * 3,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "mirror"
                          }}
                          whileHover={{ scale: 1.05, rotate: (reasonTilts[reason.name] || 0) }}
                          style={{ transformOrigin: 'top center' }}
                        >
                          <ReasonCloud
                            reason={reason}
                            onSelect={setSelectedReason}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right Arrow */}
              {currentIndex < maxIndex && (
                <button
                  onClick={handleNext}
                  className="absolute right-0 z-10 p-4 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="w-8 h-8 text-gray-700" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Dots Indicator - Outside the scaled container */}
        {pages.length > 1 && (
          <div className="flex justify-center mt-8 mb-4">
            <div className="flex gap-4">
              {pages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    index === currentIndex ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reason Detail Modal */}
        {selectedReason && (
          <ReasonDetailModal
            reason={selectedReason}
            posters={selectedReason.posters}
            onClose={() => setSelectedReason(null)}
          />
        )}
      </div>
    </div>
  );
}
