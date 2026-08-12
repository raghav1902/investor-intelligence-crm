const fs = require('fs');
const path = require('path');
const dotenvFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
dotenvFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    const val = values.join('=').trim().replace(/^"(.*)"$/, '$1');
    process.env[key.trim()] = val;
  }
});
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API key length:', apiKey?.length);
  
  // Set up document and window globals
  global.document = {
    createElement: () => ({ getContext: () => null })
  };
  global.window = {};

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  try {
    console.log('Sending test request with global.document / global.window set...');
    const result = await model.generateContent(['Hello, say test!']);
    console.log('Result:', result.response.text());
  } catch (err) {
    console.error('Error occurred:', err);
  }
}

run();
