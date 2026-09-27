"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "../lib/utils";
import GradientSendButton from "./GradientSendButton";
import SendLoader from "./SendLoader";
import InputCursorLoader from "./InputCursorLoader";

const SPRING_TRANSITION = "max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const SMOOTH_HEIGHT_TRANSITION = "max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.15s ease-out";

function MorphingText({ text }) {
  const [width, setWidth] = useState("auto");
  const spanRef = useRef(null);

  useEffect(() => {
    if (spanRef.current) {
      setWidth(spanRef.current.offsetWidth);
    }
  }, [text]);

  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
      style={{ width }}
    >
      <span ref={spanRef} className="invisible whitespace-nowrap px-1">
        {text}
      </span>
      <span
        key={text}
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-300"
      >
        {text}
      </span>
    </span>
  );
}

function ModelIcon({ model, className }) {
  const icons = {
    "Composer 2.5": "https://cdn.21st.dev/assets/mirror/7d/7dc00bc09f225fcda46cbc9c6b669c69c025a231877d6c17baa6a003f04f02b2.svg",
    "Gemini 3.5 Flash": "https://cdn.21st.dev/assets/mirror/cd/cda2df6631d5fa227de3fa04ed78cf354f910ba92a9f086e7455655c10ad9d09.svg",
    "GPT 5.5": "https://cdn.21st.dev/assets/mirror/b9/b93fa7942be639a1dae60194ff12141145d7d9fd59581582d6ff23335755f19c.svg",
    "Opus 5.5": "https://cdn.21st.dev/assets/mirror/5d/5de1221c77cc91e748066fd642ad0eee1c1fa65328814f5178166f901e599709.svg",
    "GLM 5.2": "https://cdn.21st.dev/assets/mirror/b2/b2a6c0ff63efd8a555edf8a174ea6fcfeca120ac1595a2d461ca11d3ae89276c.svg"
  };

  const filters = {
    "GPT 5.5": "dark:invert", 
  };

  return (
    <img 
      src={icons[model] || icons["GPT 5.5"]} 
      alt={model} 
      className={cn("object-contain", filters[model], className)} 
    />
  );
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.75 6.5V7a4.25 4.25 0 0 0 8.5 0v-.5M7 11.25V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DynamicBarsIcon({ level }) {
  const isMediumOrHigh = level === "Medium" || level === "Max Effort";
  const isHigh = level === "Max Effort";

  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="8" width="2.5" height="4.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={1} />
      <rect x="5.75" y="5" width="2.5" height="7.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={isMediumOrHigh ? 1 : 0.3} />
      <rect x="10" y="2" width="2.5" height="10.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={isHigh ? 1 : 0.3} />
    </svg>
  );
}

function AttachmentThumb({ attachment, index, onRemove, onOpen, registerRef }) {
  const [isHovered, setIsHovered] = useState(false);
  const btnRef = useRef(null);

  return (
    <button
      ref={(el) => {
        btnRef.current = el;
        registerRef(attachment.id, el);
      }}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (btnRef.current) {
          onOpen(attachment, btnRef.current.getBoundingClientRect());
        }
      }}
      style={{ animationDelay: `${index * 35}ms`, animationFillMode: "backwards" }}
      className={cn(
        "group relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted outline-none",
        "transition-transform duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-[1.04] active:scale-[0.96]",
        "animate-in fade-in slide-in-from-top-3 zoom-in-90 duration-400"
      )}
      aria-label={`Open preview of ${attachment.name}`}
    >
      <img src={attachment.url} alt={attachment.name} className="size-full object-cover" draggable={false} />
      <span className={cn("absolute inset-0 flex items-start justify-end bg-black/0 transition-colors duration-200", isHovered && "bg-black/25")}>
        <span
          role="button" tabIndex={-1}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={(e) => { e.stopPropagation(); onRemove(attachment.id); }}
          className={cn(
            "m-1 flex size-4 items-center justify-center rounded-full bg-background/90 text-foreground/70 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-background hover:text-foreground hover:scale-110",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
          )}
          aria-label={`Remove ${attachment.name}`}
        >
          <CloseIcon />
        </span>
      </span>
    </button>
  );
}

function AttachmentGalleryModal({ attachment, originRect, onClose }) {
  const [phase, setPhase] = useState("opening");
  const [targetRect, setTargetRect] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const maxW = Math.min(window.innerWidth * 0.86, 560);
    const maxH = Math.min(window.innerHeight * 0.78, 720);

    const naturalW = attachment.width || 800;
    const naturalH = attachment.height || 600;
    const scale = Math.min(maxW / naturalW, maxH / naturalH, 1.6);

    const width = naturalW * scale;
    const height = naturalH * scale;

    setTargetRect({
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width,
      height,
      radius: 20,
    });

    const raf = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(raf);
  }, [attachment]);

  const handleClose = useCallback(() => setPhase("closing"), []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const isOpen = phase === "open";
  const isClosing = phase === "closing";

  const geometry = isOpen && targetRect
      ? targetRect
      : { top: originRect.top, left: originRect.left, width: originRect.width, height: originRect.height, radius: 12 };

  const animEasing = isClosing ? "ease-out" : "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  const animDur = isClosing ? "0.3s" : "0.45s";
  const flipTransition = `top ${animDur} ${animEasing}, left ${animDur} ${animEasing}, width ${animDur} ${animEasing}, height ${animDur} ${animEasing}, border-radius ${animDur} ${animEasing}`;

  return (
    <div className="fixed inset-0 z-[100]" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md transition-opacity duration-400" style={{ opacity: isOpen ? 1 : 0 }} />
      <div
        style={{
          position: "fixed",
          top: geometry.top, left: geometry.left, width: geometry.width, height: geometry.height,
          borderRadius: geometry.radius, transition: flipTransition, overflow: "hidden",
          boxShadow: isOpen ? "0 24px 60px -12px rgb(0 0 0 / 0.35)" : "0 0px 0px 0px rgb(0 0 0 / 0)",
        }}
        className="bg-muted"
        onTransitionEnd={() => { if (phase === "closing") onClose(); }}
        onClick={(e) => e.stopPropagation()}
      >
        <img ref={imgRef} src={attachment.url} alt={attachment.name} className="size-full object-cover" draggable={false} />
      </div>

      <button
        type="button" onClick={handleClose}
        style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? "scale(1)" : "scale(0.7)" }}
        className={cn(
          "fixed right-4 top-4 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground/70 shadow-md backdrop-blur-sm",
          "transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-card hover:text-foreground",
          !isOpen && "pointer-events-none"
        )}
      >
        <span className="scale-150"><CloseIcon /></span>
      </button>
    </div>
  );
}

export const PromptInput = React.forwardRef(
  (
    {
      onSubmit,
      placeholder = "Ask anything",
      className,
      models = ["GPT 5.5", "Opus 5.5", "Gemini 3.5 Flash", "Composer 2.5", "GLM 5.2"],
      efforts = ["Low", "Medium", "Max Effort"],
      defaultValue = "",
      value: controlledValue,
      onChange,
      maxAttachments = 6,
      isThinking = false,
      onStop,
    },
    ref
  ) => {
    const [expanded, setExpanded] = useState(false);
    const [isSmoothResize, setIsSmoothResize] = useState(false);
    const [localValue, setLocalValue] = useState(defaultValue);
    const [selectedModel, setSelectedModel] = useState(models[0]);
    const [effortIndex, setEffortIndex] = useState(1);
    const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setDotCount(prev => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    }, []);

    const animatedPlaceholder = `Ask S.Ai a question${'.'.repeat(dotCount)}`;

    const [attachments, setAttachments] = useState([]);
    const [activeAttachment, setActiveAttachment] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    const [isRecording, setIsRecording] = useState(false);
    const [audioData, setAudioData] = useState(new Array(5).fill(0));
    const valueRef = useRef(controlledValue !== undefined ? controlledValue : localValue);

    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const rafRef = useRef(null);
    const recognitionRef = useRef(null);
    const demoIntervalRef = useRef(null);
    const demoTextIntervalRef = useRef(null);

    const [hoverStyle, setHoverStyle] = useState({ opacity: 0, transform: "translateY(0px) scale(0.95)", transition: "none" });
    const [containerHeight, setContainerHeight] = useState(116);
    const [textareaHeight, setTextareaHeight] = useState(68);
    const [isScrolling, setIsScrolling] = useState(false);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : localValue;
    const hasValue = value.trim() !== "" || attachments.length > 0;
    const hasAttachments = attachments.length > 0;

    const textareaRef = useRef(null);
    const internalContainerRef = useRef(null);
    const topFadeRef = useRef(null);
    const bottomFadeRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const thumbRefs = useRef(new Map());

    useEffect(() => {
      valueRef.current = value;
    }, [value]);

    const updateFades = () => {
      const el = textareaRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (topFadeRef.current) {
        topFadeRef.current.style.opacity = Math.min(scrollTop / 20, 1).toString();
      }
      if (bottomFadeRef.current) {
        const bottomScroll = scrollHeight - clientHeight - scrollTop;
        bottomFadeRef.current.style.opacity = Math.min(Math.max(bottomScroll - 16, 0) / 10, 1).toString();
      }
    };

    const handleValueChange = useCallback((val) => {
      setIsSmoothResize(true); 
      if (!isControlled) setLocalValue(val);
      onChange?.(val);
      
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 800);
    }, [isControlled, onChange]);

    const expand = () => {
      setIsSmoothResize(false); 
      setExpanded(true);
    };

    const stopRecording = useCallback(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (demoIntervalRef.current) {
        window.clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
      if (demoTextIntervalRef.current) {
        window.clearInterval(demoTextIntervalRef.current);
        demoTextIntervalRef.current = null;
      }
      setIsRecording(false);
      setAudioData(new Array(5).fill(0));
    }, []);

    const startRecording = useCallback(async () => {
      setIsSmoothResize(false);
      setExpanded(true);

      let stream = null;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (err) {
        console.warn("Microphone access denied or unavailable.");
      }

      setIsRecording(true);

      function simulateText() {
        const fakeText = "Can you build a high fidelity Framer Motion layout animation for a dark mode dashboard?";
        const words = fakeText.split(" ");
        let i = 0;
        let currentBase = valueRef.current;
        demoTextIntervalRef.current = window.setInterval(() => {
          if (i < words.length) {
            currentBase = (currentBase ? currentBase + " " : "") + words[i];
            handleValueChange(currentBase);
            i++;
          } else {
            stopRecording();
          }
        }, 300);
      }

      if (stream) {
        streamRef.current = stream;
        
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; 
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVisualizer = () => {
          analyser.getByteFrequencyData(dataArray);
          const bands = new Array(5).fill(0);
          const step = Math.floor(dataArray.length / 5);
          for (let i = 0; i < 5; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) {
              sum += dataArray[i * step + j];
            }
            bands[i] = sum / step / 255;
          }
          setAudioData(bands);
          rafRef.current = requestAnimationFrame(updateVisualizer);
        };
        updateVisualizer();

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;

          let baseline = valueRef.current;

          recognition.onresult = (event) => {
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }
            
            if (finalTranscript) {
               baseline += (baseline ? " " : "") + finalTranscript;
            }
            
            handleValueChange((baseline + (interimTranscript ? " " + interimTranscript : "")).trim());
          };

          recognition.onerror = (e) => {
            console.error("Speech recognition error", e);
            stopRecording();
          };

          recognition.onend = () => {
             stopRecording();
          };

          recognitionRef.current = recognition;
          recognition.start();
        } else {
          simulateText();
        }
      } else {
        demoIntervalRef.current = window.setInterval(() => {
          setAudioData(Array.from({ length: 5 }, () => Math.random() * 0.8 + 0.1));
        }, 100);
        simulateText();
      }
    }, [handleValueChange, stopRecording]);

    useEffect(() => {
      if (isRecording && textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, [value, isRecording]);

    useEffect(() => {
      return () => {
        stopRecording();
        attachments.forEach((a) => URL.revokeObjectURL(a.url)); 
      };
    }, [stopRecording, attachments]);

    useEffect(() => {
      if ((value.trim() !== "" || hasAttachments) && !expanded) {
        setIsSmoothResize(false);
        setExpanded(true);
      }
    }, [value, expanded, hasAttachments]);

    useEffect(() => {
      if (expanded && !isRecording) {
        const timer = setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [expanded, isRecording]);

    useEffect(() => {
      if (!textareaRef.current) return;
      const el = textareaRef.current;
      
      const currentHeight = el.style.height;
      el.style.transition = 'none';
      el.style.height = "0px";
      const scrollHeight = el.scrollHeight;
      el.style.height = currentHeight;
      void el.offsetHeight; 
      el.style.transition = '';
      
      const newHeight = Math.max(68, Math.min(scrollHeight, 160));
      el.style.height = `${newHeight}px`;
      
      setTextareaHeight(newHeight);
      setIsScrolling(scrollHeight > 160);
      
      setTimeout(updateFades, 0);
    }, [value, expanded]); 

    useEffect(() => {
      setContainerHeight(Math.max(124, textareaHeight + 56));
      setTimeout(updateFades, 0);
    }, [textareaHeight]);

    useEffect(() => {
      if (!isModelSelectOpen) return;
      const handleOutsideClick = (e) => {
        if (internalContainerRef.current && !internalContainerRef.current.contains(e.target)) {
          setIsModelSelectOpen(false);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isModelSelectOpen]);

    const handleBlur = (e) => {
      if (internalContainerRef.current && internalContainerRef.current.contains(e.relatedTarget)) return;
      if (value.trim() === "" && !hasAttachments && !isRecording) {
        setIsSmoothResize(false);
        setExpanded(false);
        setIsModelSelectOpen(false);
      }
    };

    const handleSubmit = () => {
      if (value.trim() === "" && !hasAttachments) return;
      setIsSmoothResize(false);
      onSubmit?.(value, { model: selectedModel, effort: efforts[effortIndex], attachments: attachments.map((a) => a.file) });
      handleValueChange("");
      attachments.forEach((a) => URL.revokeObjectURL(a.url));
      setAttachments([]);
      setExpanded(false);
      setIsModelSelectOpen(false);
    };

    const cycleEffort = (e) => {
      e.stopPropagation();
      setEffortIndex((prev) => (prev + 1) % efforts.length);
    };

    const openFileChooser = (e) => {
      e.stopPropagation();
      fileInputRef.current?.click();
    };

    const openImageChooser = (e) => {
      e.stopPropagation();
      imageInputRef.current?.click();
    };

    const handleFilesChosen = async (e) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = ""; 

      if (files.length === 0) return;
      
      const textFiles = files.filter(f => f.name.match(/\.(txt|csv|json|md)$/i));
      const otherFiles = files.filter(f => !f.name.match(/\.(txt|csv|json|md)$/i));

      // Process Text Files directly into prompt
      for (const file of textFiles) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          handleValueChange(value + `\n\n[Attached File: ${file.name}]\n${text}\n`);
        };
        reader.readAsText(file);
      }

      if (otherFiles.length === 0) return;

      const room = Math.max(0, maxAttachments - attachments.length);
      const accepted = otherFiles.slice(0, room);

      if (!expanded) { setIsSmoothResize(false); setExpanded(true); } 
      else { setIsSmoothResize(true); }

      for (const file of accepted) {
        const url = URL.createObjectURL(file);
        if (file.type.startsWith("image/")) {
          const img = new Image();
          img.onload = () => addAttachment(file, url, img.naturalWidth, img.naturalHeight);
          img.onerror = () => addAttachment(file, url, 800, 600);
          img.src = url;
        } else {
          // Document file (PDF, DOCX)
          addAttachment(file, url, 800, 600, 'document');
        }
      }
    };

    const addAttachment = (file, url, width, height, type = 'image') => {
      const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
      setAttachments((prev) => [...prev, { id, file, url, name: file.name, width, height, type }]);
    };

    const removeAttachment = (id) => {
      setIsSmoothResize(true);
      setAttachments((prev) => {
        const target = prev.find((a) => a.id === id);
        if (target) URL.revokeObjectURL(target.url);
        return prev.filter((a) => a.id !== id);
      });
      thumbRefs.current.delete(id);
    };

    const showArrow = hasValue && !isRecording;
    const showStop = isRecording;
    const showMic = !hasValue && !isRecording;

    const onActionButtonClick = (e) => {
      e.preventDefault();
      if (isRecording) {
        stopRecording();
      } else if (hasValue) {
        handleSubmit();
      } else {
        startRecording();
      }
    };

    return (
      <>
        <div
          ref={(node) => {
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
            internalContainerRef.current = node;
          }}
          onBlur={handleBlur}
          className={cn("relative flex flex-col w-full mx-auto", className)}
          style={{ maxWidth: 760, margin: '0 auto' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.csv,.json,.md"
            multiple
            onChange={handleFilesChosen}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: 'none' }}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChosen}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: 'none' }}
          />

          <div
            onMouseDown={(e) => {
              const isTextarea = e.target === textareaRef.current;
              if (!isTextarea && !isRecording) {
                e.preventDefault();
                textareaRef.current?.focus();
              }
            }}
            style={{
              borderRadius: '20px',
              minHeight: '136px',
              backgroundColor: 'rgba(15, 15, 15, 0.45)', // Translucent glassmorphism
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
            className="w-full relative focus-within:border-white/20 transition-colors"
          >
            {/* ATTACHMENTS PREVIEW */}
            {hasAttachments && (
              <div className="w-full relative z-10 px-4 pt-4 pb-0 flex items-start gap-2 overflow-x-auto prompt-scrollbar">
                {attachments.map((attachment, index) => (
                  <AttachmentThumb
                    key={attachment.id}
                    attachment={attachment}
                    index={index}
                    onRemove={removeAttachment}
                    onOpen={(a, rect) => setActiveAttachment({ attachment: a, rect })}
                    registerRef={(id, el) => thumbRefs.current.set(id, el)}
                  />
                ))}
              </div>
            )}

            {/* TEXTAREA SECTION */}
            <div style={{ flex: 1, position: 'relative' }}>
              <style dangerouslySetInnerHTML={{ __html: `
                .prompt-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; background: transparent; }
                .prompt-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .prompt-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
                .prompt-scrollbar:hover::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.3); }
              `}} />

              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                onScroll={updateFades}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={animatedPlaceholder}
                aria-label="Prompt"
                disabled={isRecording}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  height: Math.max(80, Math.min(textareaHeight, 160)) + 'px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#e2e8f0',
                  padding: hasAttachments ? '12px 20px' : '20px 20px',
                  resize: 'none',
                  fontSize: '15px'
                }}
                className={cn("prompt-scrollbar", isScrolling ? "overflow-y-auto" : "overflow-y-hidden")}
              />
            </div>
            
            {/* ACTION BAR DIVIDER */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', width: '100%' }} />

            {/* ACTION BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
              {/* LEFT ACTIONS */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={openImageChooser} 
                  disabled={attachments.length >= maxAttachments}
                  style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  title="Add Photo"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </button>
                <button 
                  type="button"
                  onClick={openFileChooser}
                  disabled={attachments.length >= maxAttachments}
                  style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  title="Add File"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </button>
              </div>

              {/* RIGHT ACTIONS */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ opacity: isTyping ? 1 : 0, transition: 'opacity 0.3s ease-in-out', pointerEvents: 'none' }}>
                  <InputCursorLoader />
                </div>
                {isThinking ? (
                  <button 
                    type="button"
                    onClick={onStop}
                  style={{ 
                    background: 'rgba(255,255,255,0.12)', 
                    borderRadius: '10px', 
                    padding: '8px 12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    border: '1px solid rgba(255,255,255,0.02)', 
                    cursor: 'pointer', 
                    color: '#fff',
                    transition: 'all 0.2s'
                  }}
                  title="Stop generating"
                >
                  <SendLoader />
                  <span style={{ fontSize: '13.5px', fontWeight: 500, marginLeft: '4px' }}>Stop</span>
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={hasValue ? handleSubmit : undefined}
                  style={{ 
                    background: hasValue ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)', 
                    borderRadius: '10px', 
                    padding: '8px 16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    border: '1px solid rgba(255,255,255,0.02)', 
                    cursor: hasValue ? 'pointer' : 'not-allowed', 
                    color: hasValue ? '#fff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if (hasValue) e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                  onMouseOut={(e) => { if (hasValue) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                >
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                   <span style={{ fontSize: '13.5px', fontWeight: 500 }}>Send</span>
                </button>
              )}
              </div>
            </div>
          </div>
        </div>

        {activeAttachment && (
          <AttachmentGalleryModal
            attachment={activeAttachment.attachment} originRect={activeAttachment.rect} onClose={() => setActiveAttachment(null)}
          />
        )}
      </>
    );
  }
);

PromptInput.displayName = "PromptInput";
