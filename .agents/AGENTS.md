# SAi Website Custom Rules

## Deployment and Code Modification Rules
**CRITICAL: NEVER PUSH WITHOUT EXPLICIT PERMISSION.**
1. Before executing any `git push` or deploying any changes, you MUST explain to the user exactly what changes were made.
2. You MUST explain the effect those changes will have on the website (e.g., UI changes, backend behavior).
3. You MUST ask for explicit confirmation (e.g., "Kya main ise ab push karu?") and wait for the user to say "Yes", "ok", or "push".

## System Architecture State
As of the current state, the system is working **100% perfectly**:
- **Pinecone Memory**: The Pinecone backend (upsert and query) is working flawlessly with `gemini-embedding-2` using `outputDimensionality: 768` to match the index. Do not alter `ragUtils.js` without extreme caution.
- **System Prompt**: The AI persona in `App.jsx` is perfectly balanced. It acts as an advanced general-purpose AI, a friend for casual chat, and an expert doctor *only* when medically necessary. Do not re-introduce the heavy, forced medical context that overrides normal conversation.
- **Frontend/Backend Separation**: Be very careful when making UI changes not to accidentally break the Vite build (e.g., Javascript syntax errors in React files) because a failed build will prevent Vercel from deploying, causing the live site to be stuck on an old version.
