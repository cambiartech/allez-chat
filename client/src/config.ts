// Server URLs for different environments
const config = {
  development: {
    SERVER_URL: '/.netlify/functions/chat',
    SOCKET_URL: 'wss://allez-chat.netlify.app/.netlify/functions/chat'
  },
  staging: {
    SERVER_URL: '/.netlify/functions/chat',
    SOCKET_URL: 'wss://allez-chat.netlify.app/.netlify/functions/chat'
  },
  production: {
    SERVER_URL: '/.netlify/functions/chat',
    SOCKET_URL: 'wss://allez-chat.netlify.app/.netlify/functions/chat'
  }
};

// Get current environment
const ENV = process.env.REACT_APP_ENV || 'development';

// Export the configuration for the current environment
export default config[ENV as keyof typeof config]; 