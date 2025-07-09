const io = require('socket.io-client');
const axios = require('axios');

// Test data
const tripId = '5529';
const passengerId = '6823';
const driverId = '1566';
const serverUrl = 'http://localhost:5001';

// Track count update calls
let countUpdateCalls = [];

// Mock axios to intercept count updates
const originalAxiosPost = axios.post;
axios.post = async function(url, data, config) {
  if (url.includes('/api/chat/count-update')) {
    countUpdateCalls.push({
      timestamp: new Date().toISOString(),
      url,
      data,
      headers: config?.headers
    });
    console.log(`🔔 COUNT UPDATE INTERCEPTED:`, {
      tripId: data.tripId,
      recipientId: data.recipientId,
      recipientType: data.recipientType,
      senderId: data.senderId,
      senderType: data.senderType,
      count: data.count
    });
    
    // Return mock success
    return {
      status: 200,
      data: {
        success: true,
        message: 'Chat count updated',
        tripId: data.tripId,
        recipientId: data.recipientId,
        count: data.count
      }
    };
  }
  
  return originalAxiosPost.apply(this, arguments);
};

async function finalTest() {
  console.log('🚀 FINAL COUNT UPDATE TEST');
  console.log('=========================');
  console.log(`Trip ID: ${tripId}`);
  console.log(`Driver ID: ${driverId}`);
  console.log(`Passenger ID: ${passengerId}`);
  console.log('');
  
  // Reset tracking
  countUpdateCalls = [];
  
  // Create sockets
  const driverSocket = io(serverUrl);
  const passengerSocket = io(serverUrl);
  
  // Wait for connections
  await new Promise(resolve => {
    let connected = 0;
    const checkConnection = () => {
      connected++;
      if (connected === 2) resolve();
    };
    
    driverSocket.on('connect', checkConnection);
    passengerSocket.on('connect', checkConnection);
  });
  
  console.log('✅ Both sockets connected');
  
  // Join room
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
  
  console.log('📱 Joined chat room');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 1: Driver sends message
  console.log('\n--- TEST 1: Driver sends message ---');
  countUpdateCalls = [];
  
  driverSocket.emit('send_message', {
    tripId,
    message: 'Hello from driver!',
    userType: 'driver',
    userId: driverId,
    firstName: 'John'
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log(`Count updates captured: ${countUpdateCalls.length}`);
  if (countUpdateCalls.length > 0) {
    console.log('✅ SUCCESS: Count update sent to passenger');
  } else {
    console.log('❌ FAILED: No count update sent');
  }
  
  // Test 2: Passenger sends message
  console.log('\n--- TEST 2: Passenger sends message ---');
  countUpdateCalls = [];
  
  passengerSocket.emit('send_message', {
    tripId,
    message: 'Hello from passenger!',
    userType: 'rider',
    userId: passengerId,
    firstName: 'Sarah'
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log(`Count updates captured: ${countUpdateCalls.length}`);
  if (countUpdateCalls.length > 0) {
    console.log('✅ SUCCESS: Count update sent to driver');
  } else {
    console.log('❌ FAILED: No count update sent');
  }
  
  console.log('\n=========================');
  console.log('🏁 FINAL TEST COMPLETED');
  console.log('=========================');
  
  // Cleanup
  driverSocket.disconnect();
  passengerSocket.disconnect();
  axios.post = originalAxiosPost;
}

// Run the test
finalTest().catch(console.error); 