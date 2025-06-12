import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WebViewChat from './examples/WebViewChat';
import { useSearchParams } from 'react-router-dom';
import config from './config';

const ChatRoute = () => {
  // The WebViewChat component will handle URL parameter extraction internally
  return <WebViewChat />;
};

const AdminRoute = () => {
  // Generate a unique admin ID if not provided
  const adminId = `admin_${Date.now()}`;
  
  return (
    <WebViewChat />
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
