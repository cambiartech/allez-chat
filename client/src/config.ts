// Configuration for different environments
const config = {
  development: {
    // For development, you can use a demo Supabase project or your own
    SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'https://kkjaknhnmussoocfzqjh.supabase.co',
    SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtramFrbmhubXVzc29vY2Z6cWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NzM0MDYsImV4cCI6MjA2NDE0OTQwNn0.B7PxzmlXR18AF7TdpM3LAfuZS92UBNS_jtuea-TSk7I',
    // Socket.IO server for drivers and riders
    SERVER_URL: '/.netlify/functions/chat',
    SOCKET_URL: 'http://localhost:5001'
  },
  staging: {
    SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'https://your-staging-project.supabase.co',
    SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-staging-anon-key',
    SERVER_URL: '/.netlify/functions/chat',
    SOCKET_URL: 'wss://allez-chat.netlify.app'
  },
  production: {
    SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'https://kkjaknhnmussoocfzqjh.supabase.co',
    SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtramFrbmhubXVzc29vY2Z6cWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NzM0MDYsImV4cCI6MjA2NDE0OTQwNn0.B7PxzmlXR18AF7TdpM3LAfuZS92UBNS_jtuea-TSk7I',
    SERVER_URL: '/.netlify/functions/chat',
    // TEMPORARY: Use Supabase for all users in production until Socket.IO server is deployed
    SOCKET_URL: 'https://allez-chat.netlify.app' // This will fallback to Supabase
  }
};

// Get current environment
const ENV = process.env.REACT_APP_ENV || 'development';

// Export the configuration for the current environment
export default config[ENV as keyof typeof config]; 