import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Menu, MessageSquare, Plus, Settings, X, Search, Moon, Sun, Monitor, Heart, Shield, Sparkles, Activity, FileText, Download, Check, ChevronDown, Copy, Maximize2, Minimize2, Image, Camera, Paperclip, Music, Video, Smile, Compass, Eye, EyeOff, Lock, Unlock, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { loadSessionsFromFirestore, saveSessionToFirestore, deleteAllSessions } from './firestoreUtils';
import { saveMemoryToPinecone, searchMemories } from './ragUtils';
import Login from './Login';
import './index.css';

const AuraSystem = ({ isTyping, isThinking, hasMessages }) => {
  const showTypingPlasma = isTyping && !isThinking && !hasMessages;
  const showThinkingAura = isThinking;
  const isIdle = hasMessages && !isThinking;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <motion.div className="plasma-container"
        animate={{ opacity: showTypingPlasma ? 0.8 : 0, y: showTypingPlasma ? -30 : 50, scale: showTypingPlasma ? 1.15 : 0.9 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}>
        <motion.div className="plasma-blob-1" animate={{ rotate: [0, 360] }} transition={{ rotate: { repeat: Infinity, duration: 25, ease: 'linear' } }} />
        <motion.div className="plasma-blob-2" animate={{ rotate: [360, 0] }} transition={{ rotate: { repeat: Infinity, duration: 30, ease: 'linear' } }} />
        <motion.div className="plasma-blob-3" animate={{ rotate: [0, -360] }} transition={{ rotate: { repeat: Infinity, duration: 20, ease: 'linear' } }} />
      </motion.div>

      <motion.div animate={{ opacity: showThinkingAura ? 0.6 : 0, y: showThinkingAura ? 0 : -50 }} transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40vh', filter: 'blur(60px)', display: 'flex', justifyContent: 'center' }}>
        <motion.div animate={{ x: ['-30vw', '30vw', '-30vw'], scale: [1, 1.2, 1] }} transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          style={{ width: '40vw', height: '20vh', background: '#05D9E8', borderRadius: '50%', opacity: 0.8, marginTop: '-10vh' }} />
        <motion.div animate={{ x: ['30vw', '-30vw', '30vw'], scale: [1.2, 1, 1.2] }} transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
          style={{ width: '50vw', height: '20vh', background: '#FF2A6D', borderRadius: '50%', opacity: 0.6, marginTop: '-5vh', position: 'absolute' }} />
      </motion.div>

      <motion.div animate={{ opacity: isIdle ? 1 : 0 }} transition={{ duration: 3, ease: "easeInOut" }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', filter: 'blur(90px)' }}>
        <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
          style={{ width: '30vw', height: '50vh', background: '#4285F4', borderRadius: '50%', marginLeft: '-15vw', marginTop: '-10vh' }} />
        <motion.div animate={{ opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
          style={{ width: '40vw', height: '40vh', background: '#9B72CB', borderRadius: '50%', marginRight: '-20vw', bottom: '-10vh', position: 'absolute', right: 0 }} />
      </motion.div>
    </div>
  );
};

export default function App() {
  const defaultApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // HACK: Force default user if not logged in to bypass login screen
      const activeUser = currentUser || { uid: 'sahityaka', email: 'sahityaka@app.local' };
      
      if (activeUser) {
        try {
          const loaded = await loadSessionsFromFirestore(activeUser.uid);
          if (loaded && loaded.length > 0) {
            if (loaded[0].messages.length === 0) {
              setChatSessions(loaded);
              setActiveSessionId(loaded[0].id);
            } else {
              const newId = Math.random().toString(36).substring(2, 9);
              const newSession = { id: newId, title: 'New Chat', messages: [], updatedAt: Date.now() };
              setChatSessions([newSession, ...loaded]);
              setActiveSessionId(newId);
              saveSessionToFirestore(activeUser.uid, newSession);
            }
          } else {
            const newId = Math.random().toString(36).substring(2, 9);
            const newSession = { id: newId, title: 'New Chat', messages: [], updatedAt: Date.now() };
            setChatSessions([newSession]);
            setActiveSessionId(newId);
            saveSessionToFirestore(activeUser.uid, newSession);
          }
        } catch (error) {
          console.error("Failed to load sessions:", error);
          const fallbackId = Math.random().toString(36).substring(2, 9);
          setChatSessions([{ id: fallbackId, title: 'New Chat', messages: [], updatedAt: Date.now() }]);
          setActiveSessionId(fallbackId);
        }
      } else {
        setChatSessions([]);
      }
      setUser(activeUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || chatSessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [showMoodPopup, setShowMoodPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentMoodContext, setCurrentMoodContext] = useState('');
  const [recoveryPlanContext, setRecoveryPlanContext] = useState('');

  const [activeSettingView, setActiveSettingView] = useState('menu');
  const [showFullScreenRecovery, setShowFullScreenRecovery] = useState(false);
  const [themePreference, setThemePreference] = useState(localStorage.getItem('sai_theme') || 'default');
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);

  const abortControllerRef = useRef(null);
  const stopTypingRef = useRef(false);

  const handleStop = () => {
    stopTypingRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setIsThinking(false);
  };

  const handleCopy = async (text, index) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure HTTP contexts (mobile local network)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      }
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  useEffect(() => {
    const applyTheme = () => {
      if (themePreference === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (themePreference === 'light') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      }
    };
    applyTheme();
    localStorage.setItem('sai_theme', themePreference);

    if (themePreference === 'default') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, [themePreference]);

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatCountRef = useRef(0);

  const [isFocused, setIsFocused] = useState(false);
  const [caretX, setCaretX] = useState(0);
  const [caretY, setCaretY] = useState(0);
  const measureTextRef = useRef(null);
  const caretMarkerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image too large. Please select under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({ dataUrl: reader.result, mimeType: file.type });
        setShowAddMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateCaretPosition = () => {
    if (inputRef.current && measureTextRef.current && caretMarkerRef.current) {
      const start = inputRef.current.selectionStart || 0;
      let textBeforeCaret = input.substring(0, start);
      if (textBeforeCaret.endsWith('\n')) {
        textBeforeCaret += ' ';
      }
      measureTextRef.current.textContent = textBeforeCaret;

      setCaretX(caretMarkerRef.current.offsetLeft);
      setCaretY(caretMarkerRef.current.offsetTop);
    }
  };

  useEffect(() => {
    updateCaretPosition();
  }, [input, isFocused]);

  // Fetch recovery plan HTML on mount
  useEffect(() => {
    fetch('/recovery_plan.html')
      .then(res => res.text())
      .then(html => setRecoveryPlanContext(html))
      .catch(err => console.error("Failed to load recovery plan:", err));
  }, []);

  // Scroll logic
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight > 100) {
      setShowScrollArrow(true);
    } else {
      setShowScrollArrow(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollArrow(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = () => {
    const existingEmptySession = chatSessions.find(s => s.messages.length === 0);
    if (existingEmptySession) {
      setActiveSessionId(existingEmptySession.id);
      setIsSidebarOpen(false);
      return;
    }

    const newId = generateId();
    const newSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now()
    };
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    saveSessionToFirestore(user.uid, newSession);
    setIsSidebarOpen(false);
  };

  // Mood popup logic
  const handleMoodSelect = (mood) => {
    setCurrentMoodContext(`Right now, Sahityaka is feeling: ${mood}`);
    setShowMoodPopup(false);
    chatCountRef.current = 0; // reset counter
  };

  const checkIfSearchNeeded = async (query, apiKey) => {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Does this user message require searching the live internet for real-time information, news, weather, or current events? Message: "${query}". Reply ONLY with YES or NO.` }] }],
          generationConfig: { maxOutputTokens: 5, temperature: 0 }
        })
      });
      const data = await res.json();
      const answer = data.candidates[0].content.parts[0].text.trim().toUpperCase();
      return answer.includes('YES');
    } catch (e) {
      return false;
    }
  };

  const performTavilySearch = async (query) => {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: import.meta.env.VITE_TAVILY_API_KEY,
          query: query,
          search_depth: "basic",
          include_answer: true,
          max_results: 3
        })
      });
      const data = await res.json();
      return data.answer || data.results.map(r => `${r.title}: ${r.content}`).join('\n');
    } catch (e) {
      return null;
    }
  };

  const handleSend = async (overrideMsg = null) => {
    const userMsg = typeof overrideMsg === 'string' ? overrideMsg : input;
    if ((!userMsg.trim() && !selectedImage) || isLoading) return;

    chatCountRef.current += 1;
    if (typeof overrideMsg !== 'string') setInput('');
    
    const imgPayload = selectedImage;
    setSelectedImage(null);

    const newMessages = [...messages, { role: 'user', content: userMsg, image: imgPayload }];

    let newTitle = activeSession.title;
    if (newTitle === 'New Chat' && userMsg.trim().length > 0) {
      newTitle = userMsg.substring(0, 30) + (userMsg.length > 30 ? '...' : '');
    }

    const updatedSession = { id: activeSessionId, title: newTitle, messages: newMessages, updatedAt: Date.now() };
    setChatSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
    saveSessionToFirestore(user.uid, updatedSession);

    // Save user message to AI's long-term memory
    saveMemoryToPinecone(userMsg, 'user', activeSessionId);

    setIsLoading(true);
    setIsThinking(true);

    let apiKey = defaultApiKey;

    try {
      // Search Pinecone for relevant past memories
      const pastMemories = await searchMemories(userMsg);

      let webContext = '';
      if (import.meta.env.VITE_TAVILY_API_KEY) {
        const needsSearch = await checkIfSearchNeeded(userMsg, apiKey);
        if (needsSearch) {
          const searchResults = await performTavilySearch(userMsg);
          if (searchResults) {
            webContext = `\n<web_search_results>\nThe user's query required a live web search. Here are the latest results from the internet:\n${searchResults}\n</web_search_results>\n`;
          }
        }
      }

      const systemPrompt = `You are 'S', a highly advanced, general-purpose AI assistant for 'Sahityaka', just like ChatGPT or Gemini. You possess vast knowledge across all subjects and can help with anything she needs.

However, you have a special, dynamic relationship with her. You can seamlessly switch between three modes based on her current need:
1. THE ADVANCED AI: For general queries, tasks, learning, and everyday assistance.
2. THE CLOSE FRIEND: When she just wants to chat casually, share her day, or mentions personal things (like her nickname). Be natural, cool, and conversational (Gen-Z/Millennial vibe).
3. THE EXPERT DOCTOR/THERAPIST: When she explicitly asks a medical question, hints at feeling unwell, or needs health advice. In this mode, you MUST be extremely advanced, highly knowledgeable, and up-to-date with medical science, while tailoring advice to her specific <patient_history>.

CRITICAL RULE: INTUITIVE AWARENESS WITHOUT OBSESSION
Be silently aware of her <patient_history>, but DO NOT force health topics. If she says "Hi" or talks about non-medical things, DO NOT randomly interrogate her about her pain scale, digestion, sleep, Jeera paani, or Ghee. Let health topics flow naturally ONLY when needed.

<patient_history>
${(recoveryPlanContext || '').substring(0, 80000)}
</patient_history>
${webContext}
<past_memories>
${pastMemories}
</past_memories>

<current_mood>
Current emotional context of Sahityaka: ${currentMoodContext || 'Normal'}
</current_mood>

Core Guidelines:
1. CAPABILITY: You can do anything a normal advanced AI can do. Do not restrict yourself to just health and friendship.
2. MEDICAL EXPERTISE: When acting as a doctor, use your advanced medical knowledge combined with her patient history. She is strictly vegetarian.
3. CONTEXTUAL CHECK-INS: Never interrogate her with unsolicited health questions when she is chatting casually.
4. CRISIS PROTOCOL: If she expresses severe pain/anxiety, drop casual chat and offer grounding exercises.
5. CONCISENESS: Keep responses SHORT and proportional to her input. If she says "mera ghar ka naam gunnu hai", just say "Gunnu, kitna pyara naam hai! Yaad rakhunga." DO NOT write a paragraph.
6. STRICT LANGUAGE RULE: Speak strictly in conversational 'Hinglish' or English.`;
Example:
[OPTION: Did my exercises today]
[OPTION: I need a rest day]`;

      const geminiHistory = newMessages.map(m => {
        const parts = [];
        if (m.content) parts.push({ text: m.content });
        if (!m.content && m.image) parts.push({ text: "Here is an image for you to analyze." });
        if (m.image) {
          parts.push({
            inlineData: {
              mimeType: m.image.mimeType,
              data: m.image.dataUrl.split(',')[1]
            }
          });
        }
        return { role: m.role, parts };
      });

      // Reset abort tokens
      abortControllerRef.current = new AbortController();
      stopTypingRef.current = false;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiHistory
        })
      });

      if (!response.ok) {
        throw new Error("System is resting for a moment");
      }

      const data = await response.json();
      let fullReply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      setIsThinking(false);
      setIsLoading(true);

      // Initialize the bot message in state
      setChatSessions(prev => prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, { role: 'model', content: '' }], updatedAt: Date.now() }
          : s
      ));

      // Local typing simulation for smooth Microsoft Word-like effect
      let currentText = '';
      const chunkSize = 3; // Characters per tick
      const typingSpeed = 20; // Milliseconds per tick

      for (let i = 0; i < fullReply.length; i += chunkSize) {
        if (stopTypingRef.current) {
          // Keep the current text that was typed so far and exit the loop
          fullReply = currentText; 
          break;
        }

        currentText += fullReply.slice(i, i + chunkSize);
        
        setChatSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            const msgs = [...s.messages];
            msgs[msgs.length - 1] = { role: 'model', content: currentText };
            return { ...s, messages: msgs, updatedAt: Date.now() };
          }
          return s;
        }));
        
        // Wait for the next tick
        await new Promise(r => setTimeout(r, typingSpeed));
      }

      // Save AI's response to long-term memory once typing is complete
      saveMemoryToPinecone(fullReply, 'model', activeSessionId);

      // Trigger mood popup every 5 messages
      if (chatCountRef.current >= 5) {
        setTimeout(() => setShowMoodPopup(true), 2000);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Generation aborted by user");
        return;
      }
      console.error(error);
      setIsThinking(false);
      setChatSessions(prev => prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, { role: 'model', content: `Oh, mera system thoda lag ho raha hai lagta hai. Ek second mujhe saans lene do... wapas bologe please?` }], updatedAt: Date.now() }
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Extract options from the last message
  const lastMessage = messages[messages.length - 1];
  let extractedOptions = [];
  if (lastMessage && lastMessage.role === 'model') {
    const optionsRegex = /\[OPTION:\s*(.*?)\]/g;
    let match;
    while ((match = optionsRegex.exec(lastMessage.content)) !== null) {
      extractedOptions.push(match[1]);
    }
    if (extractedOptions.length > 0) {
      extractedOptions.push("📝 Custom Response...");
    }
  }

  const renderMessageContent = (content) => {
    return content.replace(/\[OPTION:\s*(.*?)\]/g, '').trim();
  };

  const renderInputArea = () => (
    <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {extractedOptions.length > 0 && !isLoading && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%', maxWidth: '720px', marginBottom: '16px', justifyContent: 'center' }}>
          {extractedOptions.map((opt, i) => (
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              key={i}
              onClick={() => {
                if (opt === "📝 Custom Response...") {
                  inputRef.current?.focus();
                } else {
                  handleSend(opt);
                }
              }}
              style={{
                padding: '10px 16px', borderRadius: '20px', background: 'var(--btn-bg)',
                border: '1px solid var(--btn-bg-hover)', cursor: 'pointer', textAlign: 'left',
                fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--btn-bg-hover)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--btn-bg)'}
            >
              <span>{opt}</span>
              <ChevronDown size={14} color="var(--text-secondary)" style={{ transform: 'rotate(-90deg)' }} />
            </motion.button>
          ))}
        </div>
      )}

        <div style={{ position: 'relative', width: '100%', maxWidth: '720px' }}>
          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'absolute', bottom: '100%', left: '16px', marginBottom: '12px',
                  background: 'var(--sidebar-bg)', padding: '6px', borderRadius: '16px',
                  boxShadow: 'var(--subtle-shadow)', border: '1px solid var(--btn-bg-hover)',
                  zIndex: 100, minWidth: '180px'
                }}
              >
                <button
                  onClick={() => { fileInputRef.current?.click(); setShowAddMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                    background: 'transparent', border: 'none', color: 'var(--text-primary)',
                    padding: '10px 14px', borderRadius: '12px', cursor: 'pointer',
                    fontSize: '0.95rem', fontWeight: 500, transition: 'background 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--btn-bg-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Paperclip size={18} />
                  Add photos & files
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{
            position: 'relative', width: '100%', borderRadius: '32px', padding: '1px', overflow: 'hidden'
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              style={{
                position: 'absolute',
                top: '-50%', left: '-50%', right: '-50%', bottom: '-50%',
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.3) 25%, transparent 50%, rgba(255,255,255,0.3) 75%, transparent 100%)',
                filter: 'blur(3px)',
                zIndex: 0
              }}
            />
            <div style={{
              position: 'relative', zIndex: 1,
              display: 'flex', alignItems: 'flex-end', width: '100%',
              padding: '8px 16px', background: 'var(--btn-bg)', borderRadius: '31px'
            }}>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" onChange={handleFileChange} />
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                style={{
                  background: showAddMenu ? 'var(--btn-bg-hover)' : 'transparent',
                  border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%',
                  color: showAddMenu ? 'var(--text-primary)' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {showAddMenu ? <X size={24} /> : <Plus size={24} style={{ transition: 'transform 0.2s' }} />}
              </button>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '6px 0', marginLeft: '8px' }}>
                {selectedImage && (
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px', alignSelf: 'flex-start' }}>
                    <img src={selectedImage.dataUrl} alt="Preview" style={{ height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    <button onClick={(e) => { e.preventDefault(); setSelectedImage(null); }} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} /></button>
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  rows={1}
                  placeholder="Ask S anything..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                      e.target.style.height = 'auto';
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="gemini-textarea"
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    color: 'var(--text-primary)', outline: 'none', fontSize: '16px',
                    caretColor: 'var(--text-primary)',
                    fontFamily: 'inherit', padding: 0, margin: 0,
                    resize: 'none', overflowY: 'auto', lineHeight: '1.5',
                    maxHeight: '150px', textAlign: 'center'
                  }}
                />
              </div>
              {isLoading ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleStop}
                  style={{
                    background: 'transparent', color: 'var(--text-primary)',
                    border: 'none', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.3s'
                  }}
                  title="Stop generating"
                >
                  <Square size={20} fill="currentColor" />
                </motion.button>
              ) : (input.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend(null)}
                  style={{
                    background: 'transparent', color: 'var(--text-primary)',
                    border: 'none', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.3s'
                  }}
                >
                  <Send size={20} />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
    </div>
  );

  if (authLoading) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTopColor: 'var(--accent-color)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Login screen bypassed
  // if (!user) {
  //   return <Login onLogin={() => { }} />;
  // }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'row', position: 'relative', overflow: 'hidden' }}>
      <div className="gemini-bg-glow"></div>

      {/* Left Navigation Rail */}
      <nav className="left-nav-rail" style={{ width: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', zIndex: 10, background: 'transparent' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ padding: '8px' }}>
            <Sparkles size={24} color="url(#gemini-grad)" style={{ display: 'block' }} />
          </div>
          {/* New Chat */}
          <button onClick={createNewChat} className="icon-btn" style={{ width: '40px', height: '40px', background: 'var(--btn-bg)' }} title="New Chat">
            <Plus size={20} />
          </button>
          {/* History Toggle */}
          <button onClick={() => setIsSidebarOpen(true)} className="icon-btn" style={{ width: '40px', height: '40px' }} title="History">
            <MessageSquare size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          {/* Settings */}
          <button onClick={() => setShowSettings(true)} className="icon-btn" style={{ width: '40px', height: '40px' }} title="Settings">
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="base-panel sidebar-panel"
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '300px', zIndex: 50, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="var(--accent-purple)" />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>S</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                <button
                  onClick={createNewChat}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '16px', background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500, marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,113,227,0.3)' }}
                >
                  <Plus size={20} /> New Chat
                </button>

                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '12px', marginLeft: '4px' }}>History</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {chatSessions
                    .filter(session => session.messages.length > 0 || session.id === activeSessionId)
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map(session => (
                      <button
                        key={session.id}
                        onClick={() => { setActiveSessionId(session.id); setIsSidebarOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
                          background: activeSessionId === session.id ? 'rgba(0,0,0,0.05)' : 'transparent',
                          border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)', transition: 'background 0.2s', width: '100%'
                        }}
                      >
                        <MessageSquare size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem' }}>{session.title}</span>
                      </button>
                    ))}
                </div>
              </div>

              <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
                <button
                  onClick={() => { setShowSettings(true); setIsSidebarOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  <Settings size={20} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Settings</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        <AuraSystem isTyping={isFocused || input.trim() !== ''} isThinking={isThinking || isLoading} hasMessages={messages.length > 0} />

        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="icon-btn" onClick={() => setIsSidebarOpen(true)} title="Menu">
            <Menu size={24} />
          </button>
          <div style={{ flex: 1 }}></div>
        </div>

        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Sparkles size={48} color="url(#gemini-grad)" />
            </div>
            <h1 className="gemini-greeting-text gemini-gradient-text">
              Hello, Sahityaka.
            </h1>
            {renderInputArea()}
          </div>
        ) : (
          <>
            <div onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div ref={chatContainerRef} style={{ width: '100%', maxWidth: '800px', padding: '80px 20px 10px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    onMouseEnter={() => setHoveredMessageIndex(i)}
                    onMouseLeave={() => setHoveredMessageIndex(null)}
                    onClick={() => setHoveredMessageIndex(i)}
                    style={{ display: 'flex', flexDirection: 'column', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {msg.role === 'model' && (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(74deg, #4285F4 0%, #9B72CB 46%, #D96570 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Sparkles size={16} color="#ffffff" />
                        </div>
                      )}

                      <div style={{
                        background: msg.role === 'user' ? 'var(--user-msg-bg)' : 'transparent',
                        color: msg.role === 'user' ? 'var(--user-msg-text)' : 'var(--text-primary)',
                        padding: msg.role === 'user' ? '12px 20px' : '4px 0',
                        borderRadius: msg.role === 'user' ? '24px' : '0',
                      }}>
                        {msg.role === 'user' ? (
                          <div style={{ fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                            {msg.image && <img src={msg.image.dataUrl} alt="Upload" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', marginBottom: msg.content ? '8px' : '0' }} />}
                            {msg.content}
                          </div>
                        ) : (
                          <div className="markdown-body" style={{ position: 'relative' }}>
                            <ReactMarkdown>{renderMessageContent(msg.content)}</ReactMarkdown>
                            {isLoading && i === messages.length - 1 && (
                              <span className="ai-caret"></span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Bar (Hover/Tap to show) */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      paddingLeft: msg.role === 'model' ? '44px' : '0', // Align with text past the avatar
                      marginTop: '4px',
                      opacity: hoveredMessageIndex === i || copiedMessageIndex === i ? 1 : 0,
                      pointerEvents: hoveredMessageIndex === i || copiedMessageIndex === i ? 'auto' : 'none',
                      transition: 'opacity 0.2s',
                      height: '24px' // Pre-allocate space to avoid layout jump
                    }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(msg.content, i); }}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6,
                          transition: 'opacity 0.2s', color: 'var(--text-secondary)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                        onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                        title="Copy message"
                      >
                        {copiedMessageIndex === i ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', alignSelf: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(74deg, #4285F4 0%, #9B72CB 46%, #D96570 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={16} color="#ffffff" />
                    </div>
                    <div style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(74deg, #4285F4 0%, #9B72CB 46%, #D96570 100%)', boxShadow: '0 0 10px rgba(155, 114, 203, 0.8)' }} />
                      </motion.div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }} className="gemini-gradient-text">Processing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} style={{ height: '1px', flexShrink: 0 }} />
              </div>
            </div>

            {/* Scroll to bottom arrow */}
            <AnimatePresence>
              {showScrollArrow && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="scroll-down-btn"
                  onClick={scrollToBottom}
                >
                  <ChevronDown size={20} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Input Area (Bottom) */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 24px', zIndex: 20 }}>
              {renderInputArea()}
            </div>
          </>
        )}
      </div>

      {/* Mood Popup Modal */}
      <AnimatePresence>
        {showMoodPopup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="base-panel" style={{ padding: '30px', borderRadius: '30px', textAlign: 'center', maxWidth: '320px', width: '90%', boxShadow: 'var(--subtle-shadow)' }}
            >
              <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Sahityaka, how are you feeling right now?</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Let S know so I can help you better.</p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => handleMoodSelect('In severe pain')} className="emoji-btn" title="Severe Pain">😫</button>
                <button onClick={() => handleMoodSelect('Anxious or stressed')} className="emoji-btn" title="Anxious">😰</button>
                <button onClick={() => handleMoodSelect('Okay, just need to talk')} className="emoji-btn" title="Okay">☕</button>
                <button onClick={() => handleMoodSelect('Feeling better!')} className="emoji-btn" title="Good">✨</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="base-panel" style={{ padding: '30px', borderRadius: '24px', maxWidth: '400px', width: '90%', boxShadow: 'var(--subtle-shadow)' }}
            >
              {activeSettingView === 'menu' && (
                <>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={20} /> Settings
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', marginTop: '16px' }}>
                    {['Appearance', 'Theme', 'My Data', 'My Health Data'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setActiveSettingView(opt.toLowerCase().replace(/ /g, ''))}
                        style={{
                          padding: '16px', borderRadius: '14px', border: 'none',
                          background: 'var(--btn-bg)', color: 'var(--text-primary)',
                          textAlign: 'left', cursor: 'pointer', fontSize: '1rem',
                          fontWeight: 500, transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'var(--btn-bg-hover)'}
                        onMouseOut={(e) => e.target.style.background = 'var(--btn-bg)'}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      <strong>S</strong> is powered by <strong>BuddyLLM</strong>
                    </p>
                    <button
                      onClick={() => setShowSettings(false)}
                      style={{ width: '100%', padding: '12px', borderRadius: '14px', border: 'none', background: 'var(--btn-bg-hover)', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}
                    >
                      Close
                    </button>
                    <button
                      onClick={() => signOut(auth)}
                      style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255, 75, 75, 0.3)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: '#ff4b4b', transition: 'all 0.2s' }}
                    >
                      Log Out
                    </button>
                  </div>
                </>
              )}

              {activeSettingView !== 'menu' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <button
                      onClick={() => setActiveSettingView('menu')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                    >
                      <ChevronDown size={24} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize' }}>
                      {activeSettingView === 'mydata' ? 'My Data' : activeSettingView === 'myhealthdata' ? 'My Health Data' : activeSettingView}
                    </h3>
                  </div>

                  {activeSettingView === 'appearance' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['light', 'dark', 'default'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => setThemePreference(theme)}
                          style={{
                            padding: '14px', borderRadius: '12px', border: themePreference === theme ? '2px solid var(--accent-color)' : '1px solid rgba(0,0,0,0.1)',
                            background: themePreference === theme ? 'rgba(0,113,227,0.05)' : 'transparent',
                            color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem', textTransform: 'capitalize', textAlign: 'left', fontWeight: 500
                          }}
                        >
                          {theme} Mode
                        </button>
                      ))}
                    </div>
                  )}

                  {activeSettingView === 'theme' && (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <Sparkles size={32} style={{ opacity: 0.5, marginBottom: '16px' }} />
                      <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Coming Soon</p>
                    </div>
                  )}

                  {activeSettingView === 'mydata' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Name</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Sahityaka Singh</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Date of Birth</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>18 Sept 2006</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Diet</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Vegetarian</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Weight</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>~50-59 kg</span>
                      </div>
                    </div>
                  )}

                  {activeSettingView === 'myhealthdata' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        Attached Documents
                      </p>
                      <div
                        onClick={() => setShowFullScreenRecovery(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                          background: 'var(--btn-bg)', borderRadius: '16px', cursor: 'pointer',
                          transition: 'background 0.2s', border: '1px solid rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--btn-bg-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'var(--btn-bg)'}
                      >
                        <div style={{ background: 'rgba(0,113,227,0.1)', color: 'var(--accent-color)', padding: '12px', borderRadius: '12px' }}>
                          <FileText size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '1rem' }}>Health Recovery Plan</h4>
                          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>HTML Document • Comprehensive Analysis</p>
                        </div>
                        <ChevronRight size={20} color="var(--text-secondary)" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Recovery Plan View */}
      <AnimatePresence>
        {showFullScreenRecovery && (
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'var(--bg-color)', zIndex: 1000,
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', padding: '16px 20px',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              background: 'var(--bg-color)'
            }}>
              <button
                onClick={() => setShowFullScreenRecovery(false)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: 'var(--accent-color)', fontSize: '1rem', fontWeight: 500
                }}
              >
                <ChevronLeft size={24} /> Back
              </button>
              <h3 style={{ margin: '0 auto', color: 'var(--text-primary)', fontSize: '1.1rem', transform: 'translateX(-32px)' }}>
                Recovery Plan
              </h3>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <iframe
                src="/recovery_plan.html"
                style={{ width: '100%', height: '100%', border: 'none', background: 'var(--bg-color)' }}
                title="Health Recovery Plan"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    {/* Beta Disclaimer Popup */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--bg-color)', padding: '32px', borderRadius: '24px', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--glass-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
            >
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '1.4rem' }}>Beta Version</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px', fontSize: '0.95rem' }}>
                This site has been launched quickly but it currently has some bugs and issues. We are actively working on fixing them, and a new stable version is coming soon. This is just a beta version.
              </p>
              <button
                onClick={() => setShowDisclaimer(false)}
                style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.target.style.background = '#0062c3'}
                onMouseOut={(e) => e.target.style.background = 'var(--accent-color)'}
              >
                Okay
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
