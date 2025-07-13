
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import ColorPalette from '@/components/ColorPalette';
import ScreenshotButton from '@/components/ScreenshotButton'; // Import the new component

const colors = [
  "#458E0A", "#6AAB62", "#80BE99", "#98D1D2", "#98CBF1", "#476AB4", "#0C2487",
  "#F9DD6C", "#FCC980", "#FDDEAC", "#F9AC44", "#E19938", "#AC701C", "#6E4E01",
  "#170606", "#61191C", "#8A2027", "#AF1E31", "#B03962", "#C26E85", "#E6B49D"
];

const CollectiveShapePage = () => {
  const sketchRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const sketchProps = useRef({});

  // State for p5.js sketch parameters
  const [size, setSize] = useState(80);
  const [thickness, setThickness] = useState(1.0);
  const [alphaMin, setAlphaMin] = useState(80);
  const [alphaMax, setAlphaMax] = useState(220);
  const [selectedColor, setSelectedColor] = useState('#170606');

  // Update props ref whenever state changes
  useEffect(() => {
    sketchProps.current = { size, thickness, alphaMin, alphaMax, color: selectedColor };
  }, [size, thickness, alphaMin, alphaMax, selectedColor]);

  useEffect(() => {
    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        document.head.appendChild(script);
      });
    };

    const initP5 = async () => {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js", "p5-script");
        // No need to load p5.sound.min.js if not used
        // await loadScript("https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/addons/p5.sound.min.js", "p5-sound-script");

        const sketch = (p) => {
          let boxes = [];
          const minBoxes = 300;
          const boxesPerExit = 2;
          let currentColor;

          const createBox = (aMin, aMax, col) => {
            return {
              x: p.random(p.width),
              y: p.random(p.height),
              w: p.random(0.5, 1),
              h: p.random(0.5, 1),
              c: p.color(col),
              alpha: p.random(aMin, aMax),
              vx: 0,
              vy: 0,
            };
          };

          p.setup = () => {
            p.createCanvas(sketchRef.current.offsetWidth, sketchRef.current.offsetHeight);
            const { alphaMin, alphaMax, color } = sketchProps.current;
            currentColor = p.color(color);
            for (let i = 0; i < minBoxes * 1.5; i++) {
              boxes.push(createBox(alphaMin, alphaMax, currentColor));
            }
          };

          p.draw = () => {
            p.clear();
            let { size: baseSize, thickness: thicknessFactor, alphaMin, alphaMax, color } = sketchProps.current;
            
            let newColor = p.color(color);
            if(currentColor.toString() !== newColor.toString()){
                currentColor = newColor;
                for(let b of boxes) {
                    b.c = currentColor;
                }
            }

            // Ensure alphaMin is always less than or equal to alphaMax for random function
            let effectiveAlphaMin = Math.min(alphaMin, alphaMax);
            let effectiveAlphaMax = Math.max(alphaMin, alphaMax);

            let newBoxes = [];
            for (let i = boxes.length - 1; i >= 0; i--) {
              let b = boxes[i];
              let w = Math.max(b.w * baseSize * thicknessFactor, 1);
              let h = Math.max(b.h * baseSize * (2 - thicknessFactor), 1);
              let dx = b.x + w / 2 - p.mouseX;
              let dy = b.y + h / 2 - p.mouseY;
              let distSq = dx * dx + dy * dy;
              let influenceRadius = 250;
              
              if (distSq < influenceRadius * influenceRadius) {
                let angle = p.atan2(dy, dx);
                let force = p.map(distSq, 0, influenceRadius * influenceRadius, 9, 0);
                b.vx += p.cos(angle) * force;
                b.vy += p.sin(angle) * force;
              }

              b.x += b.vx;
              b.y += b.vy;
              b.vx *= 0.85;
              b.vy *= 0.85;

              if (b.x < -200 || b.x > p.width + 200 || b.y < -200 || b.y > p.height + 200) {
                boxes.splice(i, 1);
                for (let j = 0; j < boxesPerExit; j++) {
                  newBoxes.push(createBox(effectiveAlphaMin, effectiveAlphaMax, currentColor));
                }
                continue;
              }
              
              let currentFill = p.color(b.c);
              currentFill.setAlpha(b.alpha);
              p.fill(currentFill);
              p.noStroke();
              p.rect(b.x, b.y, w, h);
            }
            boxes = boxes.concat(newBoxes);
            while (boxes.length < minBoxes) {
              boxes.push(createBox(effectiveAlphaMin, effectiveAlphaMax, currentColor));
            }
          };
          
          p.windowResized = () => {
            if (sketchRef.current) {
              p.resizeCanvas(sketchRef.current.offsetWidth, sketchRef.current.offsetHeight);
            }
          };
          
          p.clearCanvas = () => {
            boxes = [];
          };
        };

        if (sketchRef.current) {
          p5InstanceRef.current = new window.p5(sketch, sketchRef.current);
        }
      } catch (error) {
        console.error("p5.js initialization error:", error);
      }
    };
    
    initP5();

    return () => {
      p5InstanceRef.current?.remove();
    };
  }, []);

  const handleClearCanvas = () => {
    p5InstanceRef.current?.clearCanvas();
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-100">
      <main ref={sketchRef} className="flex-grow w-full h-full cursor-pointer"></main>
      
      <motion.footer 
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white/90 backdrop-blur-xl border-t border-gray-200 p-4 shadow-t-xl"
      >
        <div className="w-full flex items-center justify-between gap-8">
          {/* Left-aligned controls */}
          <div className="flex items-center gap-8">
            <Button onClick={handleClearCanvas} variant="outline" className="flex-shrink-0">Clear Canvas</Button>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Base Size</label>
                <Slider value={[size]} onValueChange={([val]) => setSize(val)} min={20} max={200} step={1} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Thickness</label>
                <Slider value={[thickness]} onValueChange={([val]) => setThickness(val)} min={0.2} max={2.0} step={0.01} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Min Transparency</label>
                <Slider value={[alphaMin]} onValueChange={([val]) => setAlphaMin(val)} min={10} max={255} step={1} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max Transparency</label>
                <Slider value={[alphaMax]} onValueChange={([val]) => setAlphaMax(val)} min={10} max={255} step={1} />
              </div>
            </div>
          </div>
          
          {/* Right-aligned controls */}
          <div className="flex items-center gap-4">
            <ScreenshotButton 
              sketchRef={sketchRef}
              shapeName="collective"
              selectedColor={selectedColor}
            />
            <ColorPalette colors={colors} selectedColor={selectedColor} onColorSelect={setSelectedColor} />
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default CollectiveShapePage;
