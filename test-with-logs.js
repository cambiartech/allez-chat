const io = require('socket.io-client');

// Test data
const tripId = '5529';
const passengerId = '6823';
const driverId = '1566';
const serverUrl = 'http://localhost:5001';

async function testWithLogs() {
  console.log('🚀 Testing Socket.IO with server logs...');
  console.log(`Trip ID: ${tripId}, Driver: ${driverId}, Passenger: ${passengerId}`);
  console.log('---');
  console.log('Check server logs for count update messages...');
  console.log('---');
  
  // Create socket connections
  const driverSocket = io(serverUrl);
  const passengerSocket = io(serverUrl);
  
  // Wait for connections
  await new Promise(resolve => {
    let connected = 0;
    const checkConnection = () => {
      connected++;
      if (connected === 2) resolve();
    };
    
    driverSocket.on('connect', () => {
      console.log('✅ Driver connected');
      checkConnection();
    });
    
    passengerSocket.on('connect', () => {
      console.log('✅ Passenger connected');
      checkConnection();
    });
  });
  
  // Join the chat room
  console.log('📱 Joining chat room...');
  driverSocket.emit('join_room', {
    tripId,
    userType: 'driver',
    userId: driverId,
    firstName: 'John'
  });
  
  passengerSocket.emit('join_room', {
    tripId,
    userType: 'rider',
    userId: passengerId,
    firstName: 'Sarah'
  });
  
  // Wait for room setup
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('💬 Sending test message from driver...');
  driverSocket.emit('send_message', {
    tripId,
    message: 'Test message from driver for count update',
    userType: 'driver',
    userId: driverId,
    firstName: 'John'
  });
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('💬 Sending test message from passenger...');
  passengerSocket.emit('send_message', {
    tripId,
    message: 'Test message from passenger for count update',
    userType: 'rider',
    userId: passengerId,
    firstName: 'Sarah'
  });
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('🏁 Test completed! Check server logs above for count update results.');
  
  // Cleanup
  driverSocket.disconnect();
  passengerSocket.disconnect();
}

// Run the test
testWithLogs().catch(console.error); 