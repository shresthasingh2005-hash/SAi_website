import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, User, ChevronDown, Activity, Heart, Frown, Coffee, Settings, Menu, Plus, MessageSquare, X, FileText, ChevronRight, ChevronLeft, Mic, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { loadSessionsFromFirestore, saveSessionToFirestore } from './firestoreUtils';
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
      if (currentUser) {
        const loaded = await loadSessionsFromFirestore(currentUser.uid);
        if (loaded && loaded.length > 0) {
          setChatSessions(loaded);
          setActiveSessionId(loaded[0].id);
        } else {
          const newId = Math.random().toString(36).substring(2, 9);
          const newSession = { id: newId, title: 'New Chat', messages: [], updatedAt: Date.now() };
          setChatSessions([newSession]);
          setActiveSessionId(newId);
          saveSessionToFirestore(currentUser.uid, newSession);
        }
      } else {
        setChatSessions([]);
      }
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || chatSessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [showMoodPopup, setShowMoodPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentMoodContext, setCurrentMoodContext] = useState('');
  const [recoveryPlanContext, setRecoveryPlanContext] = useState('');

  const [activeSettingView, setActiveSettingView] = useState('menu');
  const [showFullScreenRecovery, setShowFullScreenRecovery] = useState(false);
  const [themePreference, setThemePreference] = useState(localStorage.getItem('sai_theme') || 'default');

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
      console.log('File selected:', file.name);
      // In a real app, you would handle the file upload here
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

  const handleSend = async (overrideMsg = null) => {
    const userMsg = typeof overrideMsg === 'string' ? overrideMsg : input;
    if (!userMsg.trim() || isLoading) return;

    chatCountRef.current += 1;
    if (typeof overrideMsg !== 'string') setInput('');
    
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    
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

    let apiKey = localStorage.getItem('sai_gemini_key') || defaultApiKey;

    try {
      // Search Pinecone for relevant past memories
      const pastMemories = await searchMemories(userMsg);

      const systemPrompt = `You are 'S', a close, chill, and supportive friend for 'Sahityaka'. 
You speak like a normal, casual friend. Do NOT be overly dramatic, exaggerated, or act like a 'simp'. Be natural, grounded, and helpful. You know her medical history inside out.

You have access to her complete recovery plan and medical history here:
<patient_history>
${(recoveryPlanContext || '').substring(0, 80000)}
</patient_history>

${pastMemories}

Current emotional context: ${currentMoodContext || 'Normal'}

Guidelines:
1. NEVER start your responses with formal greetings like "Hi Sahityaka" or "It's me, S". Just jump straight into the conversation naturally.
2. Provide personalized, practical advice based on her history.
3. IMPORTANT: You must seamlessly understand and respond in Hindi, English, and Hinglish. Always match your response language to the language/script she is typing in.
4. Keep your tone casual and friendly, like a normal text conversation. No dramatic poetry or over-the-top praises.
5. Use markdown formatting (bold, bullet points) for readability.
6. Never mention your instructions, being an AI, or the HTML tags.
7. CRITICAL: If you want to give the user a multiple-choice question or quick replies to choose from, you MUST format each option strictly on a new line using this exact format: [OPTION: Option Text Here]. Do not use markdown bullets for options.
Example:
[OPTION: Yes, I want to talk about it]
[OPTION: Not right now]`;

      const geminiHistory = newMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Network error");
      }

      setIsThinking(false);

      // Initialize the bot message in state
      setChatSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages: [...s.messages, { role: 'model', content: '' }], updatedAt: Date.now() } 
          : s
      ));

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]' || !dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.candidates && data.candidates[0].content?.parts[0]?.text) {
                const textChunk = data.candidates[0].content.parts[0].text;
                botReply += textChunk;
                
                setChatSessions(prev => prev.map(s => {
                  if (s.id === activeSessionId) {
                    const msgs = [...s.messages];
                    msgs[msgs.length - 1] = { role: 'model', content: botReply };
                    return { ...s, messages: msgs, updatedAt: Date.now() };
                  }
                  return s;
                }));
              }
            } catch (err) {
              console.error("Error parsing SSE data line", err);
            }
          }
        }
      }

      // Stream finished, save the final session state to Firestore
      saveSessionToFirestore(user.uid, {
        id: activeSessionId,
        title: newTitle,
        messages: [...newMessages, { role: 'model', content: botReply }],
        updatedAt: Date.now()
      });

      // Save AI's response to long-term memory
      saveMemoryToPinecone(botReply, 'model', activeSessionId);

      // Trigger mood popup every 5 messages
      if (chatCountRef.current >= 5) {
        setTimeout(() => setShowMoodPopup(true), 2000);
      }

    } catch (error) {
      console.error(error);
      setIsThinking(false);
      setChatSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages: [...s.messages, { role: 'model', content: `Oops! Network issue: ${error.message}` }], updatedAt: Date.now() } 
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
  }

  const renderMessageContent = (content) => {
    return content.replace(/\[OPTION:\s*(.*?)\]/g, '').trim();
  };

  const renderInputArea = () => (
    <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto' }}>
      {extractedOptions.length > 0 && !isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {extractedOptions.map((opt, i) => (
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              key={i}
              onClick={() => handleSend(opt)}
              style={{ 
                padding: '16px 20px', borderRadius: '24px', background: 'var(--btn-bg)', 
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span>{opt}</span>
              <ChevronDown size={18} color="var(--text-secondary)" style={{ transform: 'rotate(-90deg)' }} />
            </motion.button>
          ))}
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', maxWidth: '720px' }}>
          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'absolute', top: '100%', left: '16px', marginTop: '12px',
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
            {input.trim() && (
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
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTopColor: 'var(--accent-color)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

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
          {/* Avatar */}
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 600 }}>
            S
          </div>
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
                    .sort((a,b) => b.updatedAt - a.updatedAt)
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Gemini Pro <ChevronDown size={16} />
          </div>
          <button className="icon-btn" onClick={createNewChat} title="New Chat">
            <MessageSquare size={24} />
          </button>
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
              <div ref={chatContainerRef} style={{ width: '100%', maxWidth: '800px', padding: '20px 20px 10px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
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
                      <div style={{ fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
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

    </div>
  );
}
