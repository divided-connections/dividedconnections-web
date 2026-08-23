exports.handler = async () => {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = "Photo Submissions";

  let allRecords = [];
  let offset = null;

  try {
    do {
      let url =
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

      if (offset) {
        url += `?offset=${encodeURIComponent(offset)}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          statusCode: response.status,
          body: JSON.stringify(result)
        };
      }

      allRecords = allRecords.concat(result.records || []);
      offset = result.offset || null;

    } while (offset);

    // Only approved submissions count anywhere on the public website
const approvedRecords = allRecords.filter(record =>
  record.fields?.Status === "Approved"
);

// 1. Approved photos only
const photosSubmitted = approvedRecords.length;

    // 2. Unique approved cities
    const cities = new Set();

    approvedRecords.forEach(record => {
      const city = (record.fields?.City || "").trim().toLowerCase();

      if (city) {
        cities.add(city);
      }
    });

    // 3. Unique mapped neighborhoods
    // Must be approved AND have Latitude + Longitude
    const neighborhoods = new Set();

    approvedRecords.forEach(record => {
      const f = record.fields || {};

      const city = (f.City || "").trim().toLowerCase();
      const neighborhood = (f.Neighborhood || "").trim().toLowerCase();

      const lat = parseFloat(f.Latitude);
      const lng = parseFloat(f.Longitude);

      if (
        city &&
        neighborhood &&
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        neighborhoods.add(`${city}|${neighborhood}`);
      }
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        photosSubmitted: photosSubmitted,
        citiesDocumented: cities.size,
        neighborhoodsMapped: neighborhoods.size
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
