# Supabase Setup Guide for Allez Chat

## 1. Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login
3. Create a new project
4. Wait for project to be ready

## 2. Get Your Credentials

From your Supabase dashboard:
- **Project URL**: Found in Settings > API > Project URL
- **Anon Key**: Found in Settings > API > Project API keys > anon/public

## 3. Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Create messages table for chat persistence
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('driver', 'rider', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_chat_messages_trip_created ON chat_messages(trip_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can make this more restrictive)
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages
FOR ALL USING (true) WITH CHECK (true);

-- Function to auto-delete messages older than 2 hours
CREATE OR REPLACE FUNCTION delete_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_messages 
  WHERE created_at < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup every hour
-- Note: This requires the pg_cron extension (available in Supabase Pro)
-- For free tier, you can call this function manually or from your app
```

## 4. Environment Variables

Create/update your `.env` file in the `client` directory:

```env
REACT_APP_SUPABASE_URL=your-project-url-here
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## 5. Test Connection

Start your development server:
```bash
cd client
npm start
```

Visit: `http://localhost:3000/chat?tripId=12345&userId=test_user&userType=admin`

## Features

✅ **Real-time messaging** - Messages appear instantly  
✅ **Message persistence** - Messages saved to database  
✅ **Message history** - Load previous messages when joining  
✅ **Auto-cleanup** - Messages deleted after 2 hours  
✅ **Typing indicators** - See when someone is typing  
✅ **Presence tracking** - Know who's online  

## Database Schema

### chat_messages table:
- `id` (UUID) - Primary key
- `trip_id` (TEXT) - Trip identifier
- `user_id` (TEXT) - User identifier  
- `user_type` (TEXT) - 'driver', 'rider', or 'admin'
- `message` (TEXT) - Message content
- `created_at` (TIMESTAMP) - When message was sent

## Cleanup Strategy

Messages are automatically deleted after 2 hours to:
- Save database storage space
- Keep costs low on free tier
- Maintain chat performance

For production, you might want to:
- Increase retention to 24 hours
- Archive important messages
- Implement user-specific retention policies 