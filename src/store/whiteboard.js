import { create } from 'zustand';
import { whiteboard, awareness, doc } from '../lib/yjs-setup';


export const TOOLS = {
  SELECT: 'select',
  PEN: 'pen',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TEXT: 'text',
  ERASER: 'eraser',
  PAN: 'pan',
};


export const useWhiteboardStore = create((set, get) => ({
  
  currentTool: TOOLS.SELECT,
  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  
  strokeColor: '#000000',
  setStrokeColor: (color) => set({ strokeColor: color }),
  
  fillColor: '#ffffff',
  setFillColor: (color) => set({ fillColor: color }),
  
  strokeWidth: 2,
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  
  
  zoom: 1,
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.1), 10) }), 
  
  pan: { x: 0, y: 0 },
  setPan: (pan) => set({ pan }),
  
  
  selectedElements: [],
  setSelectedElements: (elements) => set({ selectedElements: elements }),
  
  
  isDrawing: false,
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  
  
  awarenessStates: [],
  setAwarenessStates: (states) => set({ awarenessStates: states }),
  
  
  mainCanvas: null,
  setMainCanvas: (canvas) => set({ mainCanvas: canvas }),
  
  bgCanvas: null,
  setBgCanvas: (canvas) => set({ bgCanvas: canvas }),
  
  
  addElement: (element) => {
    const id = crypto.randomUUID();
    whiteboard.set(id, { ...element, id });
    return id;
  },
  
  
  updateElement: (id, updates) => {
    const element = whiteboard.get(id);
    if (element) {
      whiteboard.set(id, { ...element, ...updates });
    }
  },
  
  
  deleteElements: (ids) => {
    ids.forEach(id => whiteboard.delete(id));
  },
  
  
  clearCanvas: () => {
    whiteboard.forEach((value, key) => {
      whiteboard.delete(key);
    });
    set({ selectedElements: [] });
  },
  
  
  getAllElements: () => {
    const elements = [];
    whiteboard.forEach((value, key) => {
      elements.push({ ...value, id: key });
    });
    return elements;
  },
  
  
  updateAwarenessStates: () => {
    if (!awareness || !awareness.getStates) return;
    
    try {
      const states = Array.from(awareness.getStates().entries());
      set({ awarenessStates: states });
    } catch (error) {
      console.error("Error updating awareness states:", error);
    }
  },
  
  
  renderCursors: (ctx) => {
    const state = get();
    const dpr = window.devicePixelRatio || 1;
    
    
    state.awarenessStates.forEach(([clientID, state]) => {
      if (state.cursor && clientID !== doc.clientID) {
        const cursor = state.cursor;
        const user = state.user || { name: 'Anonymous', color: '#3B82F6' };
        
        
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
        
        
        const clientIdNum = parseInt(clientID.toString().replace(/\D/g, '')) || 0;
        const colorIndex = clientIdNum % brightColors.length;
        const cursorColor = brightColors[colorIndex];
        
        ctx.save();
        
        
        ctx.translate(cursor.x, cursor.y);
        ctx.fillStyle = cursorColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(16, 8);
        ctx.lineTo(8, 16);
        ctx.closePath();
        ctx.fill();
        
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = cursorColor;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        
        
        const name = user.name + (user.currentTool ? ` (${user.currentTool})` : '');
        const textWidth = ctx.measureText(name).width;
        const textHeight = 20;
        const padding = 6;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, textWidth + padding * 2, textHeight + padding);
        
        
        ctx.fillStyle = cursorColor;
        ctx.fillText(name, 10 + padding, 10 + textHeight);
        
        ctx.restore();
      }
    });
  },
  
  
  renderCanvas: () => {
    const state = get();
    if (!state.mainCanvas) return;
    
    const ctx = state.mainCanvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    
    state.updateAwarenessStates();
    
    
    state.getAllElements().forEach(element => {
      if (!element) return;
      state.drawElement(element, ctx);
    });
    
    
    state.renderCursors(ctx);
  },
  
  
  drawElement: (element, ctx) => {
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
  }
})); 