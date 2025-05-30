import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WebViewChat from './components/ChatWidget/WebViewChat';
import { useSearchParams } from 'react-router-dom';
import config from './config';

const ChatRoute = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId') || '';
  const userId = searchParams.get('userId') || '';
  const userType = (searchParams.get('userType') || 'rider') as 'driver' | 'rider' | 'admin';
  const serverUrl = searchParams.get('serverUrl') || config.SOCKET_URL;

  return (
    <WebViewChat
      tripId={tripId}
      userId={userId}
      userType={userType}
      serverUrl={serverUrl}
    />
  );
};

const AdminRoute = () => {
  // Generate a unique admin ID if not provided
  const adminId = `admin_${Date.now()}`;
  
  return (
    <WebViewChat
      userId={adminId}
      userType="admin"
      serverUrl={config.SOCKET_URL}
    />
  );
};

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
