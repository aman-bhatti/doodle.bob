#!/usr/bin/env node

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import http from "http";
import { setupWSConnection } from "y-websocket/bin/utils";
import * as Y from "yjs";

// Use environment variables with safe defaults for host and port
const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 5678;

const app = express();

// Serve static files from the frontend build
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "dist")));

// Fallback to index.html for SPA routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
  perMessageDeflate: false,
});

const connections = new Map();
const rooms = new Map();
const docs = new Map();
const clientIds = new Set();

const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      const clientId = connections.get(ws);

      if (clientId) {
        clientIds.delete(clientId);
      }

      if (ws.roomName) {
        const room = rooms.get(ws.roomName) || [];
        const updatedRoom = room.filter((client) => client !== ws);

        if (updatedRoom.length > 0) {
          rooms.set(ws.roomName, updatedRoom);
          console.log(`Room ${ws.roomName}: ${updatedRoom.length} users`);
        } else {
          rooms.delete(ws.roomName);
          console.log(`Room ${ws.roomName} removed (empty)`);

          const docName = ws.roomName;
          if (docs.has(docName)) {
            const doc = docs.get(docName);
            doc.destroy();
            docs.delete(docName);
            console.log(`Document for room ${docName} destroyed`);
          }
        }
      }

      connections.delete(ws);
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

const getYDoc = (docName) => {
  if (!docs.has(docName)) {
    const doc = new Y.Doc({ gc: true });
    docs.set(docName, doc);
  }
  return docs.get(docName);
};

const gcInterval = setInterval(() => {
  docs.forEach((doc, docName) => {
    if (rooms.has(docName)) {
      doc.gc();
    }
  });
}, 1800000);

wss.on("connection", (conn, req) => {
  conn.isAlive = true;

  conn.on("pong", () => {
    conn.isAlive = true;
  });

  const clientIdMatch = req.url.match(/\?.*clientId=([^&]*)/);
  const clientId = clientIdMatch ? clientIdMatch[1] : null;

  const persistentIdMatch = req.url.match(/\?.*persistentId=([^&]*)/);
  const persistentId = persistentIdMatch ? persistentIdMatch[1] : null;

  const userIdMatch = req.url.match(/\?.*userId=([^&]*)/);
  const userId = userIdMatch ? userIdMatch[1] : "Anonymous";

  const roomMatch = req.url.match(/\/([^?]*)/);
  const roomName = roomMatch && roomMatch[1] ? roomMatch[1] : "default";
  conn.roomName = roomName;

  conn.persistentId = persistentId;
  conn.userId = userId;

  if (clientId && clientIds.has(clientId)) {
    console.log(
      `Duplicate connection attempt from client ${clientId}. Closing.`,
    );
    conn.close();
    return;
  }

  const roomClients = rooms.get(roomName) || [];
  roomClients.push(conn);
  rooms.set(roomName, roomClients);

  if (clientId) {
    connections.set(conn, clientId);
    clientIds.add(clientId);
    console.log(
      `New client connected to room: ${roomName} (${roomClients.length} users) - ${userId}`,
    );
  }

  const ydoc = getYDoc(roomName);
  setupWSConnection(conn, req, {
    gc: true,
    doc: ydoc,
  });

  conn.on("close", () => {
    const clientId = connections.get(conn);
    if (clientId) {
      clientIds.delete(clientId);
    }

    connections.delete(conn);

    const room = rooms.get(roomName) || [];
    const updatedRoom = room.filter((client) => client !== conn);

    if (updatedRoom.length > 0) {
      rooms.set(roomName, updatedRoom);
      console.log(
        `Room ${roomName}: ${updatedRoom.length} users - ${userId} disconnected`,
      );
    } else {
      rooms.delete(roomName);
      console.log(
        `Room ${roomName} removed (empty) - Last user ${userId} disconnected`,
      );
    }
  });
});

server.listen(port, host, () => {
  console.log(`Y.js WebSocket server running on ws://${host}:${port}`);
});

process.on("SIGINT", () => {
  clearInterval(pingInterval);
  clearInterval(gcInterval);

  docs.forEach((doc) => doc.destroy());
  docs.clear();

  wss.close();
  server.close();
  process.exit(0);
});

