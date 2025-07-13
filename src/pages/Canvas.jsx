
import React, { useEffect, useRef, useState } from 'react';
import PaintableText from '../components/PaintableText';
import LabelButton from '../components/LabelButton';
import { useNavigate } from 'react-router-dom';
import { UploadFile } from '@/api/integrations';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils'; // Fixed syntax error here
import { usePrismaticColor } from '../components/ColorContext';

// Helper component for the sentence blanks
const FilledBlank = ({ value, color }) => {
    if (value) {
        return <span className="font-bold" style={{ color: color, transition: 'color 0.3s ease-in-out' }}>{value}</span>;
    }
    // Renders a line for the blank
    return <span className="inline-block w-28 md:w-36 h-1 bg-gray-300 rounded-full mx-1 align-middle"></span>;
};

const CanvasPage = () => {
  const sketchRef = useRef(null);
  const [selection, setSelection] = useState({ emotion: '', reason: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  const { currentColor } = usePrismaticColor();

  useEffect(() => {
    // Load selection from local storage to display in the title
    const storedData = localStorage.getItem('currentSelection');
    if (storedData) {
      setSelection(JSON.parse(storedData));
    }

    let p5Instance;

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

        const sketch = (p) => {
          let currentColor = '#000000';
          let selectedShapes = [];
          let sliders = {};
          let shapeButtons = {};
          let distanceDirection = 'horizontal';
          let prevSliderValues = {};
          let graphicsBuffer;
          const INITIAL_MAX_DISTANCE = 300;
          let lastSetDistance = INITIAL_MAX_DISTANCE;
          // REMOVED drawArea and BLUR_PADDING as they caused the offset
          let paletteColors = [
            '#5D9B2F', '#79B557', '#A3CE84', '#B6D7C8', '#A7CAE6', '#87BDE9', '#2D4FA1',
            '#F9E680', '#F6D16E', '#F6BC53', '#F5A543', '#D88A25', '#9B6714', '#6D4B04',
            '#2C0D0D', '#590F0F', '#861212', '#B61C1C', '#D63F3F', '#C6707C', '#E7B5AD'
          ];
          const NESTED_SCALE_FACTOR_PER_DEPTH = 0.8;
          const NESTED_LINE_LENGTH_SCALE_FACTOR = 0.8;
          const NESTED_LINE_THICKNESS_SCALE_FACTOR = 0.8;

          function drawRoundedTriangleOnBuffer(pg, x1, y1, x2, y2, x3, y3, r) {
            r = pg.constrain(r, 0, p.min(p.dist(x1, y1, x2, y2), p.dist(x2, y2, x3, y3), p.dist(x3, y3, x1, y1)) / 2 - 1);
            let p1 = p.createVector(x1, y1);
            let p2 = p.createVector(x2, y2);
            let p3 = p.createVector(x3, y3);
            pg.beginShape();
            let v31_norm = p.constructor.Vector.sub(p3, p1).normalize();
            let v21_norm = p.constructor.Vector.sub(p2, p1).normalize();
            let p1_tangent_from_p3 = p.constructor.Vector.add(p1, p.constructor.Vector.mult(v31_norm, r));
            let p1_tangent_to_p2 = p.constructor.Vector.add(p1, p.constructor.Vector.mult(v21_norm, r));
            let v12_norm = p.constructor.Vector.sub(p1, p2).normalize();
            let v32_norm = p.constructor.Vector.sub(p3, p2).normalize();
            let p2_tangent_from_p1 = p.constructor.Vector.add(p2, p.constructor.Vector.mult(v12_norm, r));
            let p2_tangent_to_p3 = p.constructor.Vector.add(p2, p.constructor.Vector.mult(v32_norm, r));
            let v23_norm = p.constructor.Vector.sub(p2, p3).normalize();
            let v13_norm = p.constructor.Vector.sub(p1, p3).normalize();
            let p3_tangent_from_p2 = p.constructor.Vector.add(p3, p.constructor.Vector.mult(v23_norm, r));
            let p3_tangent_to_p1 = p.constructor.Vector.add(p3, p.constructor.Vector.mult(v13_norm, r));
            pg.vertex(p3_tangent_from_p2.x, p3_tangent_from_p2.y);
            pg.quadraticVertex(p3.x, p3.y, p3_tangent_to_p1.x, p3_tangent_to_p1.y);
            pg.vertex(p1_tangent_from_p3.x, p1_tangent_from_p3.y);
            pg.quadraticVertex(p1.x, p1.y, p1_tangent_to_p2.x, p1_tangent_to_p2.y);
            pg.vertex(p2_tangent_from_p1.x, p2_tangent_from_p1.y);
            pg.quadraticVertex(p2.x, p2.y, p2_tangent_to_p3.x, p2_tangent_to_p3.y);
            pg.endShape(p.CLOSE);
          }

          function pointInRotatedRect(px, py, rx, ry, rw, rh, angle) {
            let dx = px - rx;
            let dy = py - ry;
            let rotatedX = dx * p.cos(-angle) - dy * p.sin(-angle);
            let rotatedY = dx * p.sin(-angle) + dy * p.cos(-angle);
            return rotatedX >= -rw / 2 && rotatedX <= rw / 2 && rotatedY >= -rh / 2 && rotatedY <= rh / 2;
          }

          function collidePointTriangle(px, py, x1, y1, x2, y2, x3, y3) {
            let area = 0.5 * (-y2 * x3 + y1 * (x3 - x2) + x1 * (y2 - y3) + x2 * y3);
            let s = 1 / (2 * area) * (y1 * x3 - x1 * y3 + (y3 - y1) * px + (x1 - x3) * py);
            let t = 1 / (2 * area) * (x1 * y2 - y1 * x2 + (y1 - y2) * px + (x2 - x1) * py);
            return s >= 0 && t >= 0 && (s + t) <= 1;
          }

          function collidePointEllipse(px, py, cx, cy, w, h, angle) {
            let dx = px - cx;
            let dy = py - cy;
            let rotatedX = dx * p.cos(-angle) - dy * p.sin(-angle);
            let rotatedY = dx * p.sin(-angle) + dy * p.cos(-angle);
            let halfWidth = w / 2;
            let halfHeight = h / 2;
            if (halfWidth === 0 || halfHeight === 0) return false;
            return ((rotatedX * rotatedX) / (halfWidth * halfWidth)) + ((rotatedY * rotatedY) / (halfHeight * halfHeight)) <= 1;
          }

          function drawStyledBaseShapeOnBuffer(pg, s, distanceDirection, fillColor, strokeColor, strokeWeightValue, currentShapeSize, currentStretched, currentContraction, currentDepth, currentLineThickness = null) {
            if (fillColor !== null) pg.fill(fillColor);
            else pg.noFill();
            if (strokeColor !== null) {
              pg.stroke(strokeColor);
              pg.strokeWeight(strokeWeightValue);
            } else pg.noStroke();

            let baseShapeWidth = currentShapeSize;
            let baseShapeHeight = currentShapeSize;
            if (s.type === 'line') {
              pg.rectMode(p.CENTER);
              let currentLength = currentShapeSize * currentContraction;
              let actualThickness = currentLineThickness;
              let lineRoundness = p.map(s.round, 0, 100, 0, actualThickness / 2);
              if (distanceDirection === 'horizontal') pg.rect(0, 0, actualThickness, currentLength, lineRoundness);
              else pg.rect(0, 0, currentLength, actualThickness, lineRoundness);
            } else if (s.type === 'square') {
              pg.rectMode(p.CENTER);
              let squareWidth = baseShapeWidth * currentStretched;
              let squareHeight = baseShapeHeight * currentContraction;
              let squareRoundness = p.map(s.round, 0, 100, 0, baseShapeWidth * 0.45);
              pg.rect(0, 0, squareWidth, squareHeight, squareRoundness);
            } else if (s.type === 'circle') {
              let ellipseWidth = baseShapeWidth * currentStretched;
              let ellipseHeight = baseShapeHeight * currentContraction;
              pg.ellipse(0, 0, ellipseWidth, ellipseHeight);
            } else if (s.type === 'triangle') {
              let triX1 = 0; let triY1 = -baseShapeHeight / 2;
              let triX2 = -baseShapeWidth / 2; let triY2 = baseShapeHeight / 2;
              let triX3 = baseShapeWidth / 2; let triY3 = baseShapeHeight / 2;
              triX1 *= currentStretched; triY1 *= currentContraction;
              triX2 *= currentStretched; triY2 *= currentContraction;
              triX3 *= currentStretched; triY3 *= currentContraction;
              let cornerRadius = p.map(s.round, 0, 100, 0, baseShapeWidth * 0.4);
              drawRoundedTriangleOnBuffer(pg, triX1, triY1, triX2, triY2, triX3, triY3, cornerRadius);
            }
          }

          function drawBorderShapeOnBuffer(pg, s, distanceDirection, currentShapeSize, currentStretched, currentContraction, currentLineThickness = null) {
            pg.noFill();
            pg.stroke('black');
            pg.strokeWeight(2);
            let borderOffset = p.max(4, currentShapeSize * 0.05);
            let effectiveShapeWidth = currentShapeSize * currentStretched;
            let effectiveShapeHeight = currentShapeSize * currentContraction;
            if (s.type === 'line') {
              let actualThickness = currentLineThickness;
              let borderExpansionFactor = 1.1;
              let borderRectWidth, borderRectHeight;
              if (distanceDirection === 'horizontal') {
                borderRectWidth = actualThickness * borderExpansionFactor;
                borderRectHeight = effectiveShapeHeight * borderExpansionFactor;
              } else {
                borderRectWidth = effectiveShapeHeight * borderExpansionFactor;
                borderRectHeight = actualThickness * borderExpansionFactor;
              }
              borderRectWidth = p.max(borderRectWidth, actualThickness + 4);
              borderRectHeight = p.max(borderRectHeight, effectiveShapeHeight + 4);
              let lineRoundness = p.map(s.round, 0, 100, 0, borderRectWidth / 2);
              pg.rect(0, 0, borderRectWidth, borderRectHeight, lineRoundness);
            } else if (s.type === 'square') {
              let squareWidth = effectiveShapeWidth + borderOffset;
              let squareHeight = effectiveShapeHeight + borderOffset;
              let squareRoundness = p.map(s.round, 0, 100, 0, currentShapeSize * 0.45);
              pg.rect(0, 0, squareWidth, squareHeight, squareRoundness);
            } else if (s.type === 'circle') {
              let ellipseWidth = effectiveShapeWidth + borderOffset;
              let ellipseHeight = effectiveShapeHeight + borderOffset;
              pg.ellipse(0, 0, ellipseWidth, ellipseHeight);
            } else if (s.type === 'triangle') {
              let triX1 = 0; let triY1 = -currentShapeSize / 2;
              let triX2 = -currentShapeSize / 2; let triY2 = currentShapeSize / 2;
              let triX3 = currentShapeSize / 2; let triY3 = currentShapeSize / 2;
              triX1 *= currentStretched; triY1 *= currentContraction;
              triX2 *= currentStretched; triY2 *= currentContraction;
              triX3 *= currentStretched; triY3 *= currentContraction;
              let centroidX = (triX1 + triX2 + triX3) / 3;
              let centroidY = (triY1 + triY2 + triY3) / 3;
              triX1 = centroidX + (triX1 - centroidX) * (1 + borderOffset / currentShapeSize);
              triY1 = centroidY + (triY1 - centroidY) * (1 + borderOffset / currentShapeSize);
              triX2 = centroidX + (triX2 - centroidX) * (1 + borderOffset / currentShapeSize);
              triY2 = centroidY + (triY2 - centroidY) * (1 + borderOffset / currentShapeSize);
              triX3 = centroidX + (triX3 - centroidX) * (1 + borderOffset / currentShapeSize);
              triY3 = centroidY + (triY3 - centroidY) * (1 + borderOffset / currentShapeSize);
              let cornerRadius = p.map(s.round, 0, 100, 0, currentShapeSize * 0.4);
              drawRoundedTriangleOnBuffer(pg, triX1, triY1, triX2, triY2, triX3, triY3, cornerRadius);
            }
          }

          function drawNestedShapes(pg, s, currentDepth, maxDepth, baseShapeFillColor, baseShapeStrokeColor) {
            if (currentDepth > maxDepth) return;
            let effectiveShapeSize;
            let effectiveLineThickness = null;
            if (s.type === 'line') {
              effectiveShapeSize = s.shapeSize * p.pow(NESTED_LINE_LENGTH_SCALE_FACTOR, currentDepth);
              effectiveShapeSize = p.max(effectiveShapeSize, 10);
              let initialBaseLineThickness = p.max(20, s.shapeSize * 0.05);
              effectiveLineThickness = (initialBaseLineThickness * s.stretched) * p.pow(NESTED_LINE_THICKNESS_SCALE_FACTOR, currentDepth);
              effectiveLineThickness = p.max(effectiveLineThickness, 1);
            } else {
              effectiveShapeSize = s.shapeSize * p.pow(NESTED_SCALE_FACTOR_PER_DEPTH, currentDepth);
              effectiveShapeSize = p.max(effectiveShapeSize, 10);
            }
            let effectiveStretched = s.stretched;
            let effectiveContraction = s.contraction;
            let currentFillColor;
            let currentStrokeColor;
            let currentStrokeWeight;
            if (maxDepth > 0) {
              currentFillColor = null;
              currentStrokeColor = baseShapeFillColor;
              currentStrokeWeight = 5;
            } else {
              currentFillColor = baseShapeFillColor;
              currentStrokeColor = null;
              currentStrokeWeight = 0;
            }
            drawStyledBaseShapeOnBuffer(pg, s, distanceDirection, currentFillColor, currentStrokeColor, currentStrokeWeight, effectiveShapeSize, effectiveStretched, effectiveContraction, currentDepth, effectiveLineThickness);
            if (currentDepth < maxDepth) {
              drawNestedShapes(pg, s, currentDepth + 1, maxDepth, baseShapeFillColor, baseShapeStrokeColor);
            }
          }

          function updateSlidersFromShape(shape) {
            sliders['Shape Size'].value(p.map(shape.shapeSize, 30, 400, 0, 100));
            sliders['Transparency'].value(p.map(shape.transparency, 0, 100, 255, 10));
            sliders['Rotation'].value(p.map(shape.rotation, 0, p.TWO_PI, 0, 100));
            sliders['Contraction'].value(p.map(shape.contraction, 0.2, 1, 100, 0));
            sliders['Stretched'].value(p.map(shape.stretched, 1, 5, 0, 100));
            sliders['Round'].value(shape.round);
            sliders['Blur'].value(shape.blur);
            sliders['Scatter'].value(shape.dispersion);
            sliders['Depth'].value(shape.depth);
            for (const label in sliders) {
              if (label !== 'Distance') prevSliderValues[label] = sliders[label].value();
            }
          }

          function updateShapeButtonVisuals() {
            for (const shapeType in shapeButtons) {
              const btn = shapeButtons[shapeType];
              let isShapeSelectedOnCanvas = false;
              for (const s of selectedShapes) {
                if (s.type === shapeType && s.selected) {
                  isShapeSelectedOnCanvas = true;
                  break;
                }
              }
              if (isShapeSelectedOnCanvas) btn.addClass('selected-on-canvas');
              else btn.removeClass('selected-on-canvas');
            }
          }

          function createShapeButton(shape) { // Removed x, y arguments
            const btn = p.createDiv('');
            btn.class('shape-btn');
            btn.parent('p5-shape-buttons-container'); // Parent to the React-controlled div
            btn.size(30, 30);
            btn.style('border', '1px solid black');
            btn.style('display', 'flex');
            btn.style('align-items', 'center');
            btn.style('justify-content', 'center');
            btn.html(`<canvas width="30" height="30"></canvas`);
            const ctx = btn.elt.querySelector('canvas').getContext('2d');
            ctx.fillStyle = 'black';
            if (shape === 'line') ctx.fillRect(13, 5, 4, 20);
            else if (shape === 'square') ctx.fillRect(5, 5, 20, 20);
            else if (shape === 'circle') {
              ctx.beginPath();
              ctx.arc(15, 15, 10, 0, p.TWO_PI);
              ctx.fill();
            } else if (shape === 'triangle') {
              ctx.beginPath();
              ctx.moveTo(15, 5);
              ctx.lineTo(5, 25);
              ctx.lineTo(25, 25);
              ctx.closePath();
              ctx.fill();
            }
            shapeButtons[shape] = btn;
            btn.mousePressed(() => {
              let clickedShapeType = shape;
              let existingShapeOfClickedType = selectedShapes.find(s => s.type === clickedShapeType);
              let currentlySelectedShapes = selectedShapes.filter(s => s.selected);
              // const centerX = drawArea.x + drawArea.w / 2; // Not used
              // const centerY = drawArea.y + drawArea.h / 2; // Not used
              if (existingShapeOfClickedType && existingShapeOfClickedType.selected) {
                selectedShapes = selectedShapes.filter(s => s !== existingShapeOfClickedType);
                selectedShapes.forEach(s => s.selected = false);
                if (selectedShapes.length > 0) {
                  selectedShapes[0].selected = true;
                  updateSlidersFromShape(selectedShapes[0]);
                }
                updateShapeButtonVisuals();
                return;
              }
              if (!existingShapeOfClickedType && selectedShapes.length < 3) {
                const newShape = {
                  type: clickedShapeType,
                  shapeSize: p.map(sliders['Shape Size'].value(), 0, 100, 30, 400),
                  transparency: p.map(sliders['Transparency'].value(), 0, 100, 255, 10),
                  rotation: p.map(sliders['Rotation'].value(), 0, 100, 0, p.TWO_PI),
                  contraction: p.map(sliders['Contraction'].value(), 0, 100, 1, 0.2),
                  stretched: p.map(sliders['Stretched'].value(), 0, 100, 1, 5),
                  round: sliders['Round'].value(),
                  blur: sliders['Blur'].value(),
                  dispersion: sliders['Scatter'].value(),
                  depth: sliders['Depth'].value(),
                  selected: true,
                  x: 0,
                  y: 0
                };
                selectedShapes.push(newShape);
                selectedShapes.forEach(s => s.selected = false);
                newShape.selected = true;
                updateSlidersFromShape(newShape);
              } else {
                if (currentlySelectedShapes.length > 0) {
                  currentlySelectedShapes.forEach(s => s.type = clickedShapeType);
                  updateSlidersFromShape(currentlySelectedShapes[0]);
                } else if (existingShapeOfClickedType) {
                  existingShapeOfClickedType.selected = true;
                  updateSlidersFromShape(existingShapeOfClickedType);
                }
              }
              updateShapeButtonVisuals();
            });
          }

          p.setup = () => {
            const canvasContainer = sketchRef.current;
            let currentCanvasWidth = 800;
            let currentCanvasHeight = 800;

            if (canvasContainer) {
                currentCanvasWidth = canvasContainer.offsetWidth;
                currentCanvasHeight = canvasContainer.offsetHeight;
            }
            
            p.createCanvas(currentCanvasWidth, currentCanvasHeight);
            p.background(255);

            // The drawArea object has been removed to fix the offset issue.

            // Re-create graphicsBuffer with full canvas dimensions
            graphicsBuffer = p.createGraphics(currentCanvasWidth, currentCanvasHeight);
            // Attach the p5 instance to the canvas DOM element for external access
            p.canvas.p5Instance = p; 

            let fontLink = p.createElement('link');
            fontLink.attribute('rel', 'stylesheet');
            fontLink.attribute('href', 'https://fonts.googleapis.com/css2?family=Inter&display=swap');
            fontLink.parent(document.head);
            let styleTag = p.createElement('style', `* { font-family: 'Inter', sans-serif; } input[type=range] { -webkit-appearance: none; width: 170px; height: 2px; background: black; } input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: white; border: 1px solid black; cursor: pointer; margin-top: 2px; } button.naked-button { background: none; border: none; color: black; font-size: 14px; cursor: pointer; padding: 0; margin: 0; display: block; text-align: left; } .shape-btn { display: inline-block; margin-right: 10px; cursor: pointer; } .shape-btn.selected-on-canvas { border: 2px solid blue !important; background-color: #e0e0ff !important; } .direction-btn { background: none; border: none; font-size: 20px; cursor: pointer; padding: 5px; margin-right: 5px; }`);
            styleTag.parent(document.head);

            const uiContainer = p.select('#p5-ui-container');
            if (!uiContainer) {
              console.error("UI container not found");
              return;
            }

            // --- Color Palette ---
            const colorSection = p.createDiv();
            colorSection.parent(uiContainer);
            p.createDiv('Color').parent(colorSection).style('font-weight', 'bold').style('font-size', '14px');
            const paletteContainer = p.createDiv('').parent(colorSection);
            paletteContainer.style('display', 'grid');
            paletteContainer.style('grid-template-columns', 'repeat(7, 1fr)');
            paletteContainer.style('gap', '5px');
            paletteContainer.style('margin-top', '5px');
            paletteContainer.style('width', '170px');

            paletteColors.forEach((col) => {
              const colorDiv = p.createDiv('');
              colorDiv.style('width', '20px').style('height', '20px').style('border-radius', '50%').style('background-color', col);
              colorDiv.style('border', '1px solid #ccc');
              colorDiv.style('cursor', 'pointer');
              colorDiv.mousePressed(() => currentColor = col);
              colorDiv.parent(paletteContainer);
            });

            // --- Direction ---
            const directionSection = p.createDiv();
            directionSection.parent(uiContainer);
            p.createDiv('Direction').parent(directionSection).style('font-size', '13px');
            const dirButtonsContainer = p.createDiv('').parent(directionSection).style('display', 'flex');

            const horizBtn = p.createButton('↔');
            horizBtn.class('direction-btn').parent(dirButtonsContainer);
            horizBtn.mousePressed(() => {
              distanceDirection = 'horizontal';
              if (sliders['Distance'].value() === 100 && selectedShapes.length === 2) {
                [selectedShapes[0], selectedShapes[1]] = [selectedShapes[1], selectedShapes[0]];
              }
            });
            const vertBtn = p.createButton('↕');
            vertBtn.class('direction-btn').parent(dirButtonsContainer);
            vertBtn.mousePressed(() => {
              distanceDirection = 'vertical';
              if (sliders['Distance'].value() === 100 && selectedShapes.length === 2) {
                [selectedShapes[0], selectedShapes[1]] = [selectedShapes[1], selectedShapes[0]];
              }
            });
            
            // --- Sliders ---
            const sliderLabels = ['Shape Size', 'Transparency', 'Distance', 'Rotation', 'Contraction', 'Stretched', 'Round', 'Blur', 'Scatter', 'Depth'];
            const slidersSection = p.createDiv();
            slidersSection.parent(uiContainer);

            sliderLabels.forEach((label) => {
              const sliderWrapper = p.createDiv();
              sliderWrapper.parent(slidersSection);
              sliderWrapper.style('margin-bottom', '20px');
              p.createDiv(label).parent(sliderWrapper).style('font-size', '13px');
              const slider = p.createSlider(0, 100, 0);
              slider.parent(sliderWrapper);
              slider.style('width', '170px');
              sliders[label] = slider;
              prevSliderValues[label] = slider.value();
            });
            
            // Shape buttons are now created without position and parented to a React div
            createShapeButton('line');
            createShapeButton('square');
            createShapeButton('circle');
            createShapeButton('triangle');
            updateShapeButtonVisuals();
          };
          
          p.mouseClicked = () => {
            // Updated check to use full canvas dimensions instead of drawArea
            if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
              let clickedOnShape = false;
              for (let i = 0; i < selectedShapes.length; i++) {
                const s = selectedShapes[i];
                const x = s.x, y = s.y;
                let hit = false;
                if (s.dispersion > 0) {
                  let numCopies = p.floor(p.map(s.dispersion, 0, 100, 2, 8));
                  let spreadRadius = p.map(s.dispersion, 0, 100, 0, lastSetDistance * 0.5);
                  let copyScale = p.map(s.dispersion, 0, 100, 1, 0.7);
                  for (let j = 0; j < numCopies; j++) {
                    let angle = p.map(j, 0, numCopies, 0, p.TWO_PI);
                    let offsetX = spreadRadius * p.cos(angle);
                    let offsetY = spreadRadius * p.sin(angle);
                    let copyGlobalX = x + offsetX, copyGlobalY = y + offsetY;
                    let effectiveShapeSize = s.shapeSize * copyScale;
                    let effectiveStretched = s.stretched * copyScale;
                    let effectiveContraction = s.contraction * copyScale;
                    if (s.type === 'line') {
                      let initialBaseLineThickness = p.max(20, s.shapeSize * 0.05);
                      let currentThickness = (initialBaseLineThickness * effectiveStretched);
                      currentThickness = p.max(currentThickness, 1);
                      let rectWidth = distanceDirection === 'horizontal' ? currentThickness : effectiveShapeSize * effectiveContraction;
                      let rectHeight = distanceDirection === 'horizontal' ? effectiveShapeSize * effectiveContraction : currentThickness;
                      hit = pointInRotatedRect(p.mouseX, p.mouseY, copyGlobalX, copyGlobalY, rectWidth, rectHeight, s.rotation);
                    } else if (s.type === 'square') {
                      let squareSizeX = effectiveShapeSize * effectiveStretched;
                      let squareSizeY = effectiveShapeSize * effectiveContraction;
                      hit = pointInRotatedRect(p.mouseX, p.mouseY, copyGlobalX, copyGlobalY, squareSizeX, squareSizeY, s.rotation);
                    } else if (s.type === 'circle') {
                      let ellipseWidth = effectiveShapeSize * effectiveStretched;
                      let ellipseHeight = effectiveShapeSize * effectiveContraction;
                      hit = collidePointEllipse(p.mouseX, p.mouseY, copyGlobalX, copyGlobalY, ellipseWidth, ellipseHeight, s.rotation);
                    } else if (s.type === 'triangle') {
                      let triX1 = 0, triY1 = -effectiveShapeSize / 2, triX2 = -effectiveShapeSize / 2, triY2 = effectiveShapeSize / 2, triX3 = effectiveShapeSize / 2, triY3 = effectiveShapeSize / 2;
                      triX1 *= effectiveStretched; triY1 *= effectiveContraction;
                      triX2 *= effectiveStretched; triY2 *= effectiveContraction;
                      triX3 *= effectiveStretched; triY3 *= effectiveContraction;
                      let rotX1 = triX1 * p.cos(s.rotation) - triY1 * p.sin(s.rotation), rotY1 = triX1 * p.sin(s.rotation) + triY1 * p.cos(s.rotation);
                      let rotX2 = triX2 * p.cos(s.rotation) - triY2 * p.sin(s.rotation), rotY2 = triX2 * p.sin(s.rotation) + triY2 * p.cos(s.rotation);
                      let rotX3 = triX3 * p.cos(s.rotation) - triY3 * p.sin(s.rotation), rotY3 = triX3 * p.sin(s.rotation) + triY3 * p.cos(s.rotation);
                      let p1x = copyGlobalX + rotX1, p1y = copyGlobalY + rotY1, p2x = copyGlobalX + rotX2, p2y = copyGlobalY + rotY2, p3x = copyGlobalX + rotX3, p3y = copyGlobalY + rotY3;
                      hit = collidePointTriangle(p.mouseX, p.mouseY, p1x, p1y, p2x, p2y, p3x, p3y);
                    }
                    if (hit) break;
                  }
                } else {
                  let initialBaseLineThickness = p.max(20, s.shapeSize * 0.05);
                  let currentThickness = (initialBaseLineThickness * s.stretched);
                  currentThickness = p.max(currentThickness, 1);
                  let currentLength = s.shapeSize * s.contraction;
                  if (s.type === 'line') {
                    let rectWidth = distanceDirection === 'horizontal' ? currentThickness : currentLength;
                    let rectHeight = distanceDirection === 'horizontal' ? currentLength : currentThickness;
                    hit = pointInRotatedRect(p.mouseX, p.mouseY, x, y, rectWidth, rectHeight, s.rotation);
                  } else if (s.type === 'square') {
                    let squareSizeX = s.shapeSize * s.stretched;
                    let squareSizeY = s.shapeSize * s.contraction;
                    hit = pointInRotatedRect(p.mouseX, p.mouseY, x, y, squareSizeX, squareSizeY, s.rotation);
                  } else if (s.type === 'circle') {
                    let ellipseWidth = s.shapeSize * s.stretched;
                    let ellipseHeight = s.shapeSize * s.contraction;
                    hit = collidePointEllipse(p.mouseX, p.mouseY, x, y, ellipseWidth, ellipseHeight, s.rotation);
                  } else if (s.type === 'triangle') {
                    let triX1 = 0, triY1 = -s.shapeSize / 2, triX2 = -s.shapeSize / 2, triY2 = s.shapeSize / 2, triX3 = s.shapeSize / 2, triY3 = s.shapeSize / 2;
                    triX1 *= s.stretched; triY1 *= s.contraction;
                    triX2 *= s.stretched; triY2 *= s.contraction;
                    triX3 *= s.stretched; triY3 *= s.contraction;
                    let rotX1 = triX1 * p.cos(s.rotation) - triY1 * p.sin(s.rotation), rotY1 = triX1 * p.sin(s.rotation) + triY1 * p.cos(s.rotation);
                    let rotX2 = triX2 * p.cos(s.rotation) - triY2 * p.sin(s.rotation), rotY2 = triX2 * p.sin(s.rotation) + triY2 * p.cos(s.rotation);
                    let rotX3 = triX3 * p.cos(s.rotation) - triY3 * p.sin(s.rotation), rotY3 = triX3 * p.sin(s.rotation) + triY3 * p.cos(s.rotation);
                    let p1x = x + rotX1, p1y = y + rotY1, p2x = x + rotX2, p2y = y + rotY2, p3x = x + rotX3, p3y = y + rotY3;
                    hit = collidePointTriangle(p.mouseX, p.mouseY, p1x, p1y, p2x, p2y, p3x, p3y);
                  }
                }
                if (hit) {
                  selectedShapes.forEach(otherShape => { if (otherShape !== s) otherShape.selected = false; });
                  s.selected = !s.selected;
                  clickedOnShape = true;
                  if (s.selected) updateSlidersFromShape(s);
                  else {
                    let anyOtherSelected = selectedShapes.find(otherShape => otherShape.selected);
                    if (anyOtherSelected) updateSlidersFromShape(anyOtherSelected);
                  }
                  break;
                }
              }
              if (!clickedOnShape) selectedShapes.forEach(s => s.selected = false);
              updateShapeButtonVisuals();
            }
          };

          p.draw = () => {
            p.background(255);
            // Use full canvas dimensions for centering, not a sub-area
            const centerY = p.height / 2;
            const centerX = p.width / 2;
            const sliderCurrentDistance = p.map(sliders['Distance'].value(), 0, 100, INITIAL_MAX_DISTANCE, 0);
            const distanceSliderMoved = (sliders['Distance'].value() !== prevSliderValues['Distance']);
            if (distanceSliderMoved) lastSetDistance = sliderCurrentDistance;
            let spacingX = distanceDirection === 'horizontal' ? lastSetDistance : 0;
            let spacingY = distanceDirection === 'horizontal' ? 0 : lastSetDistance;
            if (selectedShapes.length === 1) {
              const s = selectedShapes[0];
              if (s.x === 0 && s.y === 0) { // Only set initial position if not already set
                s.x = centerX;
                s.y = centerY;
              }
            } else if (selectedShapes.length === 2) {
              const s0 = selectedShapes[0];
              const s1 = selectedShapes[1];
              s0.x = centerX - spacingX / 2;
              s0.y = centerY - spacingY / 2;
              s1.x = centerX + spacingX / 2;
              s1.y = centerY + spacingY / 2;
            } else if (selectedShapes.length === 3) {
              const s0 = selectedShapes[0];
              const s1 = selectedShapes[1];
              const s2 = selectedShapes[2];
              s0.x = centerX - spacingX;
              s0.y = centerY - spacingY;
              s1.x = centerX;
              s1.y = centerY;
              s2.x = centerX + spacingX;
              s2.y = centerY + spacingY;
            }
            for (let i = 0; i < selectedShapes.length; i++) {
              const s = selectedShapes[i];
              const x = s.x, y = s.y;
              if (s.selected) {
                for (const label in sliders) {
                  const currentValue = sliders[label].value();
                  if (label !== 'Distance' && currentValue !== prevSliderValues[label]) {
                    if (label === 'Shape Size') s.shapeSize = p.map(currentValue, 0, 100, 30, 400);
                    else if (label === 'Transparency') s.transparency = p.map(currentValue, 0, 100, 255, 10);
                    else if (label === 'Rotation') s.rotation = p.map(currentValue, 0, 100, 0, p.TWO_PI);
                    else if (label === 'Contraction') s.contraction = p.map(currentValue, 0, 100, 1, 0.2);
                    else if (label === 'Stretched') s.stretched = p.map(currentValue, 0, 100, 1, 5);
                    else if (label === 'Round') s.round = currentValue;
                    else if (label === 'Blur') s.blur = currentValue;
                    else if (label === 'Scatter') s.dispersion = currentValue;
                    else if (label === 'Depth') s.depth = currentValue;
                  }
                }
              }
              graphicsBuffer.clear();
              graphicsBuffer.push();
              // Translate to the shape's final position on the full-size buffer
              graphicsBuffer.translate(x, y);
              graphicsBuffer.rotate(s.rotation);
              let maxDepth = p.floor(p.map(s.depth, 0, 100, 0, 10));
              let shapeBaseFill = p.color(p.red(currentColor), p.green(currentColor), p.blue(currentColor), s.transparency);
              let shapeBaseStroke = p.color('black');
              if (s.dispersion > 0) {
                let numCopies = p.floor(p.map(s.dispersion, 0, 100, 2, 8));
                let spreadRadius = p.map(s.dispersion, 0, 100, 0, lastSetDistance * 0.5);
                let copyScale = p.map(s.dispersion, 0, 100, 1, 0.7);
                for (let j = 0; j < numCopies; j++) {
                  let angle = p.map(j, 0, numCopies, 0, p.TWO_PI);
                  let offsetX = spreadRadius * p.cos(angle);
                  let offsetY = spreadRadius * p.sin(angle);
                  graphicsBuffer.push();
                  graphicsBuffer.translate(offsetX, offsetY);
                  drawNestedShapes(graphicsBuffer, s, 0, maxDepth, shapeBaseFill, shapeBaseStroke);
                  if (s.selected) {
                    graphicsBuffer.noFill();
                    graphicsBuffer.stroke('black');
                    graphicsBuffer.strokeWeight(2);
                    let tempShapeSize = s.shapeSize * copyScale;
                    let tempStretched = s.stretched * copyScale;
                    let tempContraction = s.contraction * copyScale;
                    let tempS = { ...s, shapeSize: tempShapeSize, stretched: tempStretched, contraction: tempContraction };
                    drawBorderShapeOnBuffer(graphicsBuffer, tempS, distanceDirection, tempShapeSize, tempStretched, tempContraction);
                  }
                  graphicsBuffer.pop();
                }
              } else {
                drawNestedShapes(graphicsBuffer, s, 0, maxDepth, shapeBaseFill, shapeBaseStroke);
              }
              if (s.selected && s.dispersion === 0) {
                graphicsBuffer.push();
                let mainShapeEffectiveLineThickness = null;
                if (s.type === 'line') {
                  let initialBaseLineThickness = p.max(20, s.shapeSize * 0.05);
                  mainShapeEffectiveLineThickness = (initialBaseLineThickness * s.stretched);
                  mainShapeEffectiveLineThickness = p.max(mainShapeEffectiveLineThickness, 1);
                }
                drawBorderShapeOnBuffer(graphicsBuffer, s, distanceDirection, s.shapeSize, s.stretched, s.contraction, mainShapeEffectiveLineThickness);
                graphicsBuffer.pop();
              }
              graphicsBuffer.filter(p.BLUR, p.map(s.blur, 0, 100, 0, 10)); // Moved blur application outside of disperson branch
              // Draw the final buffer onto the main canvas at (0, 0)
              p.image(graphicsBuffer, 0, 0);
            }
            for (const label in sliders) {
              prevSliderValues[label] = sliders[label].value();
            }
          };

          p.windowResized = () => {
            const canvasContainer = sketchRef.current;
            if (canvasContainer) {
              const newWidth = canvasContainer.offsetWidth;
              const newHeight = canvasContainer.offsetHeight;
              p.resizeCanvas(newWidth, newHeight);

              // drawArea recalculation is removed.

              // Re-create graphicsBuffer with new full dimensions
              graphicsBuffer = p.createGraphics(newWidth, newHeight);
            }
          };

          // Expose functions to be called from React
          p.clearShapes = () => {
            selectedShapes = [];
            updateShapeButtonVisuals();
          };

          // Updated save function to return canvas data
          p.getCanvasData = () => {
            const canvas = p.canvas;
            return {
              canvas: canvas,
              shapes: selectedShapes.map(shape => ({
                type: shape.type,
                shapeSize: shape.shapeSize,
                transparency: shape.transparency,
                rotation: shape.rotation,
                contraction: shape.contraction,
                stretched: shape.stretched,
                round: shape.round,
                blur: shape.blur,
                dispersion: shape.dispersion,
                depth: shape.depth,
                x: shape.x,
                y: shape.y,
                selected: shape.selected
              })),
              sliderParams: {
                shapeSize: sliders['Shape Size'] ? sliders['Shape Size'].value() : 0,
                transparency: sliders['Transparency'] ? sliders['Transparency'].value() : 0,
                distance: sliders['Distance'] ? sliders['Distance'].value() : 0,
                rotation: sliders['Rotation'] ? sliders['Rotation'].value() : 0,
                contraction: sliders['Contraction'] ? sliders['Contraction'].value() : 0,
                stretched: sliders['Stretched'] ? sliders['Stretched'].value() : 0,
                round: sliders['Round'] ? sliders['Round'].value() : 0,
                blur: sliders['Blur'] ? sliders['Blur'].value() : 0,
                scatter: sliders['Scatter'] ? sliders['Scatter'].value() : 0,
                depth: sliders['Depth'] ? sliders['Depth'].value() : 0
              },
              color: currentColor,
              distanceDirection: distanceDirection
            };
          };
        };

        if (sketchRef.current && !p5Instance) {
          p5Instance = new window.p5(sketch, sketchRef.current);
        }

      } catch (error) {
        console.error("p5.js initialization error:", error);
      }
    };

    initP5();

    return () => {
      p5Instance?.remove();
    };
  }, []); // Initialize p5.js sketch once on component mount

  const handleClean = () => {
    // Access the p5 instance from the canvas DOM element and call its method
    if (sketchRef.current?.querySelector('canvas')?.p5Instance) {
      sketchRef.current.querySelector('canvas').p5Instance.clearShapes();
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    const p5Instance = sketchRef.current?.querySelector('canvas')?.p5Instance;
    if (!p5Instance) return;

    setIsSaving(true);

    const maxRetries = 3;
    let retryCount = 0;

    const attemptSave = async () => {
      try {
        // Get canvas and data from p5 instance
        const canvasData = p5Instance.getCanvasData();
        const canvas = canvasData.canvas;
        
        if (!canvas) {
          throw new Error('Canvas not found');
        }

        // Get current selection data
        const selectionData = JSON.parse(localStorage.getItem('currentSelection') || '{}');
        
        // Create filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const emotion = selectionData.emotion ? selectionData.emotion.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
        const reason = selectionData.reason ? selectionData.reason.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
        const filename = `${emotion}_${reason}_canvas_${timestamp}`;

        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) {
          throw new Error('Failed to create Blob from canvas.');
        }
        
        // Convert blob to file for upload
        const file = new File([blob], `${filename}.png`, { type: 'image/png' });
        
        // Upload to base44 with retry logic
        const { file_url } = await UploadFile({ file });

        // Create poster data object with all canvas data
        const posterData = {
          emotion: selectionData.emotion || '',
          reason: selectionData.reason || '',
          color: canvasData.color,
          img: filename,
          imgRoute: file_url,
          shapes: canvasData.shapes,
          sliderParams: canvasData.sliderParams,
          distanceDirection: canvasData.distanceDirection,
          createdAt: new Date().toISOString(),
          source: 'canvas'
        };

        // Update user data with retry logic
        const user = await User.me();
        const currentUserData = user.posters || [];
        const updatedPosters = [...currentUserData, posterData];
        
        await User.updateMyUserData({ posters: updatedPosters });
        
        // Also save to localStorage for immediate gallery update
        const storedPosters = JSON.parse(localStorage.getItem('emotionPosters') || '[]');
        const newPoster = {
          id: Date.now(),
          title: `${selectionData.emotion || 'Unknown'} - ${selectionData.reason || 'Unknown'}`,
          imageUrl: file_url,
          ...posterData
        };
        
        storedPosters.unshift(newPoster);
        localStorage.setItem('emotionPosters', JSON.stringify(storedPosters));
        
        console.log('Canvas saved successfully!');
        
        // Navigate to gallery
        navigate(createPageUrl("Gallery"));

      } catch (error) {
        console.error('Error saving canvas:', error);
        
        // Check if it's a rate limit error (429) and retry
        if (error.response?.status === 429 && retryCount < maxRetries) {
          retryCount++;
          console.log(`Rate limited, retrying in ${retryCount * 2} seconds... (Attempt ${retryCount}/${maxRetries})`);
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 2000)); // Use a fixed retry time or calculate dynamically
          return attemptSave(); // Recursively call to retry
        }
        
        // If it's not a rate limit error or we've exhausted retries, show user-friendly message
        alert(`Failed to save canvas: ${error.response?.status === 429 ? 'Server is busy, please try again in a few moments' : 'Please try again'}`);
        throw error; // Re-throw to be caught by the outer try-catch
      }
    };

    try {
      await attemptSave();
    } catch (error) {
      // Final error handling for issues not resolved by retries or other errors
      console.error('Final save attempt failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#FCFAFA' }}>
        {/* Header Content */}
        <div className="absolute top-0 left-0 w-full pt-7 pb-12 px-6 z-10 pointer-events-none">
            <div className="max-w-[90vw] mx-auto">
                <div style={{ marginBottom: '-25px' }} className="pointer-events-auto">
                    <PaintableText
                        text="Canvas"
                        fontSize="55px"
                        fontWeight="700"
                        fontFamily="PT Serif, serif"
                        className="leading-tight"
                    />
                </div>
                
                {/* Subtitle */}
                <div className="mt-8 pointer-events-none">
                    <p className="text-[24px] lg:text-[30px] xl:text-[36px] text-gray-800 font-light leading-relaxed">
                        When I am <FilledBlank value={selection.emotion} color={currentColor} />, I feel <FilledBlank value={selection.reason} color={currentColor} />.
                    </p>
                </div>
            </div>
        </div>

        {/* Main Grid Layout */}
        <div className="h-full pt-32 pb-8 px-6">
            <div 
                className="max-w-[95vw] mx-auto h-full grid gap-x-6"
                style={{
                    gridTemplateColumns: '200px 800px 200px',
                    gridTemplateRows: 'auto 800px',
                    justifyContent: 'center',
                    alignContent: 'center'
                }}
            >
                {/* Shape Buttons - Above Canvas, Right Side */}
                <div 
                    className="flex items-center justify-end gap-3"
                    style={{
                        gridColumn: '2 / 3',
                        gridRow: '1 / 2',
                        alignSelf: 'end',
                        marginBottom: '0.5rem' // Closer to canvas
                    }}
                >
                    <div id="p5-shape-buttons-container" className="flex items-center gap-3"></div>
                </div>

                {/* Action Buttons - Bottom Left */}
                <div 
                    className="flex flex-col gap-4 items-start justify-end pb-4"
                    style={{
                        gridColumn: '1 / 2',
                        gridRow: '2 / 3'
                    }}
                >
                    <LabelButton
                        label="Clean"
                        onClick={handleClean}
                        labelType="reason"
                        useFlexLayout={true}
                    />
                    <LabelButton
                        label={isSaving ? "Saving..." : "Save"}
                        onClick={handleSave}
                        labelType="reason"
                        useFlexLayout={true}
                        disabled={isSaving}
                    />
                </div>

                {/* p5.js Sketch Container - Center */}
                <div 
                    ref={sketchRef} 
                    className="w-[800px] h-[800px]"
                    style={{
                        gridColumn: '2 / 3',
                        gridRow: '2 / 3'
                    }}
                ></div>
                
                {/* Controls UI - Right */}
                <div 
                    className="flex flex-col justify-start h-full py-2"
                    style={{ 
                        gridColumn: '3 / 4',
                        gridRow: '1 / 3', // Span both rows to align with shapes and canvas
                        marginTop: '22px'
                    }}
                >
                    {/* Information Icon */}
                    <div 
                        className="relative self-start mb-2 z-10"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <div className="w-6 h-6 bg-white text-black border border-black rounded-full flex items-center justify-center text-sm font-bold cursor-help hover:bg-gray-100 transition-colors">
                            i
                        </div>
                        
                        {/* Tooltip */}
                        {showTooltip && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 p-4 bg-white text-black text-sm rounded-lg shadow-xl z-20 border border-gray-200">
                                <h4 className="font-bold text-base mb-2">Instructions:</h4>
                                <div className="font-inter space-y-1 mb-3 text-gray-800">
                                  <p>Choose up to 3 shapes of your preference.</p>
                                  <p>Select a color.</p>
                                  <p>Adjust the sliders affecting the shapes.</p>
                                </div>
                                <p className="font-bold">
                                  Aim to connect your choices to the sentence you've selected. Choose shapes, colors, and slider effects that best express the meaning or emotion of that sentence.
                                </p>
                                {/* Tooltip arrow */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white" style={{filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'}}></div>
                            </div>
                        )}
                    </div>

                    {/* UI Container */}
                    <div id="p5-ui-container" className="flex flex-col gap-y-4 justify-between h-full">
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CanvasPage;
