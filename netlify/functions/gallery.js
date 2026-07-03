exports.handler = async () => {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = "Photo Submissions";

  const url =
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}` +
    `?filterByFormula=${encodeURIComponent("{Status}='Approved'")}`;

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

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(result.records)
  };
};
