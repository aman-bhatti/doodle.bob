import { useWhiteboardStore, TOOLS } from '../../store/whiteboard';
import { useState } from 'react';
import { updateCurrentTool } from '../../lib/yjs-setup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faMousePointer, faSquare, faCircle, faArrowsAlt, faTrash } from '@fortawesome/free-solid-svg-icons';

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

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-3 flex items-center gap-5 max-w-3xl">
      <div className="flex items-center gap-2">
        <button
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            currentTool === TOOLS.SELECT 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handleToolClick(TOOLS.SELECT)}
          title="Select"
        >
          <FontAwesomeIcon icon={faMousePointer} className="h-5 w-5" />
        </button>
        <button
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            currentTool === TOOLS.PEN 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handleToolClick(TOOLS.PEN)}
          title="Pen"
        >
          <FontAwesomeIcon icon={faPen} className="h-5 w-5" />
        </button>
        <button
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            currentTool === TOOLS.RECTANGLE 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handleToolClick(TOOLS.RECTANGLE)}
          title="Rectangle"
        >
          <FontAwesomeIcon icon={faSquare} className="h-5 w-5" />
        </button>
        <button
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            currentTool === TOOLS.CIRCLE 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handleToolClick(TOOLS.CIRCLE)}
          title="Circle"
        >
          <FontAwesomeIcon icon={faCircle} className="h-5 w-5" />
        </button>
        <button
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            currentTool === TOOLS.PAN 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handleToolClick(TOOLS.PAN)}
          title="Pan"
        >
          <FontAwesomeIcon icon={faArrowsAlt} className="h-5 w-5" />
        </button>
      </div>

      <div className="h-10 w-px bg-gray-200"></div>

      <div className="flex items-center gap-2">
        {colorPalette.map(color => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${color === '#FFFFFF' ? 'border border-gray-300' : ''} ${color === strokeColor ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setStrokeColor(color)}
            title={color}
          />
        ))}
      </div>

      <div className="h-10 w-px bg-gray-200"></div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={handleStrokeWidthChange}
          className="w-24 accent-blue-500"
        />
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
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

      <div className="h-10 w-px bg-gray-200"></div>

      <button
        className="w-10 h-10 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
        onClick={() => {
          if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
            clearCanvas();
          }
        }}
        title="Clear Canvas"
      >
        <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toolbar;