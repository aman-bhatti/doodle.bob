import { useState } from 'react';
import { formatRoomCode } from '../utils/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

const RoomInfo = ({ roomData }) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyCode = () => {
    if (roomData && roomData.roomCode) {
      navigator.clipboard.writeText(roomData.roomCode);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className="fixed top-16 right-6 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Room Code:</div>
            <div className="text-xl font-mono font-bold tracking-wider text-black dark:text-white">
              {formatRoomCode(roomData?.roomCode)}
            </div>
          </div>
          <button 
            onClick={handleCopyCode}
            className="ml-4 p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-400 rounded-md transition-colors"
            title="Copy Room Code"
          >
            <FontAwesomeIcon icon={faCopy} className="h-5 w-5" />
          </button>
        </div>
        {showCopied && (
          <div className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
            Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomInfo; 