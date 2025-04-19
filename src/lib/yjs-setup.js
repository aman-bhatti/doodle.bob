import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { generateColor } from '../utils/helpers';

let setupError = null;
let doc = null;
let whiteboard = null;
let awareness = {
  setLocalStateField: () => {}, 
  on: () => {}, 
  off: () => {}, 
  removeState: () => {}, 
  getLocalState: () => ({}), 
  getStates: () => new Map() 
};
let setRoomData = () => {};
let updateCursorPosition = () => {};
let updateCurrentTool = () => {};
let isOnline = () => false;
let getSetupError = () => setupError;

let lastCursorUpdate = 0;
const CURSOR_THROTTLE_MS = 10;

let activeWebsocketConnections = new Map();

let shouldInitializeImmediately = false;

let userPersistence = { 
  saveUserData: (userData) => {
    if (!userData) return;
    try {
      const dataToStore = {
        userName: userData.userName || 'Anonymous',
        persistentId: userData.persistentId,
        roomCode: userData.roomCode,
        color: userData.color
      };
      
      if (userData.userName && userData.userName !== 'Anonymous') {
        localStorage.setItem('whiteboard-username', userData.userName);
      }
      
      localStorage.setItem('whiteboard-user-persistence', JSON.stringify(dataToStore));
      console.log('Saved user data for persistence:', dataToStore);
    } catch (e) {
      console.error('Error saving user data:', e);
    }
  },
  
  loadUserData: () => {
    try {
      const savedData = localStorage.getItem('whiteboard-user-persistence');
      if (savedData) {
        const userData = JSON.parse(savedData);
        console.log('Loaded persisted user data:', userData);
        return userData;
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
    return null;
  },
  
  getUsername: () => {
    try {
      const directUsername = localStorage.getItem('whiteboard-username');
      if (directUsername) {
        return directUsername;
      }
      
      const savedData = localStorage.getItem('whiteboard-user-persistence');
      if (savedData) {
        const userData = JSON.parse(savedData);
        if (userData.userName && userData.userName !== 'Anonymous') {
          return userData.userName;
        }
      }
    } catch (e) {
      console.error('Error getting username:', e);
    }
    return null;
  }
};

export const getCursorData = () => {
  try {
    if (!awareness || !awareness.getStates) {
      return [];
    }
    
    const states = Array.from(awareness.getStates().entries());
    return states.map(([clientId, state]) => ({
      clientId,
      userName: state.user?.name || 'Anonymous',
      cursor: state.cursor || null,
      currentTool: state.user?.currentTool
    }));
  } catch (error) {
    console.error("Error getting cursor data:", error);
    return [];
  }
};

try {
  doc = new Y.Doc();
  whiteboard = doc.getMap('whiteboard');
  
  let roomData = {
    roomCode: 'DEFAULT',
    userName: 'Anonymous',
    isCreator: false
  };
  
  setRoomData = (data) => {
    try {
      if (data && data.roomCode) {
        const isRefresh = data.isRefresh === true;
        
        roomData = data;
        
        userPersistence.saveUserData({
          userName: data.userName,
          persistentId: data.persistentId,
          roomCode: data.roomCode
        });
        
        if (websocketProvider) {
          try {
            websocketProvider.disconnect();
            const key = `${roomData.roomCode}-${doc.clientID}`;
            activeWebsocketConnections.delete(key);
          } catch (e) {
            console.error("Error disconnecting websocket:", e);
          }
        }
        
        if (indexeddbProvider) {
          try {
            indexeddbProvider.destroy();
          } catch (e) {
            console.error("Error destroying indexeddb:", e);
          }
        }
        
        if (doc) {
          doc.destroy();
        }
        
        doc = new Y.Doc();
        whiteboard = doc.getMap('whiteboard');
        
        if (data.isCreator && !isRefresh) {
          console.log('New room creation detected, clearing IndexedDB');
          clearRoomIndexedDB(data.roomCode);
        } else {
          console.log('Existing room or refresh detected, preserving IndexedDB data');
        }
        
        initializeProviders();
      } else {
        console.error("Invalid room data:", data);
      }
    } catch (err) {
      console.error("Error in setRoomData:", err);
      setupError = err.message;
    }
  };
  
  const clearRoomIndexedDB = (roomCode) => {
    try {
      const request = indexedDB.deleteDatabase(`whiteboard-${roomCode}`);
      
      request.onerror = () => {
        console.error(`Error deleting IndexedDB for room ${roomCode}`);
      };
      
      request.onsuccess = () => {
      };
    } catch (error) {
      console.error("Error clearing room IndexedDB:", error);
    }
  };
  
  let websocketProvider = null;
  let indexeddbProvider = null;
  
  const currentClientId = doc.clientID;
  
  const logAwarenessState = () => {
    try {
    } catch (e) {
      console.error("Error logging awareness state:", e);
    }
  };
  
  const initializeProviders = () => {
    try {
      console.log('Initializing providers with room data:', roomData);
      
      const connectionKey = `${roomData.roomCode}-${currentClientId}`;
      
      if (activeWebsocketConnections.has(connectionKey)) {
        websocketProvider = activeWebsocketConnections.get(connectionKey);
        awareness = websocketProvider.awareness;
        return;
      }
      
      const userColor = generateColor();
      
      // Use a relative WebSocket URL for better production compatibility
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = import.meta.env.PROD ? 
        import.meta.env.VITE_WS_URL || window.location.host : 
        'localhost:5678';
      const wsServerUrl = `${wsProtocol}//${wsHost}`;
      
      const roomName = `whiteboard-${roomData.roomCode}`;
      
      const persistedUserData = userPersistence.loadUserData();
      
      const persistentUserId = 
        roomData.persistentId || 
        localStorage.getItem('whiteboard-user-id') || 
        (persistedUserData?.persistentId) || 
        Date.now().toString();
        
      localStorage.setItem('whiteboard-user-id', persistentUserId);
      
      const storedUsername = userPersistence.getUsername();
      const userName = roomData.userName || storedUsername || persistedUserData?.userName || 'Anonymous';
      
      if (userName && userName !== 'Anonymous') {
        localStorage.setItem('whiteboard-username', userName);
      }
      
      console.log('Connecting with identity:', { 
        userName, 
        persistentId: persistentUserId,
        roomCode: roomData.roomCode 
      });
      
      websocketProvider = new WebsocketProvider(
        wsServerUrl,
        roomName,
        doc,
        { 
          params: { 
            userId: userName,
            clientId: currentClientId,
            persistentId: persistentUserId
          },
          WebSocketPolyfill: WebSocket
        }
      );
      
      activeWebsocketConnections.set(connectionKey, websocketProvider);
      
      websocketProvider.on('status', ({ status }) => {
        if (status === 'connected') {
          if (persistentUserId) {
            localStorage.setItem('whiteboard-user-id', persistentUserId);
            
            userPersistence.saveUserData({
              userName: userName,
              persistentId: persistentUserId,
              roomCode: roomData.roomCode,
              color: userColor
            });
            
            roomData.userName = userName;
            roomData.persistentId = persistentUserId;
            
            try {
              const roomDataToStore = {
                ...roomData,
                userName: userName,
                persistentId: persistentUserId
              };
              localStorage.setItem('whiteboard-room-data', JSON.stringify(roomDataToStore));
            } catch (e) {
              console.error("Error storing updated room data:", e);
            }
          }
        }
      });
      
      websocketProvider.on('connection-error', (err) => {
        console.error("WebSocket connection error:", err);
        setupError = "Failed to connect to WebSocket server. Please ensure the server is running.";
      });
      
      try {
        indexeddbProvider = new IndexeddbPersistence(`whiteboard-${roomData.roomCode}`, doc);
        
        indexeddbProvider.on('synced', () => {
          
          const isRefresh = roomData.isRefresh === true;
          
          if (roomData.isCreator && !isRefresh) {
            console.log('New room creation, clearing whiteboard data');
            doc.transact(() => {
              whiteboard.forEach((value, key) => {
                whiteboard.delete(key);
              });
            });
          } else {
            console.log('Rejoining existing room or refresh, preserving whiteboard data');
          }
        });
      } catch (e) {
        console.error("Error initializing IndexedDB:", e);
      }
      
      localStorage.setItem('whiteboard-user-clientId', currentClientId);
      
      awareness = websocketProvider.awareness;
      
      websocketProvider.awareness.setLocalStateField('user', {
        name: userName,
        color: userColor,
        currentTool: 'select',
        id: userName,
        persistentId: persistentUserId
      });
      
      websocketProvider.awareness.setLocalStateField('cursor', {
        x: 0,
        y: 0,
        timestamp: Date.now()
      });
      
      setTimeout(() => {
      }, 1000);
      
      doc.on('destroy', () => {
        try {
          websocketProvider.disconnect();
          websocketProvider.awareness.destroy();
        } catch (e) {
          console.error("Error during document destroy:", e);
        }
      });
      
      websocketProvider.awareness.on('change', () => {
      });
      
      websocketProvider.on('status', ({ status }) => {
        if (status === 'connected') {
          setTimeout(() => {
            try {
              const states = Array.from(websocketProvider.awareness.getStates().entries());
              
              const ourPersistentId = roomData.persistentId || localStorage.getItem('whiteboard-user-id');
              
              states.forEach(([clientId, state]) => {
                if (clientId !== currentClientId && 
                    state.user && 
                    state.user.name === roomData.userName && 
                    state.user.persistentId !== ourPersistentId) {
                  try {
                    if (websocketProvider.awareness.removeState) {
                      websocketProvider.awareness.removeState(clientId);
                    } else if (websocketProvider.awareness._states) {
                      websocketProvider.awareness._states.delete(clientId);
                      websocketProvider.awareness.emit('change', [clientId]);
                    }
                  } catch (err) {
                    console.error("Error removing stale state:", err);
                  }
                }
              });
              
              logAwarenessState();
            } catch (e) {
              console.error("Error during stale state cleanup:", e);
            }
          }, 2000);
        }
      });
      
      window.addEventListener('beforeunload', () => {
        try {
          if (websocketProvider) {
            websocketProvider.disconnect();
            const key = `${roomData.roomCode}-${doc.clientID}`;
            activeWebsocketConnections.delete(key);
            websocketProvider.awareness.destroy();
          }
        } catch (e) {
          console.error("Error during beforeunload:", e);
        }
      });
      
      if (websocketProvider) {
        websocketProvider.awareness.setLocalStateField = function setLocalStateField(field, value) {
          const y = this._y;
          const clientID = y.clientID;
          const prevState = this._states.get(clientID) || {};
          if (field !== 'cursor') {
            console.log(`Setting local state field ${field}:`, value);
          }
          this._states.set(clientID, {
            ...prevState,
            [field]: value
          });
          
          const changedClients = [clientID];
          this._submitUpdateMessage(changedClients);
        }
      }
    } catch (err) {
      console.error("Error initializing providers:", err);
      setupError = `Failed to initialize collaboration: ${err.message}`;
    }
  };
  
  if (shouldInitializeImmediately) {
    initializeProviders();
  }
  
  updateCursorPosition = (x, y) => {
    try {
      const now = Date.now();
      
      if (now - lastCursorUpdate < CURSOR_THROTTLE_MS) {
        return;
      }
      
      lastCursorUpdate = now;
      
      if (websocketProvider && typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
        
        const currentState = websocketProvider.awareness.getLocalState() || {};
        const userData = currentState.user || {};
        
        websocketProvider.awareness.setLocalState({
          ...currentState,
          cursor: { 
            x, 
            y,
            timestamp: now
          },
          user: {
            ...userData,
            lastActive: now
          }
        });
      }
    } catch (error) {
      console.error("Error updating cursor position:", error);
    }
  };
  
  updateCurrentTool = (tool) => {
    try {
      if (!websocketProvider || !websocketProvider.awareness) return;
      
      if (!websocketProvider.awareness.getLocalState) {
        return;
      }
      
      const currentState = websocketProvider.awareness.getLocalState() || {};
      const currentUser = currentState.user || {};
      
      websocketProvider.awareness.setLocalState({
        ...currentState,
        user: {
          ...currentUser,
          currentTool: tool
        }
      });
    } catch (error) {
      console.error("Error updating current tool:", error);
    }
  };
  
  isOnline = () => websocketProvider && websocketProvider.wsconnected;
  
  getSetupError = () => setupError;

} catch (err) {
  console.error("Critical error in YJS setup:", err);
  setupError = `Critical YJS initialization error: ${err.message}`;
  
}

export {
  doc,
  whiteboard,
  awareness,
  setRoomData,
  updateCursorPosition,
  updateCurrentTool,
  isOnline,
  getSetupError
}; 