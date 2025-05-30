# Allez Chat Widget

A real-time chat widget built for the Allez taxi app, enabling seamless communication between riders and drivers.

## Features

- Real-time messaging using Socket.IO
- Message persistence with MongoDB (1-hour TTL)
- Typing indicators
- Responsive design
- React Native compatibility via WebView
- TypeScript support
- Styled with Emotion/Styled Components

## Tech Stack

- **Frontend:** React, TypeScript, Styled Components
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB
- **Mobile:** React Native WebView integration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cambiartech/allez-chat.git
cd allez-chat
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:

Create `.env` file in the server directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001
MESSAGE_TTL=3600
```

### Development

1. Start the server:
```bash
cd server
npm start
```

2. Start the client:
```bash
cd client
npm start
```

The development server will start at `http://localhost:3000`

## Deployment

### Client (Netlify)
- Automatic deployment via GitHub integration
- Environment variables set in Netlify dashboard:
  - REACT_APP_SERVER_URL
  - REACT_APP_SOCKET_URL
  - REACT_APP_ENV

### Server
- Deploy to your preferred hosting platform
- Set up environment variables
- Ensure CORS is configured for your domain

## License

MIT License 