const PINECONE_API_KEY = "pcsk_7RdM5Y_2f1LMuccy2Q6yjuhTodPowFJByw16Snwcsw4SLQBNQxwX7Zhf4yxTD5fuqsNXuD";
const PINECONE_HOST = "https://sahityaka-memory-wwrrfo8.svc.aped-4627-b74a.pinecone.io";

async function testPinecone() {
  console.log("Testing Pinecone connection...");
  try {
    const response = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vectors: [{ id: "test", values: new Array(768).fill(0.1) }]
      })
    });
    console.log("Status:", response.status);
    console.log("Body:", await response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

testPinecone();
