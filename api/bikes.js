/**
 * Airtable API Proxy for Vercel Serverless Functions
 * This hides the Airtable API Key from the client-side.
 */

export default async function handler(req, res) {
    // 1. Get parameters from request (for both list and detail)
    const { id, ...params } = req.query;

    // 2. Load Airtable configuration from environment variables
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID || 'appaCJExnWJFtszE3';
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Motorcycle Listings';

    if (!apiKey) {
        return res.status(500).json({ error: 'Airtable API Key not configured in Vercel' });
    }

    // 3. Construct Airtable URL
    let url;
    if (id) {
        // Individual record fetch
        url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${id}`;
    } else {
        // Collection fetch with parameters
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            // Airtable parameters like filterByFormula, sort, offset, etc.
            searchParams.append(key, value);
        });
        url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?${searchParams.toString()}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // 4. Return result with same status as Airtable
        return res.status(response.status).json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ error: 'Failed to fetch data from Airtable' });
    }
}
