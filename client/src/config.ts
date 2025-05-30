// Configuration for different environments
const config = {
  development: {
    // For development, you can use a demo Supabase project or your own
    SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'https://kkjaknhnmussoocfzqjh.supabase.co',
    SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtramFrbmhubXVzc29vY2Z6cWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NzM0MDYsImV4cCI6MjA2NDE0OTQwNn0.B7PxzmlXR18AF7TdpM3LAfuZS92UBNS_jtuea-TSk7I',
    // Legacy Socket.IO config (deprecated)
    SERVER_URL: '/.netlify/functions/chat',
    SOCKET_URL: 'wss://allez-chat.netlify.app'
  },
  staging: {
    SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'https://your-staging-project.supabase.co',
    SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-staging-anon-key',
    SERVER_URL: '/.netlify/functions/chat',
    SOCKET_URL: 'wss://allez-chat.netlify.app'
  },
  production: {
    SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'https://your-production-project.supabase.co',
    SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-production-anon-key',
    SERVER_URL: '/.netlify/functions/chat',
    SOCKET_URL: 'wss://allez-chat.netlify.app'
  }
};

// Get current environment
const ENV = process.env.REACT_APP_ENV || 'development';

// Export the configuration for the current environment
export default config[ENV as keyof typeof config]; 