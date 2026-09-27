"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Menu, MessageSquare, Plus, Settings, X, Search, Moon, Sun, Monitor, Heart, Shield, Sparkles, Activity, FileText, Download, Check, ChevronDown, Copy, Maximize2, Minimize2, Image, Camera, Paperclip, Music, Video, Smile, Compass, Eye, EyeOff, Lock, Unlock, Square, Cpu, Zap, Bug, PartyPopper, Palette, LogIn, SlidersHorizontal, ChevronLeft, ArrowRight, ChevronRight, AlertTriangle, MoreVertical, Archive, Trash2, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { loadSessionsFromFirestore, saveSessionToFirestore, deleteAllSessions, updateUserLastSeen, deleteSession, moveSessionToDeleted, loadUserProfileData, saveUserProfileData, loadHealthData, saveHealthDataNode, deleteHealthDataNode } from './firestoreUtils';
import { saveMemoryToPinecone, searchMemories } from './ragUtils';
import AgenticLoadingUI from './components/AgenticLoadingUI';
import DarkMidnightMeshBackground from './components/DarkMidnightMeshBackground';
import DarkEmberBackground from './components/DarkEmberBackground';
import Auralis from './components/ui/auralis';
import { TextLoader } from './components/TextLoader';
import GradientSendButton from './components/GradientSendButton';
import { VoicePoweredOrb } from './components/VoicePoweredOrb';
import { PromptInput } from './components/PromptInput';
import LogicalLoader from './components/LogicalLoader';
import Loader from './components/Loader';
import AnimatedGradientBackground from './components/AnimatedGradientBackground';
import './index.css';

const AuraSystem = ({ isTyping, isThinking, hasMessages }) => {
  const showTypingPlasma = isTyping && !isThinking && !hasMessages;
  const showThinkingAura = isThinking;
  const isIdle = false;

  return (
    <div style={{ position: 'absolute', top: '-100px', left: '-100px', right: '-100px', bottom: '-100px', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <motion.div className="plasma-container"
        animate={{ opacity: showTypingPlasma ? 1 : 0, y: showTypingPlasma ? -30 : 50, scale: showTypingPlasma ? 1.25 : 0.9 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}>
        <motion.div className="plasma-blob-1" animate={{ rotate: [0, 360], x: ['-2vw', '3vw', '-2vw'], y: ['0vh', '3vh', '0vh'], scale: [1, 1.2, 1] }} transition={{ duration: 12, ease: 'linear', repeat: Infinity }} />
        <motion.div className="plasma-blob-2" animate={{ rotate: [360, 0], x: ['2vw', '-3vw', '2vw'], y: ['-2vh', '2vh', '-2vh'], scale: [1, 1.25, 1] }} transition={{ duration: 15, ease: 'linear', repeat: Infinity }} />
        <motion.div className="plasma-blob-3" animate={{ rotate: [0, -360], x: ['-1vw', '4vw', '-1vw'], y: ['2vh', '-2vh', '2vh'], scale: [1, 1.3, 1] }} transition={{ duration: 10, ease: 'linear', repeat: Infinity }} />
      </motion.div>

      <motion.div animate={{ opacity: showThinkingAura ? 1 : 0, y: showThinkingAura ? 0 : -50 }} transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '100px', left: '100px', right: '100px', height: '40vh', display: 'flex', justifyContent: 'center', willChange: 'opacity, transform', filter: 'blur(80px)' }}>
        <motion.div animate={{ x: ['-30vw', '30vw', '-30vw'], scale: [1, 1.3, 1] }} transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          style={{ width: '40vw', height: '20vh', background: '#05D9E8', borderRadius: '50%', opacity: 0.9, marginTop: '-10vh', willChange: 'transform' }} />
        <motion.div animate={{ x: ['30vw', '-30vw', '30vw'], scale: [1.3, 1, 1.3] }} transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
          style={{ width: '50vw', height: '20vh', background: '#FF2A6D', borderRadius: '50%', opacity: 0.8, marginTop: '-5vh', position: 'absolute', willChange: 'transform' }} />
      </motion.div>

      <motion.div animate={{ opacity: isIdle ? 1 : 0 }} transition={{ duration: 3, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '100px', left: '100px', right: '100px', bottom: '100px', display: 'flex', justifyContent: 'space-between', willChange: 'opacity', filter: 'blur(80px)', transform: 'translateZ(0)' }}>
        <motion.div animate={{ opacity: [0.4, 0.7, 0.4], x: ['0vw', '5vw', '0vw'], y: ['0vh', '-5vh', '0vh'], scale: [1, 1.2, 1] }} transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
          style={{ width: '30vw', height: '50vh', background: '#9333ea', borderRadius: '50%', marginLeft: '-15vw', marginTop: '-10vh', willChange: 'transform, opacity', transform: 'translateZ(0)' }} />
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3], x: ['0vw', '-6vw', '0vw'], y: ['0vh', '4vh', '0vh'], scale: [1, 1.3, 1] }} transition={{ duration: 15, ease: "easeInOut", repeat: Infinity, delay: 7.5 }}
          style={{ width: '40vw', height: '40vh', background: '#a855f7', borderRadius: '50%', marginRight: '-20vw', bottom: '-10vh', position: 'absolute', right: 0, willChange: 'transform, opacity', transform: 'translateZ(0)' }} />
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



export default function App() {
  const defaultApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Option B: Guest Limit & Onboarding
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState({ name: '', dob: '', diet: '', weightHeight: '', email: '', phone: '', healthInfo: '' });

  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [bgTheme, setBgTheme] = useState('midnight');

  const [locationData, setLocationData] = useState(null);
  const [realTimeClock, setRealTimeClock] = useState(new Date());

  const [myData, setMyData] = useState({ name: '', dob: '', diet: '', weightHeight: '', email: '', phone: '' });
  const [isEditingMyData, setIsEditingMyData] = useState(false);
  const [healthData, setHealthData] = useState([]);
  const [showAddHealthTextModal, setShowAddHealthTextModal] = useState(false);
  const [newHealthText, setNewHealthText] = useState('');

  useEffect(() => {
    // Start real-time clock
    const timer = setInterval(() => {
      setRealTimeClock(new Date());
    }, 1000);

    // Fetch IP-based location data
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setLocationData(data);
        }
      })
      .catch(err => console.error("Failed to fetch location", err));

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setBgTheme('midnight');
  }, []);

  useEffect(() => {
    if (!auth || !auth.app) {
      console.warn("Firebase Auth is not initialized. Please check Environment Variables.");
      setAuthLoading(false);
      return;
    }
    
    // Add Google sign-in handler
    const handleGoogleSignIn = async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        setShowAuthModal(false);
      } catch (error) {
        console.error("Error signing in with Google:", error);
      }
    };
    
    const handleOnboardingSubmit = async (e) => {
      e.preventDefault();
      if (!user) return;
      try {
        await saveUserProfileData(user.uid, onboardingData);
        setMyData(onboardingData);
        setShowOnboardingModal(false);
      } catch (err) {
        console.error("Failed to save onboarding data", err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      let activeUser = currentUser;
      
      if (activeUser) {
        // Track when Sahityaka opens the app
        try {
          updateUserLastSeen(activeUser.uid);
        } catch(e) { console.warn("Could not update last seen", e) }
        
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
              try { saveSessionToFirestore(activeUser.uid, newSession); } catch(e){}
            }
          } else {
            const newId = Math.random().toString(36).substring(2, 9);
            const newSession = { id: newId, title: 'New Chat', messages: [], updatedAt: Date.now() };
            setChatSessions([newSession]);
            setActiveSessionId(newId);
            try { saveSessionToFirestore(activeUser.uid, newSession); } catch(e){}
          }
          
          try {
            const profileData = await loadUserProfileData(activeUser.uid);
            if (profileData && profileData.name) {
              setMyData(profileData);
            } else {
              setShowOnboardingModal(true);
            }
            
            const hData = await loadHealthData(activeUser.uid);
            if (hData && hData.length > 0) setHealthData(hData);
          } catch (e) {
            console.error("Error loading user profile/health data", e);
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
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Briefly peek the sidebar on initial load to show users it's there
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    
    const timer1 = setTimeout(() => {
      if (isMobile) {
        setIsSidebarOpen(true);
      } else {
        setIsHoveringSidebar(true);
      }
    }, 800);
    
    const timer2 = setTimeout(() => {
      if (isMobile) {
        setIsSidebarOpen(false);
      } else {
        setIsHoveringSidebar(false);
      }
    }, 2500); // Close after 1.7s
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || chatSessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const [input, setInput] = useState('');
  const [placeholderDots, setPlaceholderDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editInput, setEditInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [showMoodPopup, setShowMoodPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentMoodContext, setCurrentMoodContext] = useState('');
  const [recoveryPlanContext, setRecoveryPlanContext] = useState('');
  const [showChatMenuForId, setShowChatMenuForId] = useState(null);

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const updated = { ...session, deletedAt: Date.now(), updatedAt: Date.now() };
    saveSessionToFirestore(user?.uid, updated);
    setChatSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
    
    if (activeSessionId === sessionId) {
      const remaining = chatSessions.filter(s => s.id !== sessionId && !s.deletedAt && !s.isArchived);
      setActiveSessionId(remaining[0]?.id || null);
    }
    setShowChatMenuForId(null);
  };

  const handleRestoreSession = async (session) => {
    const updated = { ...session, deletedAt: null, updatedAt: Date.now() };
    saveSessionToFirestore(user?.uid, updated);
    setChatSessions(prev => prev.map(s => s.id === session.id ? updated : s));
  };

  useEffect(() => {
    const checkExpiredSessions = async () => {
      const now = Date.now();
      const SEVENTY_TWO_HOURS = 72 * 60 * 60 * 1000;
      const expiredSessions = chatSessions.filter(s => s.deletedAt && (now - s.deletedAt > SEVENTY_TWO_HOURS));
      
      let anyMoved = false;
      for (const session of expiredSessions) {
        if (user?.uid) {
          await moveSessionToDeleted(user.uid, session);
          anyMoved = true;
        }
      }
      if (anyMoved) {
        setChatSessions(prev => prev.filter(s => !(s.deletedAt && (now - s.deletedAt > SEVENTY_TWO_HOURS))));
      }
    };
    if (chatSessions.length > 0 && user?.uid) {
      checkExpiredSessions();
    }
  }, [chatSessions.length, user]);

  const handleArchiveSession = async (e, session) => {
    e.stopPropagation();
    const updated = { ...session, isArchived: true, updatedAt: Date.now() };
    saveSessionToFirestore(user?.uid, updated);
    setChatSessions(prev => prev.map(s => s.id === session.id ? updated : s));
    if (activeSessionId === session.id) {
       const activeRemaining = chatSessions.filter(s => s.id !== session.id && !s.isArchived);
       setActiveSessionId(activeRemaining[0]?.id || null);
    }
    setShowChatMenuForId(null);
  };

  const handleUnarchiveSession = async (session) => {
    const updated = { ...session, isArchived: false, updatedAt: Date.now() };
    saveSessionToFirestore(user?.uid, updated);
    setChatSessions(prev => prev.map(s => s.id === session.id ? updated : s));
  };

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
      let textToCopy = text;
      const element = document.getElementById(`msg-content-${index}`);
      if (element) {
        textToCopy = element.innerText;
      }
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
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
    if (chatContainerRef.current && chatContainerRef.current.parentElement) {
      chatContainerRef.current.parentElement.scrollTo({
        top: chatContainerRef.current.parentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
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

  const handleVariantChange = (index, direction) => {
     setChatSessions(prev => prev.map(session => {
        if (session.id !== activeSessionId) return session;
        const newMsgs = [...session.messages];
        const modelMsg = { ...newMsgs[index] };
        const userMsg = { ...newMsgs[index - 1] };
        
        let newVariant = (modelMsg.activeVariant || 0) + direction;
        if (!modelMsg.variants || newVariant < 0 || newVariant >= modelMsg.variants.length) return session;
        
        modelMsg.activeVariant = newVariant;
        modelMsg.content = modelMsg.variants[newVariant];
        
        if (userMsg.variants && newVariant < userMsg.variants.length) {
          userMsg.activeVariant = newVariant;
          userMsg.content = userMsg.variants[newVariant];
        }
        
        newMsgs[index] = modelMsg;
        newMsgs[index - 1] = userMsg;
        
        return { ...session, messages: newMsgs };
     }));
     // Note: We'd want to also persist this change, but for simple navigation we can just update local state,
     // or trigger a save. Let's do a quick save.
     const updatedSession = { ...chatSessions.find(s => s.id === activeSessionId), messages: [...messages] };
     saveSessionToFirestore(user?.uid, updatedSession);
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

  const handleSend = async (overrideMsg = null, overrideAttachments = null, editIndex = null) => {
    if (!user && guestMessageCount >= 1) {
      setShowAuthModal(true);
      return;
    }
    
    if (!user) {
      setGuestMessageCount(prev => prev + 1);
    }
    
    const userMsgContent = typeof overrideMsg === 'string' ? overrideMsg : input;
    const finalAttachments = overrideAttachments || selectedImage;
    if ((!userMsgContent.trim() && (!finalAttachments || finalAttachments.length === 0)) || isLoading) return;

    chatCountRef.current += 1;
    if (typeof overrideMsg !== 'string' && editIndex === null) setInput('');
    
    setSelectedImage(null);

    const attachmentsArray = Array.isArray(finalAttachments) ? finalAttachments : (finalAttachments ? [finalAttachments] : null);
    
    let newMessages;
    let newModelVariants = [];
    let newModelActiveVariant = 0;
    
    if (editIndex !== null) {
      let oldUserMsg = { ...messages[editIndex] };
      let oldModelMsg = messages[editIndex + 1];
      
      let userVariants = oldUserMsg.variants || [oldUserMsg.content];
      userVariants = [...userVariants, userMsgContent];
      oldUserMsg.variants = userVariants;
      oldUserMsg.activeVariant = userVariants.length - 1;
      oldUserMsg.content = userMsgContent; 
      
      newMessages = [...messages.slice(0, editIndex), oldUserMsg];
      
      if (oldModelMsg) {
         newModelVariants = oldModelMsg.variants || [oldModelMsg.content];
         newModelActiveVariant = newModelVariants.length;
         newModelVariants = [...newModelVariants, ""]; // placeholder
      }
      setEditingMessageIndex(null);
      setEditInput('');
    } else {
      newMessages = [...messages, { role: 'user', content: userMsgContent, attachments: attachmentsArray }];
    }

    let newTitle = activeSession.title;
    if (newTitle === 'New Chat' && userMsgContent.trim().length > 0) {
      newTitle = userMsgContent.substring(0, 30) + (userMsgContent.length > 30 ? '...' : '');
    }

    const updatedSession = { id: activeSessionId, title: newTitle, messages: newMessages, updatedAt: Date.now() };
    setChatSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
    if (user) {
      saveSessionToFirestore(user.uid, updatedSession);
    } else {
      saveSessionToFirestore("guest_user", updatedSession);
    }

    // Save user message to AI's long-term memory
    saveMemoryToPinecone(userMsgContent, 'user', activeSessionId, user?.uid);

    setIsLoading(true);
    setIsThinking(true);

    let apiKey = defaultApiKey;
    let fullReply = '';

    try {
      // Search Pinecone for relevant past memories
      const pastMemories = await searchMemories(userMsgContent, user?.uid);

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
          myData: myData,
          healthData: healthData,
          pastMemories: pastMemories || [],
          locationData: locationData,
          currentTime: realTimeClock.toISOString()
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

      let extractedHealth = null;
      let cleanedReply = fullReply;
      const healthMatch = fullReply.match(/\[HEALTH_MEMORY:\s*(.*?)\]/);
      if (healthMatch) {
        extractedHealth = healthMatch[1];
        cleanedReply = fullReply.replace(/\[HEALTH_MEMORY:\s*(.*?)\]/g, '').trim();
      }

      let finalModelMsg;
      if (editIndex !== null) {
        finalModelMsg = {
          role: 'model',
          content: cleanedReply,
          isNew: true,
          variants: newModelVariants,
          activeVariant: newModelActiveVariant
        };
        finalModelMsg.variants[newModelActiveVariant] = cleanedReply;
      } else {
        finalModelMsg = { role: 'model', content: cleanedReply, isNew: true };
      }

      // After streaming finishes completely, save to Firestore and update UI state
      const finalSession = { 
        id: activeSessionId, 
        title: updatedSession.title, 
        messages: [...newMessages, finalModelMsg], 
        updatedAt: Date.now() 
      };
      
      setChatSessions(prev => prev.map(s => s.id === activeSessionId ? finalSession : s));
      
      if (user) {
        saveSessionToFirestore(user.uid, finalSession);
        
        if (extractedHealth) {
          const newNode = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            content: extractedHealth,
            type: 'text'
          };
          saveHealthDataNode(user.uid, newNode);
          setHealthData(prev => [...(prev||[]), newNode]);
        }
      } else {
        saveSessionToFirestore("guest_user", finalSession);
      }
      saveMemoryToPinecone(cleanedReply, 'model', activeSessionId, user?.uid);

      setIsLoading(false);
      scrollToBottom();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Generation aborted by user");
        if (fullReply.trim() !== '') {
          let finalModelMsg;
          if (editIndex !== null) {
            finalModelMsg = {
              role: 'model',
              content: fullReply,
              isNew: true,
              variants: newModelVariants,
              activeVariant: newModelActiveVariant
            };
            finalModelMsg.variants[newModelActiveVariant] = fullReply;
          } else {
            finalModelMsg = { role: 'model', content: fullReply, isNew: true };
          }
          const finalSession = { id: activeSessionId, title: updatedSession.title, messages: [...newMessages, finalModelMsg], updatedAt: Date.now() };
          setChatSessions(prev => prev.map(s => s.id === activeSessionId ? finalSession : s));
          if (user) {
            saveSessionToFirestore(user.uid, finalSession);
          } else {
            saveSessionToFirestore("guest_user", finalSession);
          }
          saveMemoryToPinecone(fullReply, 'model', activeSessionId, user?.uid);
        }
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
      const fallbackUpdate = { 
        id: activeSessionId, 
        title: newTitle, 
        messages: [...newMessages, { role: 'model', content: fallbackMsg }], 
        updatedAt: Date.now() 
      };
      if (user) {
        saveSessionToFirestore(user.uid, fallbackUpdate);
      } else {
        saveSessionToFirestore("guest_user", fallbackUpdate);
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
      <div style={{ position: 'relative', width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
        <div style={{ width: '100%', pointerEvents: 'auto', opacity: isLoading ? 0.8 : 1, transition: 'opacity 0.3s' }}>
          <PromptInput
            ref={inputRef}
            value={input}
            onChange={setInput}
            isThinking={isThinking || isLoading}
            onStop={handleStop}
            onSubmit={async (val, { model, effort, attachments }) => {
              if (attachments && attachments.length > 0) {
                 const processedAttachments = await Promise.all(attachments.map(file => {
                   return new Promise((resolve) => {
                     const reader = new FileReader();
                     reader.onloadend = () => {
                       resolve({ dataUrl: reader.result, mimeType: file.type, name: file.name });
                     };
                     reader.readAsDataURL(file);
                   });
                 }));
                 setSelectedImage(processedAttachments);
                 setTimeout(() => handleSend(val, processedAttachments), 0);
              } else {
                 handleSend(val);
              }
            }}
            placeholder={`Ask S.Ai a question${placeholderDots}`}
          />
        </div>
      </div>
    </div>
  );



  // Login screen bypassed
  // if (!user) {
  //   return <Login onLogin={() => { }} />;
  // }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'row', position: 'relative', overflow: 'hidden' }}>
      
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            <AnimatedGradientBackground />
          </motion.div>
        )}
      </AnimatePresence>

      <Auralis speed={0.15} grain={0.2} />
      {/* <AgenticLoadingUI isThinking={isThinking} /> */ }

      <AuraSystem isTyping={isFocused || input.trim() !== ''} isThinking={isThinking || isLoading} hasMessages={messages.length > 0} />

      {/* Desktop Left Rail - Expands on hover */}
      <nav 
        className="left-nav-rail hidden md:flex" 
        style={{ 
          width: (isHoveringSidebar || isSidebarPinned) ? '260px' : '64px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          justifyContent: 'space-between', 
          padding: '16px 0', 
          zIndex: 50, 
          background: (isHoveringSidebar || isSidebarPinned) ? 'rgba(10,10,10,0.95)' : 'transparent',
          backdropFilter: (isHoveringSidebar || isSidebarPinned) ? 'blur(16px)' : 'none',
          borderRight: (isHoveringSidebar || isSidebarPinned) ? '1px solid rgba(255,255,255,0.05)' : 'none',
          boxShadow: (isHoveringSidebar || isSidebarPinned) ? '4px 0 24px rgba(0,0,0,0.5)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'fixed',
          top: 0, left: 0, bottom: 0
        }}
        onMouseEnter={() => setIsHoveringSidebar(true)}
        onMouseLeave={() => setIsHoveringSidebar(false)}
      >
          {/* Top Icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', padding: '0 12px', flex: 1, overflow: 'hidden' }}>
            {/* Hamburger (Always visible) */}
            <button className="icon-btn" style={{ width: '40px', height: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }} onClick={() => setIsSidebarPinned(!isSidebarPinned)}>
               <Menu size={20} />
            </button>

            {/* Hidden items that show on hover */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: (isHoveringSidebar || isSidebarPinned) ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: (isHoveringSidebar || isSidebarPinned) ? 'auto' : 'none', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
              <button onClick={createNewChat} className="icon-btn" style={{ width: '100%', height: '40px', background: 'var(--btn-bg)', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', justifyContent: 'flex-start', borderRadius: '12px' }}>
                <Plus size={20} style={{ flexShrink: 0 }} />
                <span>New Chat</span>
              </button>
              
              <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginTop: '8px', padding: '0 16px' }}>History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, paddingRight: '4px' }} className="prompt-scrollbar">
                {user ? (
                  chatSessions
                    .filter(session => !session.isArchived && !session.deletedAt && session.messages.length > 0)
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map(session => (
                      <div key={session.id} style={{ position: 'relative' }} onMouseLeave={() => setShowChatMenuForId(null)}>
                        <button
                          onClick={() => { setActiveSessionId(session.id); setIsHoveringSidebar(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '12px',
                            background: activeSessionId === session.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)', transition: 'background 0.2s', width: '100%', flexShrink: 0
                          }}
                          onMouseOver={(e) => { if(activeSessionId !== session.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                          onMouseOut={(e) => { if(activeSessionId !== session.id) e.currentTarget.style.background = 'transparent' }}
                        >
                          <MessageSquare size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem' }}>{session.title}</span>
                          <div onClick={(e) => { e.stopPropagation(); setShowChatMenuForId(showChatMenuForId === session.id ? null : session.id); }} style={{ padding: '4px', borderRadius: '4px', background: 'transparent' }} className="hover:bg-white/10 transition-colors">
                            <MoreVertical size={16} color="var(--text-secondary)" />
                          </div>
                        </button>
                        {showChatMenuForId === session.id && (
                          <div style={{ position: 'absolute', right: '40px', top: '10px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px', zIndex: 10, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                            <button onClick={(e) => handleArchiveSession(e, session)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }} className="hover:bg-white/10">
                              <Archive size={14} /> <span style={{fontSize: '0.85rem'}}>Archive</span>
                            </button>
                            <button onClick={(e) => handleDeleteSession(e, session.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }} className="hover:bg-white/10">
                              <Trash2 size={14} /> <span style={{fontSize: '0.85rem'}}>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%' }}>
                      <Lock size={24} color="var(--text-secondary)" />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }}>Unlock History</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'normal', lineHeight: '1.4' }}>Login to view and manage your chat history.</span>
                    <button onClick={() => setShowAuthModal(true)} style={{ marginTop: '8px', padding: '8px 16px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                      Login Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', padding: '0 12px', opacity: (isHoveringSidebar || isSidebarPinned) ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: (isHoveringSidebar || isSidebarPinned) ? 'auto' : 'none', overflow: 'hidden', whiteSpace: 'nowrap', borderTop: (isHoveringSidebar || isSidebarPinned) ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingTop: (isHoveringSidebar || isSidebarPinned) ? '16px' : '0' }}>
            {user ? (
              <button onClick={() => setShowSettings(true)} className="icon-btn" style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', justifyContent: 'flex-start', borderRadius: '12px' }}>
                <Settings size={20} style={{ flexShrink: 0 }} />
                <span>Settings</span>
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="icon-btn" style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', justifyContent: 'flex-start', borderRadius: '12px' }}>
                <LogIn size={20} style={{ flexShrink: 0 }} />
                <span>Login or Register</span>
              </button>
            )}
          </div>
      </nav>
      {/* Spacer so main content doesn't go under fixed nav */}
      <div style={{ width: '64px', flexShrink: 0 }} className="hidden md:block" />

      {/* Sidebar Drawer */}
      <div className="md:hidden">
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
                  {user ? (
                    chatSessions
                      .filter(session => !session.isArchived && !session.deletedAt && session.messages.length > 0)
                      .sort((a, b) => b.updatedAt - a.updatedAt)
                      .map(session => (
                        <div key={session.id} style={{ position: 'relative' }} onMouseLeave={() => setShowChatMenuForId(null)}>
                          <button
                            onClick={() => { setActiveSessionId(session.id); setIsSidebarOpen(false); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
                              background: activeSessionId === session.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                              border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)', transition: 'background 0.2s', width: '100%'
                            }}
                          >
                            <MessageSquare size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem' }}>{session.title}</span>
                            <div onClick={(e) => { e.stopPropagation(); setShowChatMenuForId(showChatMenuForId === session.id ? null : session.id); }} style={{ padding: '4px', borderRadius: '4px', background: 'transparent' }} className="hover:bg-white/10 transition-colors">
                              <MoreVertical size={16} color="var(--text-secondary)" />
                            </div>
                          </button>
                          {showChatMenuForId === session.id && (
                            <div style={{ position: 'absolute', right: '40px', top: '10px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px', zIndex: 10, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                              <button onClick={(e) => handleArchiveSession(e, session)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }} className="hover:bg-white/10">
                                <Archive size={14} /> <span style={{fontSize: '0.85rem'}}>Archive</span>
                              </button>
                              <button onClick={(e) => handleDeleteSession(e, session.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }} className="hover:bg-white/10">
                                <Trash2 size={14} /> <span style={{fontSize: '0.85rem'}}>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%' }}>
                        <Lock size={24} color="var(--text-secondary)" />
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }}>Unlock History</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'normal', lineHeight: '1.4' }}>Login to view and manage your chat history.</span>
                      <button onClick={() => { setIsSidebarOpen(false); setShowAuthModal(true); }} style={{ marginTop: '8px', padding: '8px 16px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                        Login Now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
                {user ? (
                  <button
                    onClick={() => { setShowSettings(true); setIsSidebarOpen(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                  >
                    <Settings size={20} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Settings</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowAuthModal(true); setIsSidebarOpen(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                  >
                    <LogIn size={20} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Login or Register</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div 
        style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
        onClick={() => {
          if (isSidebarPinned) setIsSidebarPinned(false);
        }}
      >

        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="icon-btn" onClick={() => setIsSidebarOpen(true)} title="Menu">
            <Menu size={24} />
          </button>
          <div style={{ flex: 1 }}></div>
        </div>

        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', transform: 'translateY(-20px)' }}>
              {renderInputArea()}
            </div>
            
            {/* Quick Action Chips */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px', opacity: 0, animation: 'fadeInUp 0.8s ease-out 0.2s forwards' }}>
              <style>{`
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              {[
                { 
                  icon: '🩺', 
                  text: 'Check Symptoms', 
                  prompt: 'I am experiencing some symptoms and need your help. Please act as a medical assistant and ask me questions one by one about how I am feeling, when it started, and my medical history before giving any suggestions.' 
                },
                { 
                  icon: '💊', 
                  text: 'Medication Info', 
                  prompt: 'I need information about a medication. Please ask me the name of the medicine, my dosage, and if I have any specific concerns (like side effects or interactions) before providing the details.' 
                },
                { 
                  icon: '🥗', 
                  text: 'Diet Plan', 
                  prompt: 'I want a personalized diet plan. Please act as a nutritionist and ask me step-by-step about my goals (e.g., weight loss, muscle gain), medical conditions (like IBS or diabetes), and food allergies before creating a routine.' 
                },
                { 
                  icon: '🧘‍♀️', 
                  text: 'Mental Wellness', 
                  prompt: 'I am looking for some mental wellness and stress relief advice. Please ask me how I am feeling today and what might be bothering me so you can suggest the right breathing exercises or routines.' 
                }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(chip.prompt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 18px', borderRadius: '100px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                    backdropFilter: 'blur(64px)'
                  }}
                  onMouseOver={(e) => { 
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; 
                    e.currentTarget.style.color = '#fff'; 
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => { 
                    e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; 
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; 
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{chip.icon}</span>
                  {chip.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', display: 'block', width: '100%' }}>
              <div ref={chatContainerRef} style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '80px 20px 10px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(10, 10, 10, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 15px rgba(5, 217, 232, 0.2)' }}>
                          <motion.span 
                            animate={{ filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'] }}
                            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                            style={{ background: 'linear-gradient(135deg, #05D9E8 0%, #FF2A6D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900, fontSize: '17px', letterSpacing: '-0.5px' }}
                          >
                            S
                          </motion.span>
                        </div>
                      )}

                      <div style={{
                        background: msg.role === 'user' ? 'var(--user-msg-bg)' : 'transparent',
                        color: msg.role === 'user' ? 'var(--user-msg-text)' : 'var(--text-primary)',
                        padding: msg.role === 'user' ? '12px 20px' : '4px 0',
                        borderRadius: msg.role === 'user' ? '24px' : '0',
                      }}>
                        {msg.role === 'user' ? (
                          <div style={{ fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', width: '100%' }}>
                            {editingMessageIndex === i ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '250px' }}>
                                <textarea 
                                  value={editInput}
                                  onChange={(e) => setEditInput(e.target.value)}
                                  onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                  style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: '0.95rem', resize: 'none', overflow: 'hidden' }}
                                  autoFocus
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                  <button onClick={(e) => { e.stopPropagation(); setEditingMessageIndex(null); }} style={{ padding: '6px 12px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    if (editInput.trim() === msg.content) { setEditingMessageIndex(null); return; }
                                    handleSend(editInput, null, i);
                                  }} style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--accent-color)', border: 'none', color: '#fff', cursor: 'pointer' }}>Save & Submit</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.attachments && msg.attachments.map((att, idx) => {
                                  if (att.mimeType?.startsWith('image/')) {
                                    return <img key={idx} src={att.dataUrl} alt="Upload" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', marginBottom: '8px', display: 'block' }} />;
                                  }
                                  return (
                                    <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                      📄 <span>{att.name || 'Document'}</span>
                                    </div>
                                  );
                                })}
                                {msg.image && <img src={msg.image.dataUrl} alt="Upload" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', marginBottom: msg.content ? '8px' : '0' }} />}
                                {msg.content}
                              </>
                            )}
                          </div>
                        ) : (
                          <div id={`msg-content-${i}`} className="markdown-body" style={{ position: 'relative' }}>
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
                      {msg.variants && msg.variants.length > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', color: 'var(--text-secondary)' }}>
                          <button disabled={msg.activeVariant === 0} onClick={(e) => { e.stopPropagation(); handleVariantChange(i, -1); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: msg.activeVariant === 0 ? 'rgba(255,255,255,0.2)' : 'inherit', display: 'flex', alignItems: 'center' }}><ChevronLeft size={16} /></button>
                          <span style={{ fontSize: '0.8rem', userSelect: 'none' }}>{(msg.activeVariant || 0) + 1} / {msg.variants.length}</span>
                          <button disabled={msg.activeVariant === msg.variants.length - 1} onClick={(e) => { e.stopPropagation(); handleVariantChange(i, 1); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: msg.activeVariant === msg.variants.length - 1 ? 'rgba(255,255,255,0.2)' : 'inherit', display: 'flex', alignItems: 'center' }}><ChevronRight size={16} /></button>
                        </div>
                      )}
                      
                      {msg.role === 'user' && !isLoading && !isThinking && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingMessageIndex(i); setEditInput(msg.content); }}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6,
                            transition: 'opacity 0.2s', color: 'var(--text-secondary)'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                          onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                          title="Edit prompt"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}

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
                
                {/* Optimistic "Thinking" AI Message Bubble */}
                {isThinking && (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', maxWidth: '85%' }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'transparent', padding: '4px 0', borderRadius: '0' }}>
                        <Loader />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} style={{ height: '1px', flexShrink: 0 }} />
              </div>
            </div>

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
          </>
        )}

        {/* Input Area (Bottom) - Anchored during chat */}
        {messages.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 24px', zIndex: 20 }}>
            {renderInputArea()}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.7, y: 100, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.8, y: 50, opacity: 0 }} 
              transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
              style={{ padding: 0, borderRadius: '24px', maxWidth: '1200px', width: '90vw', height: '85vh', minHeight: '600px', maxHeight: '900px', position: 'relative', display: 'flex', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', background: 'rgba(15,15,15,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <button 
                onClick={() => setShowSettings(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', zIndex: 10, transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <X size={18} />
              </button>
              {/* Left Sidebar Pane */}
              <div style={{ width: '250px', background: 'rgba(0,0,0,0.2)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={20} /> Settings
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {['ChatBin', 'Archived Chats', 'My Data', 'My Health Data', 'Region'].map(opt => {
                    const optKey = opt.toLowerCase().replace(/ /g, '');
                    const isSelected = activeSettingView === optKey;
                    return (
                      <button
                        key={opt}
                        onClick={() => setActiveSettingView(optKey)}
                        style={{
                          padding: '12px 16px', borderRadius: '12px', border: 'none',
                          background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent', 
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem',
                          fontWeight: 500, transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => { if (!isSelected) e.target.style.background = 'rgba(255,255,255,0.05)' }}
                        onMouseOut={(e) => { if (!isSelected) e.target.style.background = 'transparent' }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                  <button onClick={() => signOut(auth)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 75, 75, 0.3)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: '#ff4b4b', transition: 'all 0.2s' }} onMouseOver={(e)=>e.target.style.background='rgba(255,75,75,0.1)'} onMouseOut={(e)=>e.target.style.background='transparent'}>Log Out</button>
                </div>
              </div>

              {/* Right Content Pane */}
              <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }} className="prompt-scrollbar">
                {(() => {
                  if (activeSettingView === 'menu') {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        <Settings size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 500, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Settings</h3>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>Select an option from the sidebar to view details</p>
                      </div>
                    );
                  }

                  const view = activeSettingView;
                  
                  return (
                    <>
                      <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize', display: 'flex', alignItems: 'center' }}>
                          <span>{view === 'mydata' ? 'My Data' : view === 'myhealthdata' ? 'My Health Data' : view === 'archivedchats' ? 'Archived Chats' : view === 'chatbin' ? 'ChatBin' : view}</span>
                        </h3>
                        {view === 'chatbin' && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Deleted chats will remain here for 72 hours.</p>}
                      </div>

                      {view === 'chatbin' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {chatSessions.filter(s => s.deletedAt).length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                              <button onClick={async () => {
                                if(window.confirm("Permanently delete ALL chats in bin? This cannot be undone.")) {
                                  const deletedSessions = chatSessions.filter(s => s.deletedAt);
                                  for(const s of deletedSessions) {
                                    await moveSessionToDeleted(user?.uid, s);
                                  }
                                  setChatSessions(prev => prev.filter(s => !s.deletedAt));
                                }
                              }} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,75,75,0.3)', background: 'transparent', color: '#ff4b4b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Clear All Chats</button>
                            </div>
                          )}
                          {chatSessions.filter(s => s.deletedAt).length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 20px' }}>No deleted chats.</p>
                          ) : (
                            chatSessions.filter(s => s.deletedAt).map(session => (
                              <div key={session.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--btn-bg)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '12px' }}>{session.title}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => handleRestoreSession(session)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Restore</button>
                                  <button onClick={async (e) => {
                                      e.stopPropagation();
                                      if(window.confirm("Delete permanently?")) {
                                        await moveSessionToDeleted(user?.uid, session);
                                        setChatSessions(prev => prev.filter(s => s.id !== session.id));
                                      }
                                    }} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,75,75,0.2)', color: '#ff4b4b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Delete Now</button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {view === 'archivedchats' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {chatSessions.filter(s => s.isArchived).length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 20px' }}>No archived chats.</p>
                          ) : (
                            chatSessions.filter(s => s.isArchived).map(session => (
                              <div key={session.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--btn-bg)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '12px' }}>{session.title}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => handleUnarchiveSession(session)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Unarchive</button>
                                  <button onClick={(e) => handleDeleteSession(e, session.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,75,75,0.2)', color: '#ff4b4b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Delete</button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {view === 'region' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--btn-bg)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '2px' }}>
                              {realTimeClock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                              {realTimeClock.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Region</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{locationData?.region || 'Detecting...'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Country</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{locationData?.country_name || 'Detecting...'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Country Code</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{locationData?.country_code || '--'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Timezone</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{locationData?.timezone || 'Detecting...'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {view === 'mydata' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>This data will be used by AI for context.</span>
                            <button onClick={async () => {
                              if(isEditingMyData) {
                                await saveUserProfileData(user?.uid, myData);
                              }
                              setIsEditingMyData(!isEditingMyData);
                            }} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                              {isEditingMyData ? 'Save' : 'Edit Data'}
                            </button>
                          </div>
                          {Object.entries(myData).map(([key, value]) => (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key}</span>
                              {isEditingMyData ? (
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => setMyData(prev => ({ ...prev, [key]: e.target.value }))}
                                  style={{ background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '6px', textAlign: 'right' }}
                                />
                              ) : (
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {view === 'myhealthdata' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                              Health Documents & Notes
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => {
                                setShowAddHealthTextModal(true);
                                setNewHealthText('');
                              }} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add Text</button>
                              <button onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*,.pdf,.doc,.docx,.html,.txt';
                                input.onchange = async (e) => {
                                  const file = e.target.files[0];
                                  if(!file) return;
                                  // As a mockup for frontend storage: we convert it to base64
                                  const reader = new FileReader();
                                  reader.onload = async (event) => {
                                    const b64 = event.target.result;
                                    const newNode = { id: Date.now().toString(), title: file.name, type: 'file', content: b64 };
                                    setHealthData(prev => [...prev, newNode]);
                                    await saveHealthDataNode(user?.uid, newNode);
                                  };
                                  reader.readAsDataURL(file);
                                };
                                input.click();
                              }} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.8rem' }}>+ Upload File</button>
                            </div>
                          </div>
                          
                          {healthData.map(data => (
                            <div key={data.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--btn-bg)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ background: data.type === 'file' ? 'rgba(255,75,75,0.1)' : 'rgba(45, 212, 191, 0.1)', color: data.type === 'file' ? 'var(--accent-color)' : '#2dd4bf', padding: '12px', borderRadius: '12px' }}>
                                <FileText size={28} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{data.title}</h4>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{data.type === 'file' ? 'Document' : 'Text Note'} • Added to AI Context</p>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => {
                                  if(data.type === 'file' && data.content.startsWith('data:image')) {
                                    const w = window.open();
                                    w.document.write(`<img src="${data.content}" style="max-width:100%; height:auto;" />`);
                                  } else {
                                    alert(data.content.substring(0, 500) + (data.content.length > 500 ? '...' : ''));
                                  }
                                }} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>View</button>
                                <button onClick={async () => {
                                  if(window.confirm("Delete this health data?")) {
                                    await deleteHealthDataNode(user?.uid, data.id);
                                    setHealthData(prev => prev.filter(h => h.id !== data.id));
                                  }
                                }} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,75,75,0.2)', color: '#ff4b4b', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
                              </div>
                            </div>
                          ))}

                          {showAddHealthTextModal && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
                              <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', width: '90%', maxWidth: '400px' }}>
                                <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>Add Health Note</h3>
                                <textarea 
                                  value={newHealthText} 
                                  onChange={(e) => setNewHealthText(e.target.value)} 
                                  placeholder="Write your health note here..."
                                  style={{ width: '100%', height: '140px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', boxSizing: 'border-box', resize: 'none', marginBottom: '20px', outline: 'none', fontSize: '0.95rem' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                  <button onClick={() => setShowAddHealthTextModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                                  <button onClick={() => {
                                    if(newHealthText.trim()) {
                                      const now = new Date();
                                      const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
                                      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                                      const newNode = { 
                                        id: Date.now().toString(), 
                                        title: `Text Note • ${dateStr} ${timeStr}`, 
                                        type: 'text', 
                                        content: newHealthText 
                                      };
                                      setHealthData(prev => [...prev, newNode]);
                                      saveHealthDataNode(user?.uid, newNode);
                                      setShowAddHealthTextModal(false);
                                    }
                                  }} style={{ padding: '10px 20px', background: 'var(--accent-color)', border: 'none', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Save Note</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
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
              <h3 style={{ margin: '0 auto', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                Health Recovery Plan
              </h3>
              <a
                href="/recovery_plan.html"
                download={`${myData.name ? myData.name.replace(/\s+/g, '_') + '_' : ''}Health_Recovery_Plan.html`}
                style={{
                  background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px',
                  fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.target.style.opacity = 0.8}
                onMouseOut={(e) => e.target.style.opacity = 1}
              >
                <Download size={18} /> Download
              </a>
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

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative' }}
            >
              <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
              
              <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--text-primary)' }}>
                <Lock size={32} />
              </div>
              
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Login to S.ai</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px', lineHeight: 1.5 }}>
                You have reached the guest limit. Login to continue chatting, save history, and personalize your AI.
              </p>
              
              <button
                onClick={() => {
                  // This calls the globally defined handler or inline logic
                  const provider = new GoogleAuthProvider();
                  signInWithPopup(auth, provider).then(() => setShowAuthModal(false)).catch(console.error);
                }}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', color: 'black', border: 'none', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                Sign in with Google
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboardingModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
              className="prompt-scrollbar"
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Welcome to S.ai!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>Let's personalize your experience. Please provide a few details.</p>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!user) return;
                try {
                  await saveUserProfileData(user.uid, onboardingData);
                  setMyData(onboardingData);
                  setShowOnboardingModal(false);
                } catch(err) { console.error(err); }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name *</label>
                  <input required value={onboardingData.name} onChange={e => setOnboardingData({...onboardingData, name: e.target.value})} type="text" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }} placeholder="John Doe" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
                    <input value={onboardingData.dob} onChange={e => setOnboardingData({...onboardingData, dob: e.target.value})} type="date" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Diet</label>
                    <select value={onboardingData.diet} onChange={e => setOnboardingData({...onboardingData, diet: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}>
                      <option value="">Select...</option>
                      <option value="Veg">Vegetarian</option>
                      <option value="Non-Veg">Non-Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Weight & Height</label>
                  <input value={onboardingData.weightHeight} onChange={e => setOnboardingData({...onboardingData, weightHeight: e.target.value})} type="text" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }} placeholder="e.g. 70kg, 5'10" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Contact Email</label>
                  <input value={onboardingData.email} onChange={e => setOnboardingData({...onboardingData, email: e.target.value})} type="email" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }} placeholder="john@example.com" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                  <input value={onboardingData.phone} onChange={e => setOnboardingData({...onboardingData, phone: e.target.value})} type="tel" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }} placeholder="+91 9876543210" />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setShowOnboardingModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Skip</button>
                  <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'var(--accent-color)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save & Continue</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
