const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

async function sendSMS(to, message) {
  if (!client) {
    console.log('Twilio not configured, skipping SMS send');
    return { sid: 'mock-sid' };
  }
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

module.exports = {
  sendSMS,
};
