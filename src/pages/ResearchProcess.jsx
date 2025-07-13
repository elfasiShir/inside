
import React from 'react';
import { motion } from 'framer-motion';
import PaintableText from '../components/PaintableText';
// Removed LabelButton import as it's no longer used

export default function ResearchProcess() {
  const handleLinkToTool = () => {
    window.open('https://editor.p5js.org/liran5832/full/XfR2DqncY', '_blank');
  };

  return (
    <div className="h-screen overflow-hidden pt-7 pb-12 px-6" style={{ backgroundColor: '#FCFAFA' }}>
      <div className="max-w-[90vw] mx-auto h-full flex flex-col">
        
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex-shrink-0"
        >
          <div style={{ marginBottom: '-25px' }}>
            <PaintableText
              text={"The research\nprocess"}
              fontSize="70px"
              fontWeight="700"
              fontFamily="PT Serif, serif"
              className="leading-tight"
              lineSpacing={-25}
            />
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-12 flex-grow"
        >
          {/* Left Side - Text and Previous Project */}
          <div className="w-[30%] flex flex-col justify-between">
            <div>
              <div className="text-lg leading-relaxed text-gray-800 space-y-4 mb-6">
                <p>
                  At the beginning of the research, <strong className="font-bold">I set out to explore how people perceive things differently through visual form</strong>, and to show that everyone thinks and sees the world in their own way. Initially, <strong className="font-bold">I created a tool </strong>that allowed <strong className="font-bold">people to visually express different categories: emotions, actions, and objects</strong>. After testing it, I chose to <strong className="font-bold">focus specifically on emotions</strong>, as I was drawn to the more abstract and personal nature of that topic.
                </p>
                <p>
                  Focusing on emotions gave me a way to <strong className="font-bold">explore how deeply personal and varied emotional expression can be</strong> — here are a few examples from the research:
                </p>
              </div>

              {/* Previous Project Image */}
              <div className="mb-4">
                <img
                  src="https://raw.githubusercontent.com/elfasiShir/inside/master/assets/img/researchProcess/previousProject.png"
                  alt="Previous project interface"
                  className="w-full max-w-[25rem] h-auto border border-gray-300"
                />
              </div>

              {/* Link to Tool Button */}
              <div className="mb-6">
                 <button
                    onClick={handleLinkToTool}
                    className="group rounded-full p-[1.5px] bg-transparent hover:bg-black transition-colors duration-300"
                >
                    <span className="block rounded-full bg-white border border-black transition-colors duration-300 group-hover:border-transparent group-hover:bg-black">
                        <span className="block px-5 py-2 text-sm font-inter items-start font-medium text-black transition-colors duration-300 group-hover:text-white">
                            Link to tool
                        </span>
                    </span>
                </button>
              </div>
            </div>

            {/* The previous Link to Tool Button section moved here */}
            {/* Keeping the outer div to preserve the original layout structure for justify-between if needed for other elements */}
            <div>
              {/* This div was empty after moving the button, ensuring no unintended layout changes */}
            </div>
          </div>

          {/* Middle Side - Research Examples */}
          <div className="w-[60%] flex flex-col justify-center gap-8">
            
            {/* Emotions Section */}
            <div className="grid grid-cols-[auto,1fr,1fr,1fr] gap-x-16 items-start">
              <h3 className="text-xl font-bold shrink-0">Emotions</h3>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-sm">Anger</p>
                <img
                  src="https://raw.githubusercontent.com/elfasiShir/inside/master/assets/img/researchProcess/emotions_anger.png"
                  alt="Anger emotion"
                  className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-sm">Disgust</p>
                <img
                  src="https://raw.githubusercontent.com/elfasiShir/inside/master/assets/img/researchProcess/emotions_disgust.png"
                  alt="Disgust emotion"
                  className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-sm">Trust</p>
                <img
                  src="https://raw.githubusercontent.com/elfasiShir/inside/master/assets/img/researchProcess/emotions_trust.png"
                  alt="Trust emotion"
                  className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain"
                />
              </div>
            </div>

            {/* Actions Section */}
            <div className="grid grid-cols-[auto,1fr,1fr,1fr] gap-x-16 items-start">
              <h3 className="text-xl font-bold shrink-0">Actions</h3>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-sm">hit</p>
                <img
                  src="https://raw.githubusercontent.com/elfasiShir/inside/master/assets/img/researchProcess/actions_hit.png"
                  alt="Hit action"
                  className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-sm">cry</p>
                <img
                  src="https://raw.githubusercontent.com/elfasiShir/inside/master/assets/img/researchProcess/actions_cry.png"
                  alt="Cry action"
                  className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-sm">dance</p>
                <img
                  src="https://raw.githubusercontent.com/elfasiShir/inside/master/assets/img/researchProcess/actions_dance.png"
                  alt="Dance action"
                  className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain"
                />
              </div>
            </div>

            {/* Objects Section */}
            <div className="grid grid-cols-[auto,1fr,1fr,1fr] gap-x-16 items-start">
              <h3 className="text-xl font-bold shrink-0">Objects</h3>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-sm">sofa</p>
                <img
                  src="https://raw.githubusercontent.com/elfasiShir/inside/master/assets/img/researchProcess/objects_sofa.png"
                  alt="Sofa object"
                  className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-sm">table</p>
                <img
                  src="https://raw.githubusercontent.com/elfasiShir/inside/master/assets/img/researchProcess/objects_table.png"
                  alt="Table object"
                  className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain"
                />
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-sm">bed</p>
                <img
                  src="https://raw.githubusercontent.com/elfasiShir/inside/master/assets/img/researchProcess/objects_bed.png"
                  alt="Bed object"
                  className="w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain"
                />
              </div>
            </div>

          </div>

          {/* Empty Right Column */}
          <div className="w-[10%]"></div>
        </motion.div>
      </div>
    </div>
  );
}
