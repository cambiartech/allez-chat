export interface Message {
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  firstName?: string;
  otherName?: string;
  driverId?: string;
  riderId?: string;
  message: string;
  timestamp: string;
}

export interface User {
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  firstName?: string;
  otherName?: string;
  driverId?: string;
  riderId?: string;
}

export interface ChatState {
  messages: Message[];
  typingUsers: User[];
  isConnected: boolean;
}

export interface TypingUser {
  userId: string;
  userType: string;
  firstName?: string;
  otherName?: string;
} 