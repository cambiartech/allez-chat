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
  first_name TEXT,
  other_name TEXT,
  driver_id TEXT,
  rider_id TEXT,
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
✅ **Name display** - Shows actual first names instead of generic labels

## Database Schema

### chat_messages table:
- `id` (UUID) - Primary key
- `trip_id` (TEXT) - Trip identifier
- `user_id` (TEXT) - User identifier  
- `user_type` (TEXT) - 'driver', 'rider', or 'admin'
- `first_name` (TEXT) - First name of the message sender
- `other_name` (TEXT) - First name of the other participant
- `driver_id` (TEXT) - Driver's user ID
- `rider_id` (TEXT) - Rider's user ID
- `message` (TEXT) - Message content
- `created_at` (TIMESTAMP) - When message was sent

## URL Parameters

For driver/rider chat access:
```
https://your-app.com/chat?tripId=288&userId=21&userType=driver&firstName=John&otherName=Sarah&driverId=21&riderId=1
```

- `tripId`: Trip/ride identifier (required)
- `userId`: Current user's ID (required)
- `userType`: 'driver', 'rider', or 'admin' (required)
- `firstName`: Current user's first name (optional)
- `otherName`: Other participant's first name (optional)
- `driverId`: Driver's user ID (optional)
- `riderId`: Rider's user ID (optional)

## Cleanup Strategy

Messages are automatically deleted after 2 hours to:
- Save database storage space
- Keep costs low on free tier
- Maintain chat performance

For production, you might want to:
- Increase retention to 24 hours
- Archive important messages
- Implement user-specific retention policies

## Add Missing Columns to Existing Table

If you already have a `chat_messages` table, run this SQL to add the missing columns:

```sql
-- Add missing columns to existing chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS other_name TEXT,
ADD COLUMN IF NOT EXISTS driver_id TEXT,
ADD COLUMN IF NOT EXISTS rider_id TEXT;
```

## Real-time Setup

1. Go to your Supabase project dashboard
2. Navigate to Database → Replication
3. Enable replication for the `chat_messages` table
4. This allows real-time subscriptions to work

## Environment Variables

Make sure your app has access to:
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key 