const { google } = require('googleapis');
const { credentialsPath } = require('./config');
const path = require('path');

// Initialisiere Auth-Client
const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

async function fetchLiveUsers(propertyId) {
  try {
    const client = await auth.getClient();
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth: client });

    const [response] = await analyticsdata.properties.runRealtimeReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dimensions: [{ name: 'unifiedScreenName' }],
        metrics: [{ name: 'activeUsers' }],
      },
    });

    const rows = response.rows || [];
    const total = rows.reduce((sum, row) => {
      return sum + parseInt(row.metricValues[0].value || 0, 10);
    }, 0);

    return total;
  } catch (err) {
    console.error(`❌ GA4-Fehler bei ${propertyId}:`, err.message);
    return 0;
  }
}

module.exports = { fetchLiveUsers };