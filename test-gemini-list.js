async function listModels() {
  const GEMINI_API_KEY = "AQ.Ab8RN6Iit-PRNlccAds62808SKCM_vJ_GvUMheFGpSH9ljkMCw";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    console.log("Status:", response.status);
    console.log("Body:", await response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}
listModels();
