
import React, { useRef, useEffect, useCallback, useState } from "react";

export default function PaintableText({
  text,
  className = "",
  style = {},
  fontSize = "8rem",
  fontWeight = "700",
  fontFamily = "PT Serif, serif",
  strokeColor = "#0000",
  strokeWidth = 1,
  colorSpeed = 0.5,
  onTextClick = null,
  textAlign = 'left',
  lineSpacing = 0, // New prop for additional line spacing in pixels
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [canvasRect, setCanvasRect] = useState(null);

  // Animation state
  const animationRef = useRef({
    time: 0,
    lastPoints: []
  });

  const PRISMATIC_GRADIENT = [
    '#00007b', // dark blue
    '#3399ff', // sky blue
    '#66ccaa', // sea green
    '#339900', // green
    '#996600', // brown
    '#ffcc66', // yellow-orange
    '#ffeedd', // light peach
    '#cc6699', // pink-magenta
    '#cc0033', // red
    '#660000', // dark red
  ];

  const getPrismaticColor = useCallback(() => {
    animationRef.current.time += 0.01;
    const t = (animationRef.current.time * colorSpeed) % 1;

    const n = PRISMATIC_GRADIENT.length;
    const scaledT = t * (n - 1);
    const index = Math.floor(scaledT);
    const frac = scaledT - index;

    const hexToRgb = (hex) => {
      const bigint = parseInt(hex.replace('#', ''), 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    };

    const lerp = (a, b, t) => Math.round(a + (b - a) * t);

    const color1 = hexToRgb(PRISMATIC_GRADIENT[index]);
    const color2 = hexToRgb(PRISMATIC_GRADIENT[Math.min(index + 1, n - 1)]);

    const r = lerp(color1.r, color2.r, frac);
    const g = lerp(color1.g, color2.g, frac);
    const b = lerp(color1.b, color2.b, frac);

    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  }, [colorSpeed]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerRect = container.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    setCanvasRect(canvas.getBoundingClientRect());

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lines = text.split('\n');

    ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
    ctx.textAlign = textAlign; // Use the new prop for alignment
    ctx.textBaseline = 'middle';

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.fontFamily = fontFamily;
    tempDiv.style.fontSize = fontSize;
    tempDiv.style.fontWeight = fontWeight;
    tempDiv.textContent = 'M'; // Use a single character to measure line height
    document.body.appendChild(tempDiv);
    const computedLineHeight = tempDiv.getBoundingClientRect().height;
    document.body.removeChild(tempDiv);

    // Determine horizontal position based on alignment
    let x;
    if (textAlign === 'center') {
      x = canvas.width / 2;
    } else if (textAlign === 'right') {
      x = canvas.width;
    } else {
      x = 0; // Default to left
    }

    // Draw the text outline for each line
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    lines.forEach((line, index) => {
      // Calculate Y position for each line to center the entire text block, including extra spacing
      const y = canvas.height / 2 + (computedLineHeight + lineSpacing) * (index - (lines.length - 1) / 2);
      ctx.strokeText(line, x, y); // Use calculated x
    });

    // Create clipping path from text for each line
    ctx.save();
    ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
    ctx.textAlign = textAlign; // Use the new prop for alignment
    ctx.textBaseline = 'middle';
    lines.forEach((line, index) => {
      const y = canvas.height / 2 + (computedLineHeight + lineSpacing) * (index - (lines.length - 1) / 2);
      ctx.fillText(line, x, y); // Use calculated x
    });

    // Set composite operation to only paint inside the text
    ctx.globalCompositeOperation = 'source-atop';
  }, [text, fontSize, fontWeight, fontFamily, strokeColor, strokeWidth, textAlign, lineSpacing]); // Added lineSpacing to dependencies

  const drawBrushStroke = useCallback((x, y, size) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasRect) return;

    const ctx = canvas.getContext('2d');
    const relativeX = x - canvasRect.left;
    const relativeY = y - canvasRect.top;

    // Add point to history
    animationRef.current.lastPoints.push({ x: relativeX, y: relativeY });
    if (animationRef.current.lastPoints.length > 5) {
      animationRef.current.lastPoints.shift();
    }

    // Draw smooth curve through points
    if (animationRef.current.lastPoints.length > 2) {
      ctx.beginPath();
      ctx.moveTo(animationRef.current.lastPoints[0].x, animationRef.current.lastPoints[0].y);

      for (let i = 1; i < animationRef.current.lastPoints.length - 2; i++) {
        const xc = (animationRef.current.lastPoints[i].x + animationRef.current.lastPoints[i + 1].x) / 2;
        const yc = (animationRef.current.lastPoints[i].y + animationRef.current.lastPoints[i + 1].y) / 2;
        ctx.quadraticCurveTo(animationRef.current.lastPoints[i].x, animationRef.current.lastPoints[i].y, xc, yc);
      }

      ctx.strokeStyle = getPrismaticColor();
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  }, [canvasRect, getPrismaticColor]);

  const handleMouseMove = useCallback((e) => {
    if (!canvasRect) return;

    const dx = e.clientX - (animationRef.current.lastMouseX || e.clientX);
    const dy = e.clientY - (animationRef.current.lastMouseY || e.clientY);
    const speed = Math.sqrt(dx * dx + dy * dy);

    const baseSize = 90;
    const sizeVariation = Math.max(0.5, Math.min(1.5, 1 + speed * 0.01));
    const strokeSize = baseSize * sizeVariation;

    drawBrushStroke(e.clientX, e.clientY, strokeSize);

    animationRef.current.lastMouseX = e.clientX;
    animationRef.current.lastMouseY = e.clientY;
  }, [canvasRect, drawBrushStroke]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    animationRef.current.lastPoints = [];
    resizeCanvas();
  }, [resizeCanvas]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    animationRef.current.lastPoints = [];
  }, []);

  const handleClick = useCallback(() => {
    if (onTextClick) {
      onTextClick();
    }
  }, [onTextClick]);

  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    // Initial setup
    setTimeout(resizeCanvas, 100); // Small delay to ensure container is rendered

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resizeCanvas]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" />
      <div
        className="relative z-0 pointer-events-none select-none"
        style={{
          color: 'transparent',
          fontFamily: fontFamily,
          fontSize: fontSize,
          fontWeight: fontWeight,
          margin: 0,
          WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
          transform: isHovering ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.3s ease',
          whiteSpace: 'pre-wrap',
          textAlign: textAlign,
          // Use calc to add extra spacing to the default line-height for proper container sizing
          lineHeight: lineSpacing > 0 ? `calc(1.2em + ${lineSpacing}px)` : undefined,
        }}
      >
        {text}
      </div>
    </div>
  );
}
