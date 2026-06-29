export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Api-Key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { endpoint, payload } = req.body;
  const PINECONE_API_KEY = process.env.VITE_PINECONE_API_KEY;
  const PINECONE_HOST = process.env.VITE_PINECONE_HOST;

  if (!PINECONE_API_KEY || !PINECONE_HOST) {
    return res.status(500).json({ error: 'Pinecone env missing' });
  }

  const url = `${PINECONE_HOST}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
