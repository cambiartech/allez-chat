import { Handler } from '@netlify/functions';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { MongoClient } from 'mongodb';

// MongoDB setup
const client = new MongoClient(process.env.MONGODB_URI || '');
let db: any;

// Connect to MongoDB
async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db('allez-chat');
    console.log('Connected to MongoDB');
  }
  return db;
}

// Message TTL index
async function setupMessagesTTL() {
  const db = await connectToDatabase();
  await db.collection('messages').createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: parseInt(process.env.MESSAGE_TTL || '3600') }
  );
}

// Initialize Socket.IO server
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
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
  }

  async saveMessage(message: any) {
    const db = await connectToDatabase();
    await db.collection('messages').insertOne({
      tripId: this.tripId,
      ...message,
      timestamp: new Date(message.timestamp)
    });
  }
}

// Socket.IO event handlers
io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', async ({ tripId, userId, userType }) => {
    if (!chatRooms.has(tripId)) {
      chatRooms.set(tripId, new ChatRoom(tripId));
    }

    const room = chatRooms.get(tripId);
    await room.loadMessages();

    socket.join(tripId);
    room.users.set(socket.id, { userId, userType });

    socket.emit('room_history', {
      messages: room.messages,
      users: Array.from(room.users.values())
    });
  });

  socket.on('send_message', async ({ tripId, message, userType, userId }) => {
    const room = chatRooms.get(tripId);
    if (!room) return;

    const messageData = {
      userId,
      userType,
      message,
      timestamp: new Date().toISOString()
    };

    await room.saveMessage(messageData);
    io.to(tripId).emit('receive_message', messageData);
  });

  socket.on('typing', ({ tripId, isTyping }) => {
    const room = chatRooms.get(tripId);
    if (!room) return;

    room.typingUsers[isTyping ? 'add' : 'delete'](socket.id);
    const typingUsers = Array.from(room.typingUsers)
      .map(id => room.users.get(id))
      .filter(Boolean);

    socket.to(tripId).emit('typing_status', { typingUsers });
  });

  socket.on('disconnect', () => {
    chatRooms.forEach((room, tripId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        room.typingUsers.delete(socket.id);
      }
    });
  });
});

// Start the server
httpServer.listen(process.env.PORT || 3000);

// Netlify Function handler
export const handler: Handler = async (event, context) => {
  // This is just a placeholder response since we're using WebSocket
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'WebSocket server is running' })
  };
}; 