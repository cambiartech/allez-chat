const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const axios = require('axios'); // Add axios for API calls
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allez-chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

class ChatRoom {
  constructor(tripId) {
    this.tripId = tripId;
    this.users = new Map(); // socketId -> user info
    this.messages = [];
    this.typingUsers = new Set();
  }

  addUser(socketId, userInfo) {
    this.users.set(socketId, userInfo);
  }

  removeUser(socketId) {
    const user = this.users.get(socketId);
    this.users.delete(socketId);
    this.typingUsers.delete(socketId);
    return user;
  }

  async addMessage(message) {
    try {
      // Save to MongoDB (only non-system messages)
      const newMessage = new Message({
        tripId: this.tripId,
        userId: message.userId,
        userType: message.userType,
        firstName: message.firstName,
        message: message.message,
        timestamp: new Date(message.timestamp),
        isSystemMessage: message.isSystemMessage || false
      });
      await newMessage.save();
      console.log('Message saved to MongoDB:', message);
    } catch (err) {
      console.error('Error saving message to MongoDB:', err);
    }

    // Keep in memory for immediate access
    this.messages.push(message);
    // Keep last 50 messages in memory
    if (this.messages.length > 50) {
      this.messages.shift();
    }
  }

  setTyping(socketId, isTyping) {
    if (isTyping) {
      this.typingUsers.add(socketId);
    } else {
      this.typingUsers.delete(socketId);
    }
  }

  getTypingUsers() {
    return Array.from(this.typingUsers).map(socketId => this.users.get(socketId));
  }

  async loadRecentMessages() {
    try {
      console.log('Loading messages for trip:', this.tripId);
      // Get messages from MongoDB, excluding system messages
      const recentMessages = await Message.find({ 
        tripId: this.tripId,
        isSystemMessage: { $ne: true } // Exclude system messages
      })
        .sort({ timestamp: 1 }) // Sort by timestamp ascending (oldest first)
        .limit(50) // Limit to last 50 messages
        .lean();
      
      console.log('Found messages in MongoDB:', recentMessages.length);
      
      // Convert to proper format and ensure chronological order
      this.messages = recentMessages
        .map(msg => ({
          userId: msg.userId,
          userType: msg.userType,
          firstName: msg.firstName || (msg.userType === 'driver' ? 'Driver' : msg.userType === 'rider' ? 'Rider' : 'Admin'),
          message: msg.message,
          timestamp: msg.timestamp.toISOString()
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Ensure proper chronological order
    } catch (err) {
      console.error('Error loading messages from MongoDB:', err);
    }
  }
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active chat rooms
const chatRooms = new Map(); // tripId -> ChatRoom

// Function to send count update to external API
async function sendCountUpdate(tripId, recipientId, recipientType, senderId, senderType, count) {
  try {
    const apiUrl = process.env.ALLEZ_API_URL || 'http://allez.us-east-1.elasticbeanstalk.com/api/chat/count-update';
    const apiKey = process.env.ALLEZ_API_KEY || 'HKeGw>L/v9-3W4/';
    
    const response = await axios.post(apiUrl, {
      tripId: tripId,
      recipientId: recipientId,
      recipientType: recipientType,
      count: count,
      senderId: senderId,
      senderType: senderType
    }, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });
    
    console.log(`Count update sent successfully for trip ${tripId}:`, response.data);
  } catch (error) {
    console.error(`Failed to send count update for trip ${tripId}:`, error.message);
    // Don't throw error - we don't want to break chat functionality if API is down
  }
}

// Function to get unread message count for a user in a trip
async function getUnreadMessageCount(tripId, userId, userType) {
  try {
    const unreadHours = parseInt(process.env.UNREAD_COUNT_HOURS) || 24;
    
    // For now, we'll use a simple count of recent messages not sent by this user
    // You might want to implement a more sophisticated unread tracking system
    const count = await Message.countDocuments({
      tripId: tripId,
      userId: { $ne: userId }, // Messages not sent by this user
      isSystemMessage: { $ne: true },
      // You could add a 'readBy' field to track actual read status
      timestamp: { $gte: new Date(Date.now() - unreadHours * 60 * 60 * 1000) } // Configurable hours
    });
    
    return Math.min(count, 99); // Cap at 99 for UI purposes
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 1; // Default to 1 if we can't calculate
  }
}

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a chat room
  socket.on('join_room', async ({ tripId, userType, userId, firstName }) => {
    console.log(`User ${userId} (${userType}) joining room ${tripId}`);
    
    // Create room if it doesn't exist
    if (!chatRooms.has(tripId)) {
      chatRooms.set(tripId, new ChatRoom(tripId));
    }
    
    const room = chatRooms.get(tripId);
    
    // Load recent messages before adding user
    await room.loadRecentMessages();
    console.log('Loaded messages for room:', room.messages.length);
    
    socket.join(tripId);
    room.addUser(socket.id, { userId, userType, firstName: firstName || (userType === 'driver' ? 'Driver' : userType === 'rider' ? 'Rider' : 'Admin') });
    
    // Send room history to user
    socket.emit('room_history', {
      messages: room.messages,
      users: Array.from(room.users.values())
    });
  });

  // Handle chat messages
  socket.on('send_message', async ({ tripId, message, userType, userId, firstName }) => {
    const room = chatRooms.get(tripId);
    if (!room) return;

    const messageData = {
      userId,
      userType,
      firstName: firstName || (userType === 'driver' ? 'Driver' : userType === 'rider' ? 'Rider' : 'Admin'),
      message,
      timestamp: new Date().toISOString(),
      isSystemMessage: false
    };

    await room.addMessage(messageData);
    io.to(tripId).emit('receive_message', messageData);

    // Send count updates to recipients (users who didn't send the message)
    try {
      const currentUsers = Array.from(room.users.values());
      console.log(`Processing count updates for ${currentUsers.length} users in trip ${tripId}`);
      
      for (const user of currentUsers) {
        // Skip the sender
        if (user.userId === userId) {
          console.log(`Skipping sender ${userId} for count update`);
          continue;
        }
        
        console.log(`Calculating unread count for user ${user.userId} (${user.userType})`);
        // Get unread count for this recipient
        const unreadCount = await getUnreadMessageCount(tripId, user.userId, user.userType);
        
        console.log(`Sending count update: trip=${tripId}, recipient=${user.userId} (${user.userType}), sender=${userId} (${userType}), count=${unreadCount}`);
        
        // Send count update to external API
        await sendCountUpdate(
          tripId,
          user.userId,
          user.userType === 'rider' ? 'passenger' : user.userType, // Convert 'rider' to 'passenger' for API
          userId,
          userType === 'rider' ? 'passenger' : userType, // Convert 'rider' to 'passenger' for API
          unreadCount
        );
      }
    } catch (error) {
      console.error('Error sending count updates:', error);
      // Don't break the chat functionality if count updates fail
    }
  });

  // Handle typing status
  socket.on('typing', ({ tripId, isTyping }) => {
    const room = chatRooms.get(tripId);
    if (!room) return;

    room.setTyping(socket.id, isTyping);
    const typingUsers = room.getTypingUsers();
    socket.to(tripId).emit('typing_status', { typingUsers });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    chatRooms.forEach((room, tripId) => {
      room.removeUser(socket.id);
    });
    console.log('Client disconnected:', socket.id);
  });
});

// Add an endpoint to check message history
app.get('/messages/:tripId', async (req, res) => {
  try {
    const messages = await Message.find({ 
      tripId: req.params.tripId,
      isSystemMessage: { $ne: true } // Exclude system messages
    })
      .sort({ timestamp: 1 })
      .lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 