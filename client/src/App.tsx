import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WebViewChat from './components/ChatWidget/WebViewChat';
import ChatWidget from './components/ChatWidget/ChatWidget';
import styled from '@emotion/styled';

const ChatRoute = () => {
  // The WebViewChat component will handle URL parameter extraction internally
  return <WebViewChat />;
};

const AdminRoute = () => {
  const [tripId, setTripId] = useState('');
  const [showChat, setShowChat] = useState(false);
  const adminId = `admin_${Date.now()}`;

  if (!showChat) {
    return (
      <AdminContainer>
        <h2>Admin Chat Access</h2>
        <p>Enter a Trip ID to join the chat as an admin</p>
        <InputGroup>
          <label htmlFor="tripId">Trip ID:</label>
          <input
            id="tripId"
            type="text"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            placeholder="Enter Trip ID (e.g., 288)"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && tripId.trim()) {
                setShowChat(true);
              }
            }}
          />
          <button 
            onClick={() => setShowChat(true)}
            disabled={!tripId.trim()}
          >
            Join Chat as Admin
          </button>
        </InputGroup>
      </AdminContainer>
    );
  }

  return (
    <Container>
      <ChatWidget
        tripId={tripId}
        userId={adminId}
        userType="admin"
        firstName="Admin"
        initiallyOpen={true}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
`;

const AdminContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 10px;
    color: #333;
    text-align: center;
  }

  p {
    margin: 0 0 20px;
    color: #666;
    text-align: center;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    font-weight: 500;
    color: #666;
  }

  input {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;

    &:focus {
      outline: none;
      border-color: #007AFF;
    }
  }

  button {
    margin-top: 10px;
    padding: 12px;
    background: #007AFF;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  }
`;

const HomeRoute = () => {
  return (
    <HomeContainer>
      <h1>Allez Chat Test Interface</h1>
      <p>Choose a user type to test the chat widget:</p>
      
      <TestLinksGroup>
        <h3>Admin Interface</h3>
        <TestLink href="/admin">
          <span>🔧 Admin Chat</span>
          <small>Uses Supabase with count updates via Netlify function</small>
        </TestLink>
        
        <h3>Driver/Rider Interface (Socket.IO)</h3>
        <TestLink href="/chat?tripId=5529&userId=1566&userType=driver&firstName=TestDriver&driverId=1566&riderId=6823">
          <span>🚗 Driver Chat (ID: 1566)</span>
          <small>Uses Socket.IO with built-in count updates</small>
        </TestLink>
        
        <TestLink href="/chat?tripId=5529&userId=6823&userType=rider&firstName=TestRider&driverId=1566&riderId=6823">
          <span>🧑‍💼 Rider Chat (ID: 6823)</span>
          <small>Uses Socket.IO with built-in count updates</small>
        </TestLink>
        
        <h3>Test Scenario</h3>
        <p>
          <strong>Trip ID:</strong> 5529<br/>
          <strong>Driver ID:</strong> 1566<br/>
          <strong>Rider ID:</strong> 6823
        </p>
        <p>Open multiple tabs to test real-time messaging and count updates!</p>
      </TestLinksGroup>
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 10px;
  }

  p {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
  }

  h3 {
    color: #007AFF;
    margin: 30px 0 15px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 5px;
  }
`;

const TestLinksGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TestLink = styled.a`
  display: block;
  padding: 15px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;

  &:hover {
    border-color: #007AFF;
    box-shadow: 0 2px 10px rgba(0, 122, 255, 0.1);
  }

  span {
    display: block;
    font-weight: 600;
    font-size: 16px;
    color: #333;
    margin-bottom: 5px;
  }

  small {
    color: #666;
    font-size: 14px;
  }
`;

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/chat" element={<ChatRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </Router>
  );
};

export default App;
