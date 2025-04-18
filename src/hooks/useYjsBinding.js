import { useEffect, useState, useRef } from 'react';
import { whiteboard, awareness } from '../lib/yjs-setup';

export function useWhiteboardElements() {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const initialElements = [];
    whiteboard.forEach((value, key) => {
      initialElements.push({ ...value, id: key });
    });
    setElements(initialElements);

    const observer = () => {
      const updatedElements = [];
      whiteboard.forEach((value, key) => {
        updatedElements.push({ ...value, id: key });
      });
      setElements(updatedElements);
    };

    whiteboard.observe(observer);
    
    return () => {
      whiteboard.unobserve(observer);
    };
  }, []);

  return elements;
}

export function useAwareness() {
  const [users, setUsers] = useState([]);
  const usersRef = useRef([]);

  useEffect(() => {
    const getUsers = () => {
      const users = [];
      
      if (!awareness.getStates) {
        return users;
      }
      
      try {
        awareness.getStates().forEach((state, clientID) => {
          if (state.user) {
            users.push({
              clientID,
              ...state.user
            });
          }
        });
      } catch (error) {
        console.error("Error getting awareness states:", error);
      }
      
      return users;
    };

    const initialUsers = getUsers();
    setUsers(initialUsers);
    usersRef.current = initialUsers;

    let debounceTimeout = null;
    
    const handleChange = () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      debounceTimeout = setTimeout(() => {
        const updatedUsers = getUsers();
        
        const usersChanged = 
          updatedUsers.length !== usersRef.current.length || 
          updatedUsers.some((user, i) => 
            usersRef.current[i]?.clientID !== user.clientID
          );
        
        if (usersChanged) {
          setUsers(updatedUsers);
          usersRef.current = updatedUsers;
        }
      }, 300);
    };

    if (awareness.on) {
      awareness.on('change', handleChange);
    }
    
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      if (awareness.off) {
        awareness.off('change', handleChange);
      }
    };
  }, []);

  return users;
} 