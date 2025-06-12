export interface Message {
  id: string;
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

export interface DatabaseMessage {
  id?: number;
  trip_id: string;
  user_id: string;
  user_type: string;
  first_name?: string;
  other_name?: string;
  driver_id?: string;
  rider_id?: string;
  message: string;
  created_at: string;
} 