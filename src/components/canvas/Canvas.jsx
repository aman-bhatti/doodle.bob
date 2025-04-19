import { useRef, useEffect, useState, useCallback } from 'react';
import { useWhiteboardElements } from '../../hooks/useYjsBinding';
import { useWhiteboardStore, TOOLS } from '../../store/whiteboard';
import { updateCursorPosition } from '../../lib/yjs-setup';
import RemoteCursors from '../RemoteCursors';

const Canvas = ({ roomData }) => {
  const canvasRef = useRef(null);
  const elements = useWhiteboardElements();
  const [isDrawing, setIsDrawing] = useState(false);
  const [localCursorPos, setLocalCursorPos] = useState({ x: 0, y: 0 });
  
  
  const {
    currentTool,
    strokeColor,
    strokeWidth,
    fillColor,
    addElement,
    updateElement,
    selectedElements,
    setSelectedElements
  } = useWhiteboardStore();

  
  const getPointerPosition = useCallback((e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    
    
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    
    return { 
      x: canvasX, 
      y: canvasY 
    };
  }, []);

  
  const handleCursorMove = useCallback((e) => {
    const pos = getPointerPosition(e);
    setLocalCursorPos(pos);
    
    
    if (typeof pos.x === 'number' && typeof pos.y === 'number') {
      updateCursorPosition(pos.x, pos.y);
    }
  }, [getPointerPosition]);

  
  useEffect(() => {
    const canvasContainer = canvasRef.current?.parentElement;
    if (!canvasContainer) return;
    
    
    const handleGlobalMouseMove = (e) => {
      handleCursorMove(e);
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove, true);
    
    // No longer need the global touch listener as we're handling touch directly on the canvas
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      updateCursorPosition(rect.width / 2, rect.height / 2);
    }
    
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove, true);
    };
  }, [handleCursorMove]);

  
  useEffect(() => {
    
    const intervalId = setInterval(() => {
      if (localCursorPos.x && localCursorPos.y) {
        updateCursorPosition(localCursorPos.x, localCursorPos.y);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [localCursorPos]);

  
  const drawElement = useCallback((ctx, element) => {
    if (!element) return;
    
    ctx.strokeStyle = element.strokeColor || '#000000';
    ctx.lineWidth = element.strokeWidth || 2;
    ctx.fillStyle = element.fillColor || 'transparent';
    
    switch (element.type) {
      case 'path':
        if (!element.points || element.points.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(element.points[0][0], element.points[0][1]);
        
        for (let i = 1; i < element.points.length; i++) {
          ctx.lineTo(element.points[i][0], element.points[i][1]);
        }
        
        ctx.stroke();
        break;
        
      case 'rectangle':
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width, element.height);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'circle':
        ctx.beginPath();
        ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
    }
  }, []);

  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
    if (elements && elements.length > 0) {
      elements.forEach(element => {
        if (!element) return;
        drawElement(ctx, element);
      });
    }
  }, [elements, drawElement]);

  
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  
  const handleMouseDown = (e) => {
    // No need for preventDefault here as it's handled in the event listener
    
    const pos = getPointerPosition(e);
    setIsDrawing(true);
    handleCursorMove(e);
    
    
    switch (currentTool) {
      case TOOLS.PEN:
        const pathId = addElement({
          type: 'path',
          points: [[pos.x, pos.y]],
          strokeColor,
          strokeWidth,
        });
        setSelectedElements([pathId]);
        break;
        
      case TOOLS.RECTANGLE:
        const rectId = addElement({
          type: 'rectangle',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          strokeColor,
          fillColor,
          strokeWidth,
        });
        setSelectedElements([rectId]);
        break;
        
      case TOOLS.CIRCLE:
        const circleId = addElement({
          type: 'circle',
          x: pos.x,
          y: pos.y,
          radius: 0,
          strokeColor,
          fillColor,
          strokeWidth,
        });
        setSelectedElements([circleId]);
        break;
    }
  };

  const handleMouseMove = (e) => {
    // No need for preventDefault here as it's handled in the event listener
    
    handleCursorMove(e);
    
    if (!isDrawing || !canvasRef.current) return;
    
    const pos = getPointerPosition(e);
    
    
    if (selectedElements.length === 0) return;
    const elementId = selectedElements[0];
    const element = elements.find(el => el.id === elementId);
    
    if (!element) return;
    
    
    switch (element.type) {
      case 'path':
        updateElement(elementId, {
          points: [...element.points, [pos.x, pos.y]]
        });
        break;
        
      case 'rectangle':
        updateElement(elementId, {
          width: pos.x - element.x,
          height: pos.y - element.y
        });
        break;
        
      case 'circle':
        const dx = pos.x - element.x;
        const dy = pos.y - element.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        updateElement(elementId, { radius });
        break;
    }
  };

  const handleMouseUp = (e) => {
    // No need for preventDefault here as it's handled in the event listener
    
    setIsDrawing(false);
    handleCursorMove(e);
  };

  
  const currentUserName = roomData?.userName || '';

  // Add this useEffect to handle touch events with native event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleMouseDown(e);
    };
    
    const handleTouchMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleMouseMove(e);
    };
    
    const handleTouchEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleMouseUp(e);
    };
    
    // Add touch event listeners with passive: false explicitly
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      // Clean up event listeners
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Remote users' cursors */}
      <RemoteCursors currentUserName={currentUserName} />
    </div>
  );
};

export default Canvas; 