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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/chat" element={<ChatRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </Router>
  );
};

export default App;
