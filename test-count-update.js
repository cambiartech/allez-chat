const axios = require('axios');

async function testCountUpdate() {
  const tripId = 5529;
  const passengerId = 6823;
  const driverId = 1566;
  
  console.log('Testing count update API with:');
  console.log(`Trip ID: ${tripId}`);
  console.log(`Passenger ID: ${passengerId}`);
  console.log(`Driver ID: ${driverId}`);
  console.log('---');
  
  const apiUrl = 'http://allez.us-east-1.elasticbeanstalk.com/api/chat/count-update';
  const apiKey = 'HKeGw>L/v9-3W4/';
  
  // Test 1: Driver sends message, notify passenger
  console.log('Test 1: Driver sends message, notifying passenger...');
  try {
    const response1 = await axios.post(apiUrl, {
      tripId: tripId,
      recipientId: passengerId,
      recipientType: 'passenger',
      count: 1,
      senderId: driverId,
      senderType: 'driver'
    }, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Test 1 SUCCESS:', response1.status, response1.data);
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error.response?.status, error.response?.data || error.message);
  }
  
  console.log('---');
  
  // Test 2: Passenger sends message, notify driver
  console.log('Test 2: Passenger sends message, notifying driver...');
  try {
    const response2 = await axios.post(apiUrl, {
      tripId: tripId,
      recipientId: driverId,
      recipientType: 'driver',
      count: 2,
      senderId: passengerId,
      senderType: 'passenger'
    }, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Test 2 SUCCESS:', response2.status, response2.data);
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error.response?.status, error.response?.data || error.message);
  }
  
  console.log('---');
  console.log('Test completed!');
}

// Run the test
testCountUpdate().catch(console.error); 