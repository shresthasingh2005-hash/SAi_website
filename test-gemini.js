async function testGemini() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=invalid_key", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: "hello" }] }
      })
    });
    console.log("Status:", response.status);
    console.log("Body:", await response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}
testGemini();
