async function testGeminiRealKey() {
  const GEMINI_API_KEY = "AQ.Ab8RN6Iit-PRNlccAds62808SKCM_vJ_GvUMheFGpSH9ljkMCw";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: { parts: [{ text: "hello" }] }
      })
    });
    console.log("Status:", response.status);
    console.log("Body:", await response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}
testGeminiRealKey();
