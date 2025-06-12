import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

interface ChatScreenProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  serverUrl?: string;
  firstName?: string;
  onMessage?: (message: any) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  tripId,
  userId,
  userType,
  serverUrl = 'https://your-chat-server.com',
  firstName,
  onMessage
}) => {
  const chatUrl = `${serverUrl}/chat?tripId=${tripId}&userId=${userId}&userType=${userType}${firstName ? `&firstName=${encodeURIComponent(firstName)}` : ''}`;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      onMessage?.(data);
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: chatUrl }}
        style={styles.webview}
        // Enable WebSocket connections
        originWhitelist={['*']}
        // Enable two-way communication between React Native and Web
        onMessage={handleMessage}
        // Inject custom JavaScript
        injectedJavaScript={`
          // Listen for mobile-specific events
          window.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'LOCATION_UPDATE') {
              // Handle location updates
            }
          });
        `}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});

export default ChatScreen; 