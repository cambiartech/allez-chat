const io = require('socket.io-client');

// Test the count update functionality
async function testCountUpdate() {
  console.log('🧪 Testing Count Update Functionality\n');

  // Create two socket connections (driver and passenger)
  const driverSocket = io('http://localhost:5001');
  const passengerSocket = io('http://localhost:5001');

  const tripId = '391'; // Using the same trip ID from your examples

  // Wait for connections
  await new Promise(resolve => {
    let connected = 0;
    const checkConnected = () => {
      connected++;
      if (connected === 2) resolve();
    };
    
    driverSocket.on('connect', () => {
      console.log('✅ Driver connected');
      checkConnected();
    });
    
    passengerSocket.on('connect', () => {
      console.log('✅ Passenger connected');
      checkConnected();
    });
  });

  // Join the same trip room
  console.log('\n📱 Joining trip room...');
  driverSocket.emit('join_room', {
    tripId: tripId,
    userType: 'driver',
    userId: '21',
    firstName: 'John Driver'
  });

  passengerSocket.emit('join_room', {
    tripId: tripId,
    userType: 'rider', // Will be converted to 'passenger' in API call
    userId: '11',
    firstName: 'Jane Passenger'
  });

  // Wait a bit for room joining
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Listen for messages
  driverSocket.on('receive_message', (message) => {
    console.log(`🚗 Driver received: "${message.message}" from ${message.firstName}`);
  });

  passengerSocket.on('receive_message', (message) => {
    console.log(`👤 Passenger received: "${message.message}" from ${message.firstName}`);
  });

  // Test 1: Passenger sends message to driver
  console.log('\n📨 Test 1: Passenger sends message...');
  passengerSocket.emit('send_message', {
    tripId: tripId,
    message: 'Hi! I\'m waiting at the pickup location.',
    userType: 'rider',
    userId: '11',
    firstName: 'Jane Passenger'
  });

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Driver responds
  console.log('\n📨 Test 2: Driver responds...');
  driverSocket.emit('send_message', {
    tripId: tripId,
    message: 'Great! I\'ll be there in 2 minutes.',
    userType: 'driver',
    userId: '21',
    firstName: 'John Driver'
  });

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Multiple messages from passenger
  console.log('\n📨 Test 3: Multiple messages from passenger...');
  const messages = [
    'I can see you approaching!',
    'Are you the blue Toyota?',
    'Perfect, I\'m coming out now.'
  ];

  for (let i = 0; i < messages.length; i++) {
    setTimeout(() => {
      passengerSocket.emit('send_message', {
        tripId: tripId,
        message: messages[i],
        userType: 'rider',
        userId: '11',
        firstName: 'Jane Passenger'
      });
    }, i * 1000);
  }

  // Wait for all messages to process
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n✅ Test completed! Check server logs for count update API calls.');
  console.log('\n📋 Expected API calls:');
  console.log('1. Driver should receive count update when passenger sends first message');
  console.log('2. Passenger should receive count update when driver responds');
  console.log('3. Driver should receive count updates for each of the 3 follow-up messages');

  // Cleanup
  driverSocket.disconnect();
  passengerSocket.disconnect();
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

// Run the test
testCountUpdate().catch(console.error); 