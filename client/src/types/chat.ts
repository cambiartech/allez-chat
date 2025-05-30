export interface Message {
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  message: string;
  timestamp: string;
}

export interface User {
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
}

export interface ChatState {
  messages: Message[];
  typingUsers: User[];
  isConnected: boolean;
}

export interface TypingUser {
  userId: string;
  userType: string;
} 