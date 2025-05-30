import React, { useState } from 'react';
import styled from '@emotion/styled';
import ChatWidget from '../ChatWidget/ChatWidget';

const AdminView = () => {
  const [userType, setUserType] = useState<'driver' | 'rider' | 'admin'>('rider');
  const [tripId, setTripId] = useState('12345');

  return (
    <Container>
      <Header>
        <h1>Allez Chat</h1>
        <p>In App Chat Widget</p>
      </Header>
      
      <Controls>
        <ControlGroup>
          <label>User Type:</label>
          <select 
            value={userType} 
            onChange={(e) => setUserType(e.target.value as 'driver' | 'rider' | 'admin')}
          >
            <option value="rider">Rider</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </ControlGroup>
        
        <ControlGroup>
          <label>Trip ID:</label>
          <input 
            type="text" 
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            placeholder="Enter trip ID"
          />
        </ControlGroup>
      </Controls>

      <ChatWidget
        tripId={tripId}
        userId={`${userType}-${Math.random().toString(36).substr(2, 9)}`}
        userType={userType}
      />
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    color: #f05a29;
    margin-bottom: 10px;
  }

  p {
    color: #666;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  justify-content: center;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  label {
    font-weight: 500;
    color: #333;
  }

  select, input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #f05a29;
    }
  }
`;

export default AdminView; 