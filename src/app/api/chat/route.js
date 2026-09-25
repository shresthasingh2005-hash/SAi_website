import { streamText, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AQ.Ab8RN6JqjZy-1kDZXGBQkgSzIb6g2CP7sHt5TNyrKIhOZQ5CMA',
});

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || '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',
});

const localproxy = createOpenAI({
  baseURL: 'http://127.0.0.1:31415/v1',
  apiKey: process.env.LOCAL_PROXY_API_KEY || '',
});
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const debugLog = (msg) => {
  try {
    fs.appendFileSync(path.join(process.cwd(), 'debug.log'), new Date().toISOString() + ': ' + msg + '\n');
    console.log(msg);
  } catch(e) {}
};

const loadPrompt = (promptName) => {
  try {
    const promptPath = path.join(process.cwd(), 'src', 'prompts', promptName);
    if (fs.existsSync(promptPath)) {
      return fs.readFileSync(promptPath, 'utf8');
    }
    return `You are a helpful AI assistant (Fallback Persona for ${promptName}).`;
  } catch (err) {
    debugLog(`Error loading prompt ${promptName}: ${err}`);
    return `You are a helpful AI assistant.`;
  }
};

const withTimeout = (promise, ms) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  return Promise.race([
    Promise.resolve(promise).then(res => {
      clearTimeout(timeoutId);
      return res;
    }).catch(err => {
      clearTimeout(timeoutId);
      throw err;
    }),
    timeoutPromise
  ]);
};

const generateWithFallback = async (options) => {
  const modelsToTry = [
    google('gemini-1.5-flash'),
    google('gemini-1.5-pro'),
    localproxy('auto'),
    groq('llama-3.1-8b-instant'),
    localproxy('auto:fast')
  ];
  
  for (const model of modelsToTry) {
    try {
      debugLog(`Trying generateText with model: ${model.modelId}`);
      return await withTimeout(generateText({ ...options, model, maxRetries: 0, maxTokens: 3000 }), 90000); // 90s for long texts
    } catch (err) {
      debugLog(`[Fallback] Model ${model.modelId} failed: ${err.message}`);
    }
  }
  debugLog("All fallback generate models exhausted.");
  throw new Error("All fallback models exhausted.");
};

const streamWithFallback = async (options) => {
  const modelsToTry = [
    google('gemini-1.5-flash'),
    google('gemini-1.5-pro'),
    localproxy('auto'),
    groq('llama-3.1-8b-instant'),
    localproxy('auto:fast')
  ];

  for (const model of modelsToTry) {
    try {
      debugLog(`Trying streamText with model: ${model.modelId}`);
      return await withTimeout(streamText({ ...options, model, maxRetries: 0, maxTokens: 3000 }), 15000);
    } catch (err) {
      debugLog(`[Fallback] Streaming Model ${model.modelId} failed: ${err.message}`);
    }
  }
  debugLog("All fallback streaming models exhausted.");
  throw new Error("All fallback streaming models exhausted.");
};

export async function POST(req) {
  try {
    const { messages, userProfile, pastMemories } = await req.json();
    const lastMessage = messages[messages.length - 1].content;
    
    // Format memory context
    const memoryContext = (pastMemories && pastMemories.length > 0) 
      ? `\n\n[USER'S PAST MEMORIES FROM LONG-TERM DB]:\n${pastMemories}\nUse these memories to personalize the response if relevant.`
      : '';
    const history = messages.slice(0, -1);

    // ==========================================
    // LAYER 0: Task Detector & Orchestrator (Gemini Flash)
    // ==========================================
    console.log("--> [Layer 0] Running Task Detector...");
    let intentStr = '{}';
    try {
      const result = await generateWithFallback({
        system: `You are the Master Orchestrator (Layer 0). 
        Analyze the user prompt and return ONLY a JSON object with:
        - task_type: "coding" | "medico" | "research" | "general"
        - language: user's input language (e.g., "hinglish", "english", "hindi")
        - requires_web_search: boolean
        - vercel_skill: If the user explicitly asks for a framework (like "nextjs", "react", "tailwind", "python"), provide its skill name (e.g., "nextjs-guidelines", "react-best-practices"). Otherwise, leave it null.
        ${memoryContext}`,
        prompt: lastMessage,
      });
      intentStr = result.text;
    } catch (err) {
      console.warn("[Layer 0] API Error. Defaulting to general intent...", err.message);
    }
    
    let intent;
    try {
      intent = JSON.parse(intentStr.replace(/```json|```/g, '').trim());
    } catch(e) {
      intent = { task_type: "general", language: "english", requires_web_search: false };
    }

    console.log("Intent Detected:", intent);

    // ==========================================
    // PREPARE PERSONAS (Single API Key Strategy)
    // ==========================================
    let promptsToUse = [];
    
    // Dynamic Skill Injection via Vercel CLI
    if (intent.vercel_skill) {
      console.log(`--> [Layer 0] Downloading specialized skill: ${intent.vercel_skill}...`);
      try {
        const { stdout } = await execPromise(`npx skills use vercel-labs/agent-skills@${intent.vercel_skill}`);
        if (stdout && stdout.trim().length > 10) {
          promptsToUse.push(stdout);
          console.log(`--> [Layer 0] Skill downloaded successfully!`);
        }
      } catch (err) {
        console.error("Failed to fetch Vercel skill:", err);
      }
    }
    if (intent.task_type === 'coding') {
      promptsToUse = [
        loadPrompt('claude-opus-5.5.md')
      ];
    } else if (intent.task_type === 'research') {
      promptsToUse = [
        loadPrompt('deep-research.md')
      ];
    } else if (intent.task_type === 'medico') {
      promptsToUse = [
        "You are an expert Medical AI skill injected specifically for advanced neurobiology and biochemistry queries. " + loadPrompt('deep-research.md')
      ];
    } else {
      promptsToUse = []; // Skip refinement layers for general chat to speed up response
    }

    // Force the exact language output for all layers
    promptsToUse = promptsToUse.map(prompt => 
      `${prompt}\n\nCRITICAL INSTRUCTION: You MUST write your entire response in ${intent.language || 'the same language the user asked in'}. Do not ignore this.`
    );

    // ==========================================
    // LAYER 1-4: The Refinement Loop (Gemini masquerading as other models)
    // ==========================================
    let currentDraft = lastMessage;
    
    for (let i = 0; i < promptsToUse.length; i++) {
      console.log(`--> [Layer ${i+1}] Refining with Persona...`);
      try {
        let systemPrompt, userPrompt;
        if (i === 0) {
          systemPrompt = promptsToUse[i] + `\n\nYou are the primary writer. Write the FIRST DRAFT for the user's request. Make it as exhaustive, detailed, and comprehensive as required.`;
          userPrompt = `User Request: ${lastMessage}`;
        } else {
          systemPrompt = promptsToUse[i] + `\n\nYou are refining the output of the previous layer. Do not mention that you are refining it, just provide the best possible response to the user's original request based on this draft:\n${currentDraft}`;
          userPrompt = `User Request: ${lastMessage}\n\nRefine this draft: ${currentDraft}`;
        }

        const { text: refinedOutput } = await generateWithFallback({
          system: systemPrompt,
          prompt: userPrompt,
        });
        currentDraft = refinedOutput;
      } catch (err) {
        console.warn(`[Layer ${i+1}] API Error (Rate Limit/High Demand). Breaking loop to salvage current draft...`);
        if (i === 0) currentDraft = lastMessage;
        break;
      }
    }

    // ==========================================
    // LAYER 6: Tone Formatter (Streaming back)
    // ==========================================
    try {
      console.log("--> [Layer 6] Formatting and Streaming...");
      
      let layer6System = "";
      let layer6Prompt = "";
      
      if (intent.task_type === 'general' || currentDraft === lastMessage) {
        // Fast-path for general queries or if refinement failed
        layer6System = `${loadPrompt('claude-fable-5.1.md')}
        
        CRITICAL INSTRUCTION: You MUST write your entire response in ${intent.language || 'the same language the user asked in'}. Do not ignore this.
        
        User Profile Info: ${JSON.stringify(userProfile || {})}
        ${memoryContext}
        `;
        layer6Prompt = `User Request: ${lastMessage}`;
      } else {
        // Formatter path for complex outputs
        layer6System = `You are Buddy LLM's final response formatter. 
        Your job depends on the input you receive:
        - Polish the provided draft to sound human, friendly, and personalized in ${intent.language || 'the same language the user asked in'}. Keep technical accuracy intact and use beautiful markdown.
        
        User Profile Info: ${JSON.stringify(userProfile || {})}
        ${memoryContext}
        `;
        layer6Prompt = `Here is the draft to polish: \n\n${currentDraft}`;
      }

      const result = await streamWithFallback({
        system: layer6System,
        prompt: layer6Prompt,
      });

      return result.toTextStreamResponse();
    } catch (err) {
      let fallbackText = currentDraft;
      if (currentDraft === lastMessage) {
        fallbackText = "I'm really sorry, but I'm facing extremely high demand right now and my systems are rate-limited. Please give me a few moments and try again!";
      }
      return new Response(fallbackText, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }
  } catch (error) {
    console.error("Pipeline Error:", error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), { status: 500 });
  }
}
