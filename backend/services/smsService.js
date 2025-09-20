const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken && accountSid.trim() && authToken.trim() ? twilio(accountSid, authToken) : null;

const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    console.log('SMS sent:', result.sid);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

module.exports = {
  sendSMS,
};
