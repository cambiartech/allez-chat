# Count Update Integration

## Overview
The chat server now automatically sends count updates to your external API whenever a new message is received. This allows your main application to track unread message counts for drivers and passengers.

## How It Works

### 1. When a Message is Sent
Every time a user sends a message in a chat room, the server:
1. Saves the message to the database
2. Broadcasts the message to all users in the room
3. **NEW**: Calculates unread counts for all recipients
4. **NEW**: Sends count update notifications to your API

### 2. API Integration
The server makes POST requests to your endpoint with the following data:

```bash
POST http://allez.us-east-1.elasticbeanstalk.com/api/chat/count-update
Headers:
  X-API-Key: HKeGw>L/v9-3W4/
  Content-Type: application/json

Body:
{
  "tripId": "391",
  "recipientId": "21",
  "recipientType": "driver",
  "count": 3,
  "senderId": "11",
  "senderType": "passenger"
}
```

### 3. User Type Mapping
The chat server uses `rider` internally, but converts to `passenger` for your API:
- `rider` → `passenger` (for API calls)
- `driver` → `driver` (no change)
- `admin` → `admin` (no change)

## Configuration

### Environment Variables
You can configure the integration using these environment variables:

```env
# External API Configuration
ALLEZ_API_URL=http://allez.us-east-1.elasticbeanstalk.com/api/chat/count-update
ALLEZ_API_KEY=HKeGw>L/v9-3W4/

# Chat Configuration
UNREAD_COUNT_HOURS=24  # How far back to count unread messages
```

### Fallback Values
If environment variables aren't set, the server uses these defaults:
- API URL: `http://allez.us-east-1.elasticbeanstalk.com/api/chat/count-update`
- API Key: `HKeGw>L/v9-3W4/`
- Unread count window: 24 hours

## Unread Count Logic

Currently, the server counts messages as "unread" if:
1. They were not sent by the recipient
2. They are not system messages
3. They were sent within the last 24 hours (configurable)

**Note**: This is a simple implementation. For production, you might want to implement proper read receipts by tracking when users actually view messages.

## Error Handling

The integration is designed to be non-blocking:
- If the API call fails, it logs the error but doesn't break chat functionality
- Network timeouts are set to 5 seconds
- The chat continues to work even if your API is temporarily unavailable

## Testing

Run the test script to see the integration in action:

```bash
node test-count-update.js
```

This will simulate a conversation between a driver and passenger, and you'll see the count update API calls in the server logs.

## Example Flow

1. **Passenger sends message**: "Hi! I'm waiting at the pickup location."
   - Server sends API call to notify driver (recipientId: "21", count: 1)

2. **Driver responds**: "Great! I'll be there in 2 minutes."
   - Server sends API call to notify passenger (recipientId: "11", count: 1)

3. **Passenger sends 3 more messages**:
   - Server sends 3 separate API calls to notify driver (count increases each time)

## Monitoring

Check your server logs for these messages:
- `Processing count updates for X users in trip Y`
- `Sending count update: trip=X, recipient=Y, sender=Z, count=N`
- `Count update sent successfully for trip X`
- `Failed to send count update for trip X: [error]`

## Production Considerations

1. **Rate Limiting**: Consider implementing rate limiting for count updates
2. **Batching**: For high-traffic scenarios, you might want to batch count updates
3. **Read Receipts**: Implement proper read tracking for more accurate counts
4. **Retry Logic**: Add retry mechanisms for failed API calls
5. **Monitoring**: Set up alerts for failed count update calls 