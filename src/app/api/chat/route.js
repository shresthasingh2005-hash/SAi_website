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
  baseURL: process.env.LOCAL_PROXY_URL ? `${process.env.LOCAL_PROXY_URL.replace(/\/$/, '')}/v1` : 'http://127.0.0.1:31415/v1',
  apiKey: process.env.LOCAL_PROXY_API_KEY || 'freellmapi-0061d7cc3ccfabaf3588436f5f1f4602de3c83a8c4dadf31',
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
    localproxy('auto'),
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
    localproxy('auto'),
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
    // LAYER 0: Ponytail Compression & Intent Detector
    // ==========================================
    console.log("--> [Layer 0] Running Ponytail Detector...");
    
    // Fast path: skip complex council for very short basic queries (no URLs)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = lastMessage.match(urlRegex);
    
    if (lastMessage.trim().split(/\s+/).length < 8 && !urls) {
      console.log("--> [Layer 0] Short query detected, skipping Council...");
      
      const fastSystem = `${loadPrompt('claude-fable-5.1.md')}
      CRITICAL INSTRUCTION: You MUST reply in the EXACT SAME SCRIPT and LANGUAGE as the user's input. If the user writes in Hinglish, reply in Hinglish. DO NOT use Devanagari script unless the user used it.
      System Information:
      - Current Date and Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      ${memoryContext}`;
      
      const result = await streamWithFallback({ system: fastSystem, prompt: lastMessage });
      return result.toTextStreamResponse();
    }
    
    // Complex path
    let intentStr = '{}';
    try {
      const result = await generateWithFallback({
        system: `You are the Layer 0 'Ponytail' Compressor. 
        Return ONLY a valid JSON object (no markdown, no extra text):
        {
          "requires_web_search": boolean (true if the query needs real-time info, news, or deep facts),
          "search_query": "string" (highly optimized search query if web search is needed),
          "url_to_scrape": "string" (if the user provided a URL to read, extract it here, else null),
          "compressed_query": "string" (Extract ONLY the core instructions and facts from the user. Remove conversational filler.)
        }`,
        prompt: lastMessage,
      });
      intentStr = result.text;
    } catch (err) {
      console.warn("[Layer 0] API Error.", err.message);
    }
    
    let intent;
    try {
      intent = JSON.parse(intentStr.replace(/```json|```/g, '').trim());
    } catch(e) {
      intent = { requires_web_search: false, compressed_query: lastMessage };
    }
    
    let externalData = "";
    
    // ==========================================
    // TOOLS: Jina Web Scraper
    // ==========================================
    const urlToScrape = intent.url_to_scrape || (urls ? urls[0] : null);
    if (urlToScrape) {
      console.log(`--> [Scraper] Scraping URL: ${urlToScrape}...`);
      try {
        const res = await fetch(`https://r.jina.ai/${urlToScrape}`);
        const text = await res.text();
        externalData += `\n\n[SCRAPED WEB CONTENT FROM ${urlToScrape}]:\n${text.substring(0, 5000)}`;
      } catch(e) {
        console.warn("[Scraper] Failed to scrape", e.message);
      }
    }
    
    // ==========================================
    // TOOLS: Tavily Web Search
    // ==========================================
    if (intent.requires_web_search && process.env.NEXT_PUBLIC_TAVILY_API_KEY) {
      const query = intent.search_query || intent.compressed_query || lastMessage;
      console.log(`--> [Search] Searching web for: ${query}...`);
      try {
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: process.env.NEXT_PUBLIC_TAVILY_API_KEY, query, include_answer: true, max_results: 3 })
        });
        const searchData = await res.json();
        externalData += `\n\n[WEB SEARCH RESULTS]:\n${JSON.stringify(searchData.results)}`;
      } catch(e) {
        console.warn("[Search] Failed to search", e.message);
      }
    }
    
    // ==========================================
    // THE COUNCIL (Parallel Generation)
    // ==========================================
    console.log("--> [Council] Executing Drafts in Parallel...");
    const councilPrompt = `User's Core Request: ${intent.compressed_query || lastMessage}
    ${externalData}
    
    CRITICAL INSTRUCTION: Output RAW facts, logic, or code ONLY. No pleasantries. No conversational filler. Just the pure dense output requested.`;

    let draft1 = "", draft2 = "";
    
    try {
      const toolOverride = "\n\nCRITICAL OVERRIDE: Ignore any instructions to use tools, load skills, or output JSON format (like `load_skill`). You DO NOT have access to tools. Simply write your final draft directly in plain text/markdown based on the provided context.";
      
      const cleanPrompt = (text) => text
        .replace(/<tool[\s\S]*?<\/tool[^>]*>/g, '')
        .replace(/<agent_skills[\s\S]*?<\/agent_skills>/g, '')
        .replace(/<tools_workflow[\s\S]*?<\/tools_workflow>/g, '');
      
      const [res1, res2] = await Promise.all([
        generateWithFallback({
          system: cleanPrompt(loadPrompt('claude-opus-5.5.md')) + "\n\nYou are Council Member 1 (Opus). Analyze the context and provide a structured, logical draft. Be highly analytical." + toolOverride,
          prompt: councilPrompt
        }),
        generateWithFallback({
          system: cleanPrompt(loadPrompt('gpt-6-astra.md')) + "\n\nYou are Council Member 2 (Astra). Analyze the context and provide a creative, precise draft. Focus on problem-solving." + toolOverride,
          prompt: councilPrompt
        })
      ]);
      draft1 = res1.text;
      draft2 = res2.text;
    } catch (err) {
      console.warn("[Council] Error generating drafts:", err.message);
      draft1 = lastMessage;
    }
    
    // ==========================================
    // THE SYNTHESIZER (Layer 3 & Stream)
    // ==========================================
    console.log("--> [Synthesizer] Merging and Streaming...");
    
    const synthesizerSystem = `You are Buddy LLM's Final Synthesizer.
    You will receive 'Draft 1' and 'Draft 2' from the AI Council.
    Your job is to read both drafts, extract the best, most accurate, and most useful information from BOTH, and write the FINAL response for the user.
    
    Make the final response human, friendly, beautifully formatted in Markdown, and comprehensive.
    
    CRITICAL INSTRUCTION: You MUST reply in the EXACT SAME SCRIPT and LANGUAGE as the user's input. If the user writes in Hinglish, reply in Hinglish. DO NOT use Devanagari script unless the user used it.
    
    System Information:
    - Current Date and Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    
    User Profile Info: ${JSON.stringify(userProfile || {})}
    ${memoryContext}`;
    
    const synthesizerPrompt = `User's Original Request: ${lastMessage}
    
    --- DRAFT 1 ---
    ${draft1}
    
    --- DRAFT 2 ---
    ${draft2}`;
    
    const result = await streamWithFallback({
      system: synthesizerSystem,
      prompt: synthesizerPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Pipeline Error:", error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), { status: 500 });
  }
}
