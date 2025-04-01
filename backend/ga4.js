// 📦 backend/ga4.js

const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { credentialsPath } = require('./config');
process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

const client = new BetaAnalyticsDataClient();

async function fetchLiveUsers(propertyId) {
  try {
    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: 'unifiedScreenName' }],
      metrics: [{ name: 'activeUsers' }]
    });

    const total = response.rows.reduce((sum, row) => {
      return sum + parseInt(row.metricValues[0].value || 0, 10);
    }, 0);

    return total;
  } catch (err) {
    console.error(`Fehler beim Abrufen von GA4-Daten für ${propertyId}:`, err.message);
    return 0;
  }
}

module.exports = { fetchLiveUsers };