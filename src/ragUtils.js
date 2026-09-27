const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const PINECONE_API_KEY = process.env.NEXT_PUBLIC_PINECONE_API_KEY;
const IS_PROD = process.env.NODE_ENV === 'production';
const PINECONE_URL = IS_PROD ? "/api/pinecone" : "/pinecone";
export const generateEmbedding = async (text) => {
  if (!text || text.trim().length === 0) return null;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/gemini-embedding-2",
        content: { parts: [{ text: text }] },
        outputDimensionality: 768
      })
    });
    const data = await response.json();
    if (data.embedding && data.embedding.values) {
      return data.embedding.values;
    }
    return null;
  } catch (error) {
    console.error("Embedding Error:", error);
    return null;
  }
};

/**
 * Saves a message and its embedding to Pinecone
 */
export const saveMemoryToPinecone = async (text, role, sessionId, uid = 'anonymous') => {
  if (role !== 'user' && role !== 'model') return;
  // We only really need to remember user inputs and important model outputs.
  // For simplicity, let's embed all non-empty messages.
  
  const vector = await generateEmbedding(text);
  if (!vector) return;

  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2,7)}`;
  
  try {
    const fetchOptions = IS_PROD ? {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/vectors/upsert',
        payload: {
          vectors: [{ id, values: vector, metadata: { text, role, sessionId, uid, timestamp: Date.now() } }]
        }
      })
    } : {
      method: 'POST',
      headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vectors: [{ id, values: vector, metadata: { text, role, sessionId, uid, timestamp: Date.now() } }]
      })
    };
    
    const targetUrl = IS_PROD ? PINECONE_URL : `${PINECONE_URL}/vectors/upsert`;
    const response = await fetch(targetUrl, fetchOptions);
    
    if (!response.ok) {
      console.error("Pinecone Upsert Failed:", await response.text());
    } else {
      console.log("Pinecone Upsert Success");
      // Optionally alert for success if needed
    }
  } catch (error) {
    console.error("Pinecone API Error:", error);
  }
};

/**
 * Searches Pinecone for past memories similar to the user's current question
 */
export const searchMemories = async (queryText, uid = 'anonymous') => {
  const vector = await generateEmbedding(queryText);
  if (!vector) return "";

  try {
    const fetchOptions = IS_PROD ? {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/query',
        payload: { vector, topK: 5, includeMetadata: true, filter: { uid } }
      })
    } : {
      method: 'POST',
      headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ vector, topK: 5, includeMetadata: true, filter: { uid } })
    };

    const targetUrl = IS_PROD ? PINECONE_URL : `${PINECONE_URL}/query`;
    const response = await fetch(targetUrl, fetchOptions);

    const data = await response.json();
    if (data.matches && data.matches.length > 0) {
      // Filter out matches with low confidence score (e.g., < 0.65)
      const validMatches = data.matches.filter(m => m.score > 0.65);
      
      if (validMatches.length === 0) return "";

      let memoryContext = "--- PAST CONVERSATION MEMORIES ---\n";
      validMatches.forEach(match => {
        const role = match.metadata.role === 'user' ? 'Sahityaka' : 'S (You)';
        memoryContext += `[${new Date(match.metadata.timestamp).toLocaleDateString()}] ${role}: ${match.metadata.text}\n`;
      });
      memoryContext += "----------------------------------\n";
      return memoryContext;
    }
  } catch (error) {
    console.error("Pinecone Query Error:", error);
  }
  return "";
};
