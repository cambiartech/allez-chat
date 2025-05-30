import React from 'react';
import styled from '@emotion/styled';
import ChatWidget from './ChatWidget';

interface WebViewChatProps {
  tripId: string;
  userId: string;
  userType: 'driver' | 'rider' | 'admin';
  serverUrl: string;
}

// This component will be rendered in a standalone HTML page
const WebViewChat: React.FC<WebViewChatProps> = ({
  tripId,
  userId,
  userType,
  serverUrl
}) => {
  return (
    <Container>
      <ChatWidget
        tripId={tripId}
        userId={userId}
        userType={userType}
        serverUrl={serverUrl}
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

export default WebViewChat; 