import React from 'react';
import styled from '@emotion/styled';
import ChatWidget from '../components/ChatWidget/ChatWidget';

interface Trip {
  id: string;
  status: 'active' | 'completed' | 'cancelled';
  rider: {
    id: string;
    name: string;
  };
}

const DriverApp: React.FC = () => {
  // In a real app, this would come from your state management system
  const activeTrip: Trip | null = {
    id: '12345',
    status: 'active',
    rider: {
      id: 'rider-123',
      name: 'John Doe'
    }
  };

  const driverId = 'driver-456'; // Would come from authentication

  return (
    <AppContainer>
      <Sidebar>
        <NavItem>Dashboard</NavItem>
        <NavItem>Trips</NavItem>
        <NavItem>Messages</NavItem>
        <NavItem>Settings</NavItem>
      </Sidebar>
      
      <MainContent>
        {activeTrip && (
          <TripCard>
            <h2>Active Trip #{activeTrip.id}</h2>
            <p>Passenger: {activeTrip.rider.name}</p>
            
            {/* Chat widget will appear here when needed */}
            <ChatWidget
              tripId={activeTrip.id}
              userId={driverId}
              userType="driver"
            />
          </TripCard>
        )}
      </MainContent>
    </AppContainer>
  );
};

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #1a1a1a;
  padding: 20px;
  color: white;
`;

const NavItem = styled.div`
  padding: 15px;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 5px;
  
  &:hover {
    background-color: #333;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
`;

const TripCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export default DriverApp; 