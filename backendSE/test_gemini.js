require('dotenv').config();
const { generateReply } = require('./src/utils/gemini');

async function run() {
  try {
    const messages = [
      { role: 'system', content: 'You are a helpful, empathetic assistant for a mental wellbeing app. Keep replies supportive and concise.' },
      { role: 'user', content: 'I have been feeling very anxious about work recently. Any suggestions to cope?' }
    ];

    const result = await generateReply(messages);
    console.log('=== RESULT ===');
    console.log('Reply:', result.reply);
    console.log('Raw:', JSON.stringify(result.raw, null, 2).slice(0, 2000));
  } catch (err) {
    console.error('Test failed:', err && err.message);
    try {
      const util = require('util');
      console.error('Full error object:', util.inspect(err, { depth: null, colors: false }));
    } catch (e) {
      console.error('Error while printing error object', e);
    }
    if (err && err.raw) console.error('Raw error JSON/string:', JSON.stringify(err.raw, null, 2));
    process.exitCode = 1;
  }
}

run();
