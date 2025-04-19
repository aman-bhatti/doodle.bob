import { useState, useEffect } from 'react';
import Canvas from './components/canvas/Canvas'
import Toolbar from './components/toolbar/Toolbar'
import RoomSelection from './components/RoomSelection'
import RoomInfo from './components/RoomInfo'
import TopBar from './components/TopBar/TopBar'
import { setRoomData, getSetupError } from './lib/yjs-setup'
import { DarkModeProvider } from './contexts/DarkModeContext';
import './App.css'
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [roomJoined, setRoomJoined] = useState(false);
  const [roomData, setAppRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log("App mounted, checking for room data");
      setLoading(true);
      
      const yjsError = getSetupError();
      if (yjsError) {
        console.error("YJS setup error detected:", yjsError);
        setError(yjsError);
        setLoading(false);
        return;
      }
      
      if (!localStorage.getItem('whiteboard-user-id')) {
        localStorage.setItem('whiteboard-user-id', uuidv4());
      }
      
      const newSessionId = Date.now().toString();
      
      const existingSessionId = sessionStorage.getItem('whiteboard-session-id');
      
      if (!existingSessionId) {
        console.log("New browser session detected, clearing room data");
        localStorage.removeItem('whiteboard-room-data');
        sessionStorage.setItem('whiteboard-session-id', newSessionId);
        setLoading(false);
        return;
      }
      
      console.log("Detected page refresh in existing tab session");
      
      const currentUrl = new URL(window.location.href);
      const roomCodeFromUrl = currentUrl.searchParams.get('room');
      
      const storedRoomData = localStorage.getItem('whiteboard-room-data');
      if (storedRoomData) {
        try {
          const parsedData = JSON.parse(storedRoomData);
          console.log("Found stored room data:", parsedData);
          
          if (parsedData && parsedData.roomCode && parsedData.userName) {
            console.log("Valid room data, rejoining room after refresh");
            
            const enhancedData = {
              ...parsedData,
              persistentId: localStorage.getItem('whiteboard-user-id'),
              sessionId: existingSessionId,
              isRefresh: true
            };
            
            setTimeout(() => {
              setAppRoomData(enhancedData);
              setRoomData(enhancedData);
              setRoomJoined(true);
            }, 100);
          } else {
            localStorage.removeItem('whiteboard-room-data');
          }
        } catch (e) {
          console.error("Error parsing stored room data:", e);
          localStorage.removeItem('whiteboard-room-data');
          setError("Failed to parse stored room data");
        }
      } 
      else if (roomCodeFromUrl) {
        console.log("Found room code in URL:", roomCodeFromUrl);
      }
      
    } catch (err) {
      console.error("Error in App initialization:", err);
      setError(`Initialization error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJoinRoom = (data) => {
    try {
      console.log("Joining room with data:", data);
      
      const roomDataWithIds = {
        ...data,
        persistentId: localStorage.getItem('whiteboard-user-id'),
        sessionId: sessionStorage.getItem('whiteboard-session-id'),
        isRefresh: false
      };
      
      localStorage.setItem('whiteboard-room-data', JSON.stringify(roomDataWithIds));
      
      const url = new URL(window.location.href);
      url.searchParams.set('room', data.roomCode);
      window.history.pushState({}, '', url.toString());
      
      setAppRoomData(roomDataWithIds);
      setRoomData(roomDataWithIds);
      setRoomJoined(true);
      
      setTimeout(() => {
        const yjsError = getSetupError();
        if (yjsError) {
          console.error("YJS setup error detected after joining:", yjsError);
          setError(yjsError);
        }
      }, 1000);
    } catch (err) {
      console.error("Error joining room:", err);
      setError(`Failed to join room: ${err.message}`);
    }
  };

  const handleLeaveRoom = () => {
    try {
      console.log("Leaving room");
      localStorage.removeItem('whiteboard-room-data');
      
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.pushState({}, '', url.toString());
      
      setRoomJoined(false);
      setAppRoomData(null);
      
      window.location.reload();
    } catch (err) {
      console.error("Error leaving room:", err);
      setError(`Failed to leave room: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading application...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Make sure the WebSocket server is running. Start it with:
            <pre className="bg-gray-100 p-2 mt-2 rounded">pnpm run server</pre>
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <DarkModeProvider>
      <div className="app dark:bg-gray-900 transition-colors duration-200">
        {roomJoined ? (
          <>
            <TopBar 
              roomData={{
                ...roomData,
                onLeaveRoom: handleLeaveRoom
              }} 
            />
            <div className="pt-12">
              <Canvas 
                roomData={roomData} 
                key={`canvas-${roomData?.roomCode}-${roomData?.userName}`}
              />
              <Toolbar />
              <RoomInfo 
                roomData={roomData} 
              />
            </div>
          </>
        ) : (
          <RoomSelection 
            onJoinRoom={handleJoinRoom} 
            initialRoomCode={new URL(window.location.href).searchParams.get('room')}
          />
        )}
      </div>
    </DarkModeProvider>
  )
}

export default App
