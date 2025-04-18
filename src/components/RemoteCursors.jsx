import React, { useEffect, useState } from 'react';
import { useAwareness } from '../hooks/useYjsBinding';
import { awareness, getCursorData } from '../lib/yjs-setup';

const RemoteCursors = ({ currentUserName }) => {
  const users = useAwareness();
  const [remoteCursors, setRemoteCursors] = useState([]);
  
  useEffect(() => {
    const updateRemoteCursors = () => {
      try {
        const allCursorData = getCursorData();
        
        const cursors = allCursorData
          .filter(data => {
            const isCurrentUser = data.userName === currentUserName;
            const hasCursor = data.cursor && 
                              typeof data.cursor.x === 'number' && 
                              typeof data.cursor.y === 'number' &&
                              !isNaN(data.cursor.x) && 
                              !isNaN(data.cursor.y);
            
            const isRecent = data.cursor && 
                           data.cursor.timestamp &&
                           (Date.now() - data.cursor.timestamp < 20000);
            
            return !isCurrentUser && hasCursor && isRecent;
          })
          .map(data => {
            const brightColors = [
              '#FF5733',
              '#33FF57',
              '#3357FF',
              '#FF33A8',
              '#33FFF5',
              '#F5FF33',
              '#A833FF',
              '#FF8C33'
            ];
            
            const clientIdNum = parseInt(data.clientId.toString().replace(/\D/g, '')) || 0;
            const colorIndex = clientIdNum % brightColors.length;
            const cursorColor = brightColors[colorIndex];
            
            return {
              clientID: data.clientId,
              name: data.userName,
              color: cursorColor,
              x: data.cursor.x,
              y: data.cursor.y,
              timestamp: data.cursor.timestamp || Date.now(),
              currentTool: data.currentTool
            };
          });
        
        setRemoteCursors(cursors);
      } catch (error) {
        console.error("Error updating remote cursors:", error);
      }
    };
    
    updateRemoteCursors();
    
    const intervalId = setInterval(updateRemoteCursors, 16);
    
    const handleAwarenessChange = () => {
      updateRemoteCursors();
    };
    
    if (awareness && awareness.on) {
      awareness.on('change', handleAwarenessChange);
    }
    
    return () => {
      clearInterval(intervalId);
      if (awareness && awareness.off) {
        awareness.off('change', handleAwarenessChange);
      }
    };
  }, [currentUserName]);

  const activeCursors = remoteCursors.filter(cursor => {
    return Date.now() - cursor.timestamp < 5000;
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {activeCursors.map(cursor => (
        <div 
          key={cursor.clientID}
          className="absolute flex flex-col items-start"
          style={{ 
            left: `${cursor.x}px`, 
            top: `${cursor.y}px`,
            zIndex: 9999,
            transform: 'translate(5px, 5px)'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 16 16" className="filter drop-shadow-md">
            <path 
              d="M0 0L16 8L8 16L0 0Z" 
              fill={cursor.color} 
            />
          </svg>
          
          <div 
            className="mt-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-sm bg-white bg-opacity-75"
            style={{ color: cursor.color }}
          >
            {cursor.name} {cursor.currentTool && `(${cursor.currentTool})`}
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-70 p-2 rounded text-xs text-gray-800 font-medium shadow-md">
        Remote cursors: {activeCursors.length}
      </div>
    </div>
  );
};

export default RemoteCursors; 