// Server URLs for different environments
const config = {
  development: {
    SERVER_URL: 'http://localhost:5001',
    SOCKET_URL: 'ws://localhost:5001'
  },
  staging: {
    SERVER_URL: process.env.REACT_APP_SERVER_URL || 'https://staging-chat.allez.com',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'wss://staging-chat.allez.com'
  },
  production: {
    SERVER_URL: process.env.REACT_APP_SERVER_URL || 'https://chat.allez.com',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'wss://chat.allez.com'
  }
};

// Get current environment
const ENV = process.env.REACT_APP_ENV || 'development';

// Export the configuration for the current environment
export default config[ENV as keyof typeof config]; 