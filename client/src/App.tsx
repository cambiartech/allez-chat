import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatWidget from './components/ChatWidget/ChatWidget';
import AdminView from './components/AdminView/AdminView';
import { useSearchParams } from 'react-router-dom';

const ChatRoute = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const userId = searchParams.get('userId');
  const userType = searchParams.get('userType') as 'driver' | 'rider' | 'admin';

  if (!tripId || !userId || !userType) {
    return <div>Missing required parameters</div>;
  }

  return (
    <ChatWidget
      tripId={tripId}
      userId={userId}
      userType={userType}
      initiallyOpen={true}
    />
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminView />} />
        <Route path="/chat" element={<ChatRoute />} />
      </Routes>
    </Router>
  );
};

export default App;
