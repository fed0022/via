// 📦 backend/config.js

const path = require('path');

module.exports = {
  credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../secrets/service-account.json'),
};