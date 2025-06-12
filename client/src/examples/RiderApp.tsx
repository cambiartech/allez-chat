import React, { useState } from 'react';
import styled from '@emotion/styled';
import ChatWidget from '../components/ChatWidget/ChatWidget';

interface Trip {
  id: string;
  status: 'searching' | 'assigned' | 'in_progress' | 'completed';
  driver?: {
    id: string;
    name: string;
    vehicle: string;
  };
}

const RiderApp: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  
  // In a real app, this would come from your state management system
  const currentTrip: Trip | null = {
    id: '12345',
    status: 'assigned',
    driver: {
      id: 'driver-456',
      name: 'Alex Smith',
      vehicle: 'Toyota Camry'
    }
  };

  const riderId = 'rider-123'; // Would come from authentication
  const riderFirstName = 'John'; // Would come from user profile

  return (
    <AppContainer>
      <Header>
        <h1>Your Ride</h1>
      </Header>

      <MainContent>
        {currentTrip && currentTrip.driver && (
          <TripCard>
            <TripInfo>
              <h2>Trip #{currentTrip.id}</h2>
              <DriverInfo>
                <h3>Your Driver</h3>
                <p>{currentTrip.driver.name}</p>
                <p>{currentTrip.driver.vehicle}</p>
              </DriverInfo>
              
              <ChatButton onClick={() => setShowChat(!showChat)}>
                {showChat ? 'Hide Chat' : 'Message Driver'}
              </ChatButton>
            </TripInfo>

            {showChat && (
              <ChatContainer>
                <ChatWidget
                  tripId={currentTrip.id}
                  userId={riderId}
                  userType="rider"
                  firstName={riderFirstName}
                />
              </ChatContainer>
            )}
          </TripCard>
        )}
      </MainContent>
    </AppContainer>
  );
};

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background-color: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h1 {
    margin: 0;
    font-size: 24px;
  }
`;

const MainContent = styled.main`
  max-width: 600px;
  margin: 20px auto;
  padding: 0 20px;
`;

const TripCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TripInfo = styled.div`
  padding: 20px;
`;

const DriverInfo = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  
  h3 {
    margin: 0 0 10px 0;
    color: #666;
  }
  
  p {
    margin: 5px 0;
  }
`;

const ChatButton = styled.button`
  background-color: #ff8f00;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const ChatContainer = styled.div`
  border-top: 1px solid #eee;
  padding: 20px;
`;

export default RiderApp; 