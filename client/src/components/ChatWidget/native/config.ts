// Server URLs for different environments
const config = {
  development: {
    SERVER_URL: 'http://10.0.2.2:5001',    // Android emulator localhost
    SOCKET_URL: 'ws://10.0.2.2:5001',      // Android emulator localhost
    IOS_SERVER_URL: 'http://localhost:5001', // iOS simulator
    IOS_SOCKET_URL: 'ws://localhost:5001'    // iOS simulator
  },
  staging: {
    SERVER_URL: 'https://staging-chat.allez.com',
    SOCKET_URL: 'wss://staging-chat.allez.com'
  },
  production: {
    SERVER_URL: 'https://chat.allez.com',
    SOCKET_URL: 'wss://chat.allez.com'
  }
};

// Get current environment
const ENV = process.env.REACT_NATIVE_ENV || 'development';

// Helper to get correct URL based on platform
import { Platform } from 'react-native';

const getConfig = () => {
  const envConfig = config[ENV as keyof typeof config];
  
  // For development, use special iOS URLs if on iOS
  if (ENV === 'development' && Platform.OS === 'ios') {
    return {
      SERVER_URL: envConfig.IOS_SERVER_URL,
      SOCKET_URL: envConfig.IOS_SOCKET_URL
    };
  }
  
  return {
    SERVER_URL: envConfig.SERVER_URL,
    SOCKET_URL: envConfig.SOCKET_URL
  };
};

export default getConfig(); 