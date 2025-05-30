import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { io } from 'socket.io-client';

interface Message {
  userId: string;
  userType: string;
  message: string;
  timestamp: string;
}

interface ChatWidgetProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  serverUrl?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  tripId,
  userId,
  userType,
  serverUrl = 'http://localhost:5001'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(serverUrl);
    
    socket.emit('join_room', { tripId, userType, userId });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('room_history', ({ messages: history }) => {
      setMessages(history);
    });

    return () => {
      socket.disconnect();
    };
  }, [tripId, userId, userType, serverUrl]);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const socket = io(serverUrl);
    socket.emit('send_message', {
      tripId,
      message: inputMessage,
      userType,
      userId
    });

    setInputMessage('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.userId === userId ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={styles.userType}>{item.userType}</Text>
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip #{tripId}</Text>
        <Text style={[
          styles.status,
          { color: isConnected ? '#4CD964' : '#FFD60A' }
        ]}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item: Message, index: number) => `${item.timestamp}-${index}`}
        style={styles.messageList}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    backgroundColor: '#f05a29',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    opacity: 0.8,
  },
  messageList: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F5F5F5',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 8,
  },
  ownMessage: {
    backgroundColor: '#f05a29',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#E9ECEF',
    alignSelf: 'flex-start',
  },
  userType: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 20,
    fontSize: 14,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#f05a29',
    padding: 10,
    borderRadius: 20,
    width: 70,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default ChatWidget; 