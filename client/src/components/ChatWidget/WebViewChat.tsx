import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import ChatWidget from './ChatWidget';

// This component will be rendered in a standalone HTML page and extracts params from URL
const WebViewChat: React.FC = () => {
  const [chatParams, setChatParams] = useState<{
    tripId: string;
    userId: string;
    userType: 'driver' | 'rider' | 'admin';
    firstName?: string;
    otherName?: string;
    driverId?: string;
    riderId?: string;
  } | null>(null);

  useEffect(() => {
    // Extract parameters from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    
    const tripId = urlParams.get('tripId');
    const userId = urlParams.get('userId');
    const userType = urlParams.get('userType') as 'driver' | 'rider' | 'admin';
    const firstName = urlParams.get('firstName');
    const otherName = urlParams.get('otherName');
    const driverId = urlParams.get('driverId');
    const riderId = urlParams.get('riderId');
    
    console.log('URL Parameters:', { tripId, userId, userType, firstName, otherName, driverId, riderId });
    
    if (tripId && userId && userType) {
      setChatParams({
        tripId,
        userId,
        userType,
        firstName: firstName || undefined,
        otherName: otherName || undefined,
        driverId: driverId || undefined,
        riderId: riderId || undefined
      });
    } else {
      console.error('Missing required URL parameters: tripId, userId, userType');
    }
  }, []);

  if (!chatParams) {
    return (
      <ErrorContainer>
        <h2>Chat Configuration Error</h2>
        <p>Required URL parameters are missing.</p>
        <p>Expected format:</p>
        <code>
          ?tripId=12345&userId=user123&userType=driver&firstName=John&otherName=Sarah&driverId=123&riderId=456
        </code>
        <ul>
          <li><strong>tripId</strong>: The trip/ride ID (required)</li>
          <li><strong>userId</strong>: Unique user identifier (required)</li>
          <li><strong>userType</strong>: driver, rider, or admin (required)</li>
          <li><strong>firstName</strong>: User's first name (optional)</li>
          <li><strong>otherName</strong>: Other person's name (optional)</li>
          <li><strong>driverId</strong>: Driver's ID (optional)</li>
          <li><strong>riderId</strong>: Rider's ID (optional)</li>
        </ul>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <ChatWidget
        tripId={chatParams.tripId}
        userId={chatParams.userId}
        userType={chatParams.userType}
        firstName={chatParams.firstName}
        otherName={chatParams.otherName}
        driverId={chatParams.driverId}
        riderId={chatParams.riderId}
        initiallyOpen={true}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const ErrorContainer = styled.div`
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  h2 {
    color: #d32f2f;
    margin-bottom: 20px;
  }
  
  p {
    margin-bottom: 15px;
    line-height: 1.5;
  }
  
  code {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    display: block;
    margin: 15px 0;
    font-family: 'Monaco', 'Menlo', monospace;
    word-break: break-all;
  }
  
  ul {
    margin-top: 20px;
    
    li {
      margin-bottom: 8px;
      
      strong {
        color: #1976d2;
      }
    }
  }
`;

export default WebViewChat; 