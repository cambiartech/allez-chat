# Supabase Chat Setup Guide

## Why Supabase?

Netlify Functions don't support WebSocket connections because they're serverless. Supabase provides real-time subscriptions that work perfectly for chat applications.

## Quick Setup (5 minutes)

### 1. Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for free
3. Create a new project

### 2. Get Your Credentials
1. In your Supabase dashboard, go to Settings > API
2. Copy your:
   - Project URL (looks like: `https://your-project.supabase.co`)
   - Anon/Public Key (starts with `eyJ...`)

### 3. Add Environment Variables

Create a `.env` file in the `client` directory:

```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Add to Netlify Environment Variables

In your Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add:
   - `REACT_APP_SUPABASE_URL`: Your project URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your anon key

### 5. Optional: Create Messages Table (for persistence)

If you want to store messages permanently:

```sql
-- Create messages table
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  trip_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Add RLS (Row Level Security)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can make this more restrictive)
CREATE POLICY "Allow all operations" ON messages FOR ALL USING (true);
```

## How It Works

1. **Real-time Channels**: Each trip gets its own channel (`trip-{tripId}`)
2. **Broadcast Messages**: Messages are broadcast to all users in the channel
3. **Presence Tracking**: See who's online
4. **Typing Indicators**: Real-time typing status

## Testing

1. Open multiple browser tabs with the same trip ID
2. Send messages - they should appear instantly in all tabs
3. Start typing - other users should see typing indicators

## Benefits vs Socket.IO

✅ **No server management**  
✅ **Built-in scaling**  
✅ **Free tier with generous limits**  
✅ **Works with Netlify**  
✅ **Real-time subscriptions**  
✅ **Presence tracking**  
✅ **Optional message persistence**

## Next Steps

- Add message persistence with the SQL table above
- Implement user authentication
- Add file sharing capabilities
- Set up proper Row Level Security (RLS) policies 