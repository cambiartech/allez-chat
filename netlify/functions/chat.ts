import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { MongoClient } from 'mongodb';
import { IncomingMessage, ServerResponse } from 'http';

// MongoDB setup
const MONGODB_URI = process.env.MONGODB_URI || '';
const client = new MongoClient(MONGODB_URI);
let db: any;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    if (!db) {
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      await client.connect();
      db = client.db('allez-chat');
      console.log('Connected to MongoDB');
    }
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Message TTL index
async function setupMessagesTTL() {
  try {
    const db = await connectToDatabase();
    await db.collection('messages').createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: parseInt(process.env.MESSAGE_TTL || '3600') }
    );
    console.log('Message TTL index created');
  } catch (error) {
    console.error('Error setting up TTL index:', error);
  }
}

// Initialize Socket.IO server
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket'],
  path: '/socket.io'
});

// Chat room management
const chatRooms = new Map();

class ChatRoom {
  tripId: string;
  users: Map<string, any>;
  messages: any[];
  typingUsers: Set<string>;

  constructor(tripId: string) {
    this.tripId = tripId;
    this.users = new Map();
    this.messages = [];
    this.typingUsers = new Set();
  }

  async loadMessages() {
    try {
      const db = await connectToDatabase();
      const messages = await db.collection('messages')
        .find({ tripId: this.tripId })
        .sort({ timestamp: 1 })
        .toArray();
      
      this.messages = messages.map(msg => ({
        userId: msg.userId,
        userType: msg.userType,
        message: msg.message,
        timestamp: msg.timestamp.toISOString()
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  }

  async saveMessage(message: any) {
    try {
      const db = await connectToDatabase();
      await db.collection('messages').insertOne({
        tripId: this.tripId,
        ...message,
        timestamp: new Date(message.timestamp)
      });
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }
}

// Socket.IO event handlers
io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', async ({ tripId, userId, userType }) => {
    try {
      console.log('Join room request:', { tripId, userId, userType });
      
      if (!chatRooms.has(tripId)) {
        chatRooms.set(tripId, new ChatRoom(tripId));
      }

      const room = chatRooms.get(tripId);
      await room.loadMessages();

      socket.join(tripId);
      room.users.set(socket.id, { userId, userType });

      console.log('User joined room:', { tripId, userId, userType });
      
      socket.emit('room_history', {
        messages: room.messages,
        users: Array.from(room.users.values())
      });
    } catch (error) {
      console.error('Error in join_room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const { tripId, message, userType, userId } = data;
      console.log('Received message:', data);

      const room = chatRooms.get(tripId);
      if (!room) {
        throw new Error('Room not found');
      }

      const messageData = {
        userId,
        userType,
        message,
        timestamp: new Date().toISOString()
      };

      await room.saveMessage(messageData);
      io.to(tripId).emit('receive_message', messageData);
    } catch (error) {
      console.error('Error in send_message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing_start', ({ tripId, userId, userType }) => {
    const room = chatRooms.get(tripId);
    if (!room) return;

    room.typingUsers.add(socket.id);
    const typingUsers = Array.from(room.typingUsers)
      .map(id => room.users.get(id))
      .filter(Boolean);

    socket.to(tripId).emit('typing_status', { typingUsers });
  });

  socket.on('typing_stop', ({ tripId }) => {
    const room = chatRooms.get(tripId);
    if (!room) return;

    room.typingUsers.delete(socket.id);
    const typingUsers = Array.from(room.typingUsers)
      .map(id => room.users.get(id))
      .filter(Boolean);

    socket.to(tripId).emit('typing_status', { typingUsers });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    chatRooms.forEach((room, tripId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        room.typingUsers.delete(socket.id);
        
        const typingUsers = Array.from(room.typingUsers)
          .map(id => room.users.get(id))
          .filter(Boolean);
        
        socket.to(tripId).emit('typing_status', { typingUsers });
      }
    });
  });
});

// Start the server
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
  setupMessagesTTL().catch(console.error);
});

// Netlify Function handler
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle WebSocket upgrade
  if (event.httpMethod === 'GET') {
    if (event.headers.upgrade?.toLowerCase() === 'websocket') {
      const wsKey = event.headers['sec-websocket-key'];
      // Create a custom response for WebSocket upgrade
      return {
        statusCode: 101,
        headers: {
          'upgrade': 'websocket',
          'connection': 'Upgrade',
          'sec-websocket-accept': wsKey || ''
        },
        body: ''
      };
    }

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': process.env.CORS_ORIGIN || '*',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        message: 'WebSocket server is running',
        env: process.env.NODE_ENV,
        cors_origin: process.env.CORS_ORIGIN
      })
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Method not allowed' })
  };
}; 