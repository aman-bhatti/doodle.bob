import { useWhiteboardStore, TOOLS } from '../../store/whiteboard';
import { useState, useEffect } from 'react';
import { updateCurrentTool } from '../../lib/yjs-setup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faMousePointer, faSquare, faCircle, faArrowsAlt, faTrash, faPalette, faRuler } from '@fortawesome/free-solid-svg-icons';

const Toolbar = () => {
  const {
    currentTool,
    setCurrentTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    clearCanvas,
  } = useWhiteboardStore();
  
  // State to manage color palette visibility on mobile
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showSizeControl, setShowSizeControl] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToolClick = (tool) => {
    setCurrentTool(tool);
    
    try {
      updateCurrentTool(tool);
    } catch (error) {
      console.debug("Unable to update tool in awareness");
    }
  };

  const handleStrokeWidthChange = (e) => {
    setStrokeWidth(parseInt(e.target.value, 10));
  };

  const colorPalette = [
    '#000000',
    '#FFFFFF',
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
  ];

  const toggleColorPalette = () => {
    setShowColorPalette(!showColorPalette);
    if (showSizeControl) setShowSizeControl(false);
  };
  
  const toggleSizeControl = () => {
    setShowSizeControl(!showSizeControl);
    if (showColorPalette) setShowColorPalette(false);
  };

  return (
    <>
      {/* Main toolbar */}
      <div className="fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-xl shadow-lg border border-gray-200 px-2 md:px-6 py-2 md:py-3 flex items-center gap-1 md:gap-5 max-w-full md:max-w-3xl overflow-x-auto touch-none">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all ${
              currentTool === TOOLS.SELECT 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleToolClick(TOOLS.SELECT)}
            title="Select"
          >
            <FontAwesomeIcon icon={faMousePointer} className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all ${
              currentTool === TOOLS.PEN 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleToolClick(TOOLS.PEN)}
            title="Pen"
          >
            <FontAwesomeIcon icon={faPen} className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all ${
              currentTool === TOOLS.RECTANGLE 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleToolClick(TOOLS.RECTANGLE)}
            title="Rectangle"
          >
            <FontAwesomeIcon icon={faSquare} className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all ${
              currentTool === TOOLS.CIRCLE 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleToolClick(TOOLS.CIRCLE)}
            title="Circle"
          >
            <FontAwesomeIcon icon={faCircle} className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all ${
              currentTool === TOOLS.PAN 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleToolClick(TOOLS.PAN)}
            title="Pan"
          >
            <FontAwesomeIcon icon={faArrowsAlt} className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        <div className="h-9 md:h-10 w-px bg-gray-200 mx-1"></div>

        {/* Color selector - on mobile, show toggle button */}
        {isMobile ? (
          <button
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              showColorPalette ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={toggleColorPalette}
            title="Colors"
          >
            <FontAwesomeIcon icon={faPalette} className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {colorPalette.map(color => (
              <button
                key={color}
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${color === '#FFFFFF' ? 'border border-gray-300' : ''} ${color === strokeColor ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setStrokeColor(color)}
                title={color}
              />
            ))}
          </div>
        )}

        <div className="h-9 md:h-10 w-px bg-gray-200 mx-1"></div>

        {/* Size control - on mobile, show toggle button */}
        {isMobile ? (
          <button
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              showSizeControl ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={toggleSizeControl}
            title="Stroke Width"
          >
            <FontAwesomeIcon icon={faRuler} className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={handleStrokeWidthChange}
              className="w-20 md:w-24 accent-blue-500"
            />
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <div 
                className="rounded-full bg-current" 
                style={{ 
                  width: `${Math.max(strokeWidth * 2, 4)}px`, 
                  height: `${Math.max(strokeWidth * 2, 4)}px`,
                  backgroundColor: strokeColor 
                }}
              ></div>
            </div>
          </div>
        )}

        <div className="h-9 md:h-10 w-px bg-gray-200 mx-1"></div>

        <button
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
          onClick={() => {
            if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
              clearCanvas();
            }
          }}
          title="Clear Canvas"
        >
          <FontAwesomeIcon icon={faTrash} className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>
      
      {/* Mobile color palette popup */}
      {isMobile && showColorPalette && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex flex-wrap justify-center gap-2 w-64">
          {colorPalette.map(color => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ${color === '#FFFFFF' ? 'border border-gray-300' : ''} ${color === strokeColor ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => {
                setStrokeColor(color);
                setShowColorPalette(false);
              }}
              title={color}
            />
          ))}
        </div>
      )}
      
      {/* Mobile size control popup */}
      {isMobile && showSizeControl && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-64">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm text-gray-600">1</span>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={handleStrokeWidthChange}
              className="w-40 accent-blue-500"
            />
            <span className="text-sm text-gray-600">10</span>
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <div 
                className="rounded-full" 
                style={{ 
                  width: `${Math.max(strokeWidth * 2, 4)}px`, 
                  height: `${Math.max(strokeWidth * 2, 4)}px`,
                  backgroundColor: strokeColor 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Toolbar;