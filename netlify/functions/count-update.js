const https = require('https');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { tripId, recipientId, recipientType, senderId, senderType, count } = body;

    // Make request to the HTTP API
    const response = await fetch('http://allez.us-east-1.elasticbeanstalk.com/api/chat/count-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'HKeGw>L/v9-3W4/'
      },
      body: JSON.stringify({
        tripId,
        recipientId,
        recipientType,
        senderId,
        senderType,
        count
      })
    });

    const result = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in count-update function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
}; 