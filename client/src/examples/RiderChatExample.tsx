import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

interface RiderChatScreenProps {
  tripId: string;
  userId: string;
  serverUrl?: string;
}

const RiderChatScreen: React.FC<RiderChatScreenProps> = ({
  tripId,
  userId,
  serverUrl = 'https://allez-chat.netlify.app'
}) => {
  // Rider is always connected as 'rider' type
  const chatUrl = `${serverUrl}/chat?tripId=${tripId}&userId=${userId}&userType=rider`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: chatUrl }}
        style={styles.webview}
        originWhitelist={['*']}
        onMessage={(event) => {
          // Handle messages from web app
          const data = JSON.parse(event.nativeEvent.data);
          switch (data.type) {
            case 'NEW_MESSAGE':
              // Handle new message notifications
              break;
            case 'DRIVER_TYPING':
              // Show driver is typing indicator
              break;
            case 'CONNECTION_STATUS':
              // Update connection status
              break;
          }
        }}
        injectedJavaScript={`
          // Initialize chat with rider-specific settings
          window.CHAT_CONFIG = {
            userType: 'rider',
            tripId: '${tripId}',
            userId: '${userId}',
            theme: 'light'
          };

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

export default RiderChatScreen; 