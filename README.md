# Collaborative Whiteboard

A real-time collaborative whiteboard application built with React, Vite, and Y.js. This application allows multiple users to draw, add shapes, and collaborate in real-time.

## Features

- Real-time collaboration with Y.js
- Support for drawing tools (pen, rectangle, circle)
- User presence awareness
- Local persistence with IndexedDB
- Responsive design

## Technologies Used

- React
- Vite
- Y.js for real-time collaboration
- y-websocket for WebSocket connections
- y-indexeddb for local persistence
- Zustand for state management
- TailwindCSS for styling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm

### Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/whiteboard.git
   cd whiteboard
   ```

2. Install dependencies

   ```
   pnpm install
   ```

3. Start the WebSocket server

   ```
   pnpm server
   ```

4. In a separate terminal, start the development server

   ```
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Deployment

To build the application for production:

```
pnpm build
```

The built files will be in the `dist` directory. You can deploy these files to any static hosting service.

You will also need to deploy the WebSocket server separately.
