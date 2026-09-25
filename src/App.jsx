"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Menu, MessageSquare, Plus, Settings, X, Search, Moon, Sun, Monitor, Heart, Shield, Sparkles, Activity, FileText, Download, Check, ChevronDown, Copy, Maximize2, Minimize2, Image, Camera, Paperclip, Music, Video, Smile, Compass, Eye, EyeOff, Lock, Unlock, Square, Cpu, Zap, Bug, PartyPopper, Palette, LogIn, SlidersHorizontal, ChevronLeft, ArrowRight, ChevronRight, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { loadSessionsFromFirestore, saveSessionToFirestore, deleteAllSessions, updateUserLastSeen } from './firestoreUtils';
import { saveMemoryToPinecone, searchMemories } from './ragUtils';
import Login from './Login';
import AgenticLoadingUI from './components/AgenticLoadingUI';
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
const TypewriterMarkdown = ({ content, isNew }) => {
  const [displayedContent, setDisplayedContent] = useState(isNew ? '' : content);
  
  useEffect(() => {
    if (!isNew) {
      setDisplayedContent(content);
      return;
    }
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      setDisplayedContent(content.substring(0, currentIndex));
      currentIndex += 5;
      if (currentIndex > content.length) {
        setDisplayedContent(content);
        clearInterval(interval);
      }
    }, 15);
    
    return () => clearInterval(interval);
  }, [content, isNew]);

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedContent}</ReactMarkdown>;
};

const ProperThinkingAnimation = () => {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', alignSelf: 'flex-start', padding: '10px 0' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(74deg, #4285F4 0%, #9B72CB 46%, #D96570 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={16} color="#ffffff" />
      </div>
      <div style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'linear-gradient(74deg, #4285F4 0%, #9B72CB 46%, #D96570 100%)', boxShadow: '0 0 15px rgba(66, 133, 244, 0.8)' }} />
        <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.3 }} style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'linear-gradient(74deg, #9B72CB 0%, #D96570 100%)', boxShadow: '0 0 15px rgba(155, 114, 203, 0.8)' }} />
        <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.6 }} style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#D96570', boxShadow: '0 0 15px rgba(217, 101, 112, 0.8)' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginLeft: '8px' }} className="gemini-gradient-text">Researching & Processing...</span>
      </div>
    </div>
  );
};

export default function App() {
  const defaultApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // HACK: Force default user if not logged in to bypass login screen
      let activeUser = currentUser ? { ...currentUser } : { uid: 'general_user', email: 'general_user@app.local' };
      // Override uid to create a fresh history category without deleting the old one
      activeUser.uid = activeUser.uid + '_general';
      
      if (activeUser) {
        // Track when Sahityaka opens the app
        updateUserLastSeen(activeUser.uid);
        
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
  const [themePreference, setThemePreference] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sai_theme') || 'default';
    }
    return 'default';
  });
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);

  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [showDownPopup, setShowDownPopup] = useState(false);
  const [callbackStatus, setCallbackStatus] = useState('idle');

  const randomGreeting = useMemo(() => {
    const greetings = [
      "Ready to crush it today?",
      "What's on your mind?",
      "Let's focus on your wellness!",
      "How can I help you shine?",
      "A fresh start. Let's go!",
      "Ready for a healthy day?",
      "What are we conquering today?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }, []);

  const handleRaiseCallback = async () => {
    setCallbackStatus('sending');
    try {
      const BOT_TOKEN = "8161410062:AAFVsVUwgwkkYgl34ANWueyxA0X-kPFC_1Y";
      const CHAT_ID = "1399249612";
      const message = encodeURIComponent("🚨 Callback Request: A user has requested a callback from the SAi_Website due to the temporary downtime popup.");
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${message}`);
      setCallbackStatus('sent');
    } catch (e) {
      console.error(e);
      setCallbackStatus('error');
    }
  };

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
    setCurrentMoodContext(`Right now, the user is feeling: ${mood}`);
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
          api_key: process.env.NEXT_PUBLIC_TAVILY_API_KEY,
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

      // Reset abort tokens
      abortControllerRef.current = new AbortController();
      stopTypingRef.current = false;

      // Call our new Next.js API Route (6-Layer Pipeline)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: newMessages,
          userProfile: user,
          currentMoodContext: currentMoodContext || 'Normal',
          pastMemories: pastMemories || []
        })
      });

      if (!response.ok) {
        throw new Error("System is resting for a moment");
      }

      setIsThinking(false);
      setIsLoading(true);

      // Start reading the text stream from Vercel AI SDK
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let fullReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullReply += chunk;
      }
      
      setIsThinking(false);

      if (!fullReply || fullReply.trim() === '') {
        fullReply = "I'm extremely sorry, but I'm facing very high demand right now and my systems are rate-limited. Please give me a few moments and try again!";
        const fallbackSession = { ...updatedSession, messages: [...newMessages, { role: 'model', content: fullReply }], updatedAt: Date.now() };
        setChatSessions(prev => prev.map(s => s.id === activeSessionId ? fallbackSession : s));
      }

      // After streaming finishes completely, save to Firestore and update UI state
      const finalSession = { 
        id: activeSessionId, 
        title: updatedSession.title, 
        messages: [...newMessages, { role: 'model', content: fullReply, isNew: true }], 
        updatedAt: Date.now() 
      };
      
      setChatSessions(prev => prev.map(s => s.id === activeSessionId ? finalSession : s));
      
      saveSessionToFirestore(user.uid, finalSession);
      saveMemoryToPinecone(fullReply, 'model', activeSessionId);

      setIsLoading(false);
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
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
      const fallbackMsg = `Oh, mera system thoda lag ho raha hai lagta hai. Ek second mujhe saans lene do... wapas bologe please?`;
      
      setChatSessions(prev => prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, { role: 'model', content: fallbackMsg }], updatedAt: Date.now() }
          : s
      ));
      if (user) {
        saveSessionToFirestore(user.uid, { 
          id: activeSessionId, 
          title: newTitle, 
          messages: [...newMessages, { role: 'model', content: fallbackMsg }], 
          updatedAt: Date.now() 
        });
      }
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
                  onPaste={(e) => {
                    const items = e.clipboardData?.items;
                    if (!items) return;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.indexOf('image') !== -1) {
                        e.preventDefault();
                        const file = items[i].getAsFile();
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setSelectedImage({ dataUrl: ev.target.result, mimeType: file.type });
                          };
                          reader.readAsDataURL(file);
                        }
                        break;
                      }
                    }
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
      {/* <AgenticLoadingUI isThinking={isThinking} /> */ }

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
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>S.ai</h2>
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
              {randomGreeting}
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
                            <TypewriterMarkdown content={renderMessageContent(msg.content)} isNew={msg.isNew} />
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
                      {msg.role === 'model' && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px', opacity: 0.5, fontStyle: 'italic', display: 'flex', alignItems: 'center' }}>
                          by S-2.O
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <ProperThinkingAnimation />
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
              <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>How are you feeling right now?</h3>
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
                    {['Appearance', 'Theme', 'My Data', 'My Health Data'].map(opt => {
                      const isDisabled = opt === 'My Data' || opt === 'My Health Data';
                      return (
                        <button
                          key={opt}
                          onClick={() => !isDisabled && setActiveSettingView(opt.toLowerCase().replace(/ /g, ''))}
                          disabled={isDisabled}
                          style={{
                            padding: '16px', borderRadius: '14px', border: 'none',
                            background: 'var(--btn-bg)', color: 'var(--text-primary)',
                            textAlign: 'left', cursor: isDisabled ? 'not-allowed' : 'pointer', fontSize: '1rem',
                            fontWeight: 500, transition: 'background 0.2s',
                            opacity: isDisabled ? 0.4 : 1
                          }}
                          onMouseOver={(e) => { if (!isDisabled) e.target.style.background = 'var(--btn-bg-hover)' }}
                          onMouseOut={(e) => { if (!isDisabled) e.target.style.background = 'var(--btn-bg)' }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      <strong>S</strong> is powered by <strong>BuddyLLM</strong>
                    </p>
                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete ALL your chat history? This cannot be undone.")) {
                          await deleteAllSessions(user.uid);
                          setChatSessions([{ id: generateId(), title: 'New Chat', messages: [], updatedAt: Date.now() }]);
                          setActiveSessionId(chatSessions[0]?.id);
                          setShowSettings(false);
                        }
                      }}
                      style={{ width: '100%', padding: '12px', borderRadius: '14px', border: 'none', background: 'rgba(255, 75, 75, 0.1)', cursor: 'pointer', fontWeight: 600, color: '#ff4b4b' }}
                    >
                      Clear All My Chats
                    </button>
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
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: 'var(--text-primary)', margin: '0 0 12px 0', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                  Introduction
                </h2>
                <div style={{ display: 'inline-block', background: 'rgba(5, 217, 232, 0.15)', color: '#05D9E8', padding: '10px 24px', borderRadius: '24px', fontSize: '1rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
                  Beta Version 1.0.0
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => setShowWhatsNew(true)}
                  style={{ background: 'transparent', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '12px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.target.style.background = 'var(--accent-color)'; e.target.style.color = 'white'; }}
                  onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--accent-color)'; }}
                >
                  See What's New
                </button>
                <button
                  onClick={() => { setShowDisclaimer(false); }}
                  style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = '#0062c3'}
                  onMouseOut={(e) => e.target.style.background = 'var(--accent-color)'}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    {/* Temporarily Down Popup Modal */}
      <AnimatePresence>
        {showDownPopup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--bg-color)', padding: '32px', borderRadius: '24px', maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(255, 75, 75, 0.3)', boxShadow: '0 10px 40px rgba(255, 75, 75, 0.1)' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 75, 75, 0.1)', color: '#ff4b4b', marginBottom: '16px' }}>
                  <AlertTriangle size={32} />
                </div>
                <h2 style={{ color: 'var(--text-primary)', margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: '800' }}>
                  Service Unavailable
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5, margin: 0 }}>
                  We apologize, but this site has been temporarily suspended due to prolonged inactivity and lack of response.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleRaiseCallback}
                  disabled={callbackStatus === 'sending' || callbackStatus === 'sent'}
                  style={{ background: callbackStatus === 'sent' ? '#0ACF83' : '#ff4b4b', color: callbackStatus === 'sent' ? '#000' : 'white', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: callbackStatus === 'sent' ? 'default' : 'pointer', width: '100%', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {callbackStatus === 'idle' && 'Raise a Callback'}
                  {callbackStatus === 'sending' && 'Sending...'}
                  {callbackStatus === 'sent' && <><Check size={20} /> Request Sent</>}
                  {callbackStatus === 'error' && 'Retry Callback'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    {/* What's New Carousel Modal */}
      <AnimatePresence>
        {showWhatsNew && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'rgba(20, 20, 25, 0.45)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', padding: '0', borderRadius: '24px', width: '100%', maxWidth: '600px', height: '80vh', maxHeight: '600px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(5,217,232,0.3)', boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 30px rgba(5,217,232,0.2), inset 0 0 20px rgba(5,217,232,0.1)', overflow: 'hidden', position: 'relative' }}
            >
              {/* Close Button Top Right */}
              <button
                onClick={() => setShowWhatsNew(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              ><X size={20} /></button>

              {/* Slide Content Container */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
                  >
                    {currentSlide === 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                         <div style={{ padding: '24px', background: 'radial-gradient(circle, rgba(5,217,232,0.15) 0%, transparent 70%)', borderRadius: '50%' }}>
                           <Cpu size={64} color="#05D9E8" strokeWidth={1.5} />
                         </div>
                         <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #05D9E8, #B026FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Introducing S-Memory</h2>
                         <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '80%' }}>S now remembers all your past conversations, creating a deeply personalized and seamless experience across all chats.</p>
                      </div>
                    )}
                    {currentSlide === 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                           <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Dynamic AI Persona</h2>
                           <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>S seamlessly adapts to your unique needs.</p>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '420px' }}>
                           {[
                             {t: 'Advanced Intelligence', icon: Sparkles, color: '#05D9E8', bg: 'rgba(5,217,232,0.1)', desc: 'Lightning-fast, highly capable responses'},
                             {t: 'Empathetic Friend', icon: Heart, color: '#FF2A6D', bg: 'rgba(255,42,109,0.1)', desc: 'Understands your mood and emotions'},
                             {t: 'Medical Guidance', icon: Activity, color: '#0ACF83', bg: 'rgba(10,207,131,0.1)', desc: 'Expert insights for your health journey'}
                           ].map((item, i) => (
                             <div key={i} style={{ padding: '12px 16px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                               <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                 <item.icon size={20} color={item.color} />
                               </div>
                               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                 <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.t}</span>
                                 <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', textAlign: 'left' }}>{item.desc}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}
                    {currentSlide === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
                         <div style={{ background: 'rgba(5,217,232,0.1)', color: '#05D9E8', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Custom Typing Enabled</div>
                         
                         {/* Perfect Mockup of chat UI */}
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '600px', background: '#0F0F12', padding: '16px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <div style={{ padding: '8px 14px', background: '#1c1c1e', borderRadius: '24px', color: '#e0e0e0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.03)' }}>Stomach better hai, but energy low hai <ChevronRight size={12} color="rgba(255,255,255,0.4)" /></div>
                                <div style={{ padding: '8px 14px', background: '#1c1c1e', borderRadius: '24px', color: '#e0e0e0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.03)' }}>Joints mein pain zyada hai, need help <ChevronRight size={12} color="rgba(255,255,255,0.4)" /></div>
                              </div>
                              <div style={{ padding: '8px 14px', background: '#1c1c1e', borderRadius: '24px', color: '#e0e0e0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.03)' }}>Routine follow kar rahi hu, lekin improvement slow hai <ChevronRight size={12} color="rgba(255,255,255,0.4)" /></div>
                              <div style={{ padding: '8px 14px', background: '#1c1c1e', borderRadius: '24px', color: '#e0e0e0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.03)' }}>Aaj mood aur anxiety thodi zyada hai <ChevronRight size={12} color="rgba(255,255,255,0.4)" /></div>
                           </div>
                           <div style={{ padding: '12px 16px', background: '#1A1A1C', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <Plus size={18} color="rgba(255,255,255,0.6)" />
                              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', flex: 1, textAlign: 'center' }}>Ask S anything...</span>
                              <div style={{ width: '18px' }}></div>
                           </div>
                         </div>
                      </div>
                    )}
                    {currentSlide === 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                         <div style={{ padding: '32px', background: 'rgba(10, 207, 131, 0.1)', borderRadius: '50%' }}>
                           <Bug size={80} color="#0ACF83" strokeWidth={1.5} />
                         </div>
                         <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Bugs Squashed & Glitches Fixed</h2>
                         <p style={{ color: '#0ACF83', fontSize: '1.1rem', fontWeight: 500 }}>Smoother, faster, and more reliable experience.</p>
                      </div>
                    )}
                    {currentSlide === 4 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
                         <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>What's Next for S</h2>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '550px' }}>
                           {[
                             {t: 'Gen-Z Vibe', desc: 'Trends, Memes & Humor', icon: PartyPopper, color: '#FF3366'}, 
                             {t: 'Advanced UI', desc: 'Hyper-modern interfaces', icon: Palette, color: '#05D9E8'}, 
                             {t: 'Seamless Login', desc: 'Sync across all devices', icon: LogIn, color: '#0ACF83'}, 
                             {t: 'AI Customization', desc: 'Tailor AI to your needs', icon: SlidersHorizontal, color: '#B026FF'}
                           ].map((item, i) => (
                             <div key={i} style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', textAlign: 'left', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                               <div style={{ padding: '6px', background: `rgba(${parseInt(item.color.slice(1,3),16)},${parseInt(item.color.slice(3,5),16)},${parseInt(item.color.slice(5,7),16)},0.1)`, borderRadius: '10px' }}>
                                 <item.icon size={18} color={item.color} />
                               </div>
                               <div>
                                 <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{item.t}</div>
                                 <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>{item.desc}</div>
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Bar */}
              <div style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
                <button 
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  disabled={currentSlide === 0}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', padding: '12px', borderRadius: '14px', color: currentSlide === 0 ? 'rgba(255,255,255,0.2)' : 'white', cursor: currentSlide === 0 ? 'default' : 'pointer', display: 'flex', transition: 'background 0.2s' }}
                  onMouseOver={(e) => currentSlide !== 0 && (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                  onMouseOut={(e) => currentSlide !== 0 && (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                >
                  <ChevronLeft size={24} />
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentSlide === idx ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)', transition: 'background 0.3s, transform 0.3s', transform: currentSlide === idx ? 'scale(1.2)' : 'scale(1)' }} />
                  ))}
                </div>

                {currentSlide < 4 ? (
                  <button 
                    onClick={() => setCurrentSlide(prev => Math.min(4, prev + 1))}
                    style={{ background: 'var(--accent-color)', border: 'none', padding: '12px 24px', borderRadius: '14px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'filter 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                  >
                    Next <ArrowRight size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowWhatsNew(false)}
                    style={{ background: '#0ACF83', border: 'none', padding: '12px 24px', borderRadius: '14px', color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'filter 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                  >
                    Finish <Check size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
