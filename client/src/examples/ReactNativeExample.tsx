import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

interface ChatScreenProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  serverUrl?: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  tripId,
  userId,
  userType,
  serverUrl = 'https://your-chat-server.com'
}) => {
  const chatUrl = `${serverUrl}/chat?tripId=${tripId}&userId=${userId}&userType=${userType}`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: chatUrl }}
        style={styles.webview}
        // Enable WebSocket connections
        originWhitelist={['*']}
        // Enable two-way communication between React Native and Web
        onMessage={(event) => {
          // Handle messages from web app
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'NEW_MESSAGE') {
            // Handle new message notifications
          }
        }}
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