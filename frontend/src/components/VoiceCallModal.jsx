import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, MicOff, Volume2, Loader2, Phone } from 'lucide-react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const CALL_STATES = {
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended',
};

const VoiceCallModal = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [callState, setCallState] = useState(CALL_STATES.RINGING);
  const [callDuration, setCallDuration] = useState(0);
  
  // AI/User state
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const durationTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Helper to format time
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- 1. Initial Call Connection ---
  useEffect(() => {
    if (!isOpen) return;

    // Reset everything
    setCallState(CALL_STATES.RINGING);
    setCallDuration(0);
    setIsAiSpeaking(false);
    setIsAiThinking(false);
    setUserTranscript('');

    // Simulate 2 seconds of ringing before connecting
    const ringTimeout = setTimeout(() => {
      setCallState(CALL_STATES.CONNECTED);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      
      // Greet the user when connected
      const greetings = {
        en: "Hello! This is Aria, your admission counselor from Apex Institute of Technology. How can I help you today?",
        hi: "नमस्ते! मैं आरिया हूं, एपेक्स इंस्टीट्यूट ऑफ टेक्नोलॉजी से आपकी एडमिशन काउंसलर। मैं आज आपकी कैसे मदद कर सकती हूं?",
        ml: "നമസ്കാരം! ഞാൻ ആര്യ, അപെക്സ് ഇൻസ്റ്റിറ്റ്യൂട്ട് ഓഫ് ടെക്നോളജിയിലെ നിങ്ങളുടെ അഡ്മിഷൻ കൗൺസിലർ. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
        ta: "வணக்கம்! நான் ஆர்யா, அபெக்ஸ் இன்ஸ்டிடியூட் ஆப் டெக்னாலஜியில் இருந்து உங்கள் சேர்க்கை ஆலோசகர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?"
      };
      speakResponse(greetings[language] || greetings.en);
    }, 2000);

    return () => {
      clearTimeout(ringTimeout);
      clearInterval(durationTimerRef.current);
    };
  }, [isOpen]);

  // --- 2. Setup Continuous Speech Recognition ---
  // Use a ref to hold latest state for the recognition callbacks
  const stateRef = useRef({ callState, isAiSpeaking, isAiThinking, language });
  useEffect(() => {
    stateRef.current = { callState, isAiSpeaking, isAiThinking, language };
  }, [callState, isAiSpeaking, isAiThinking, language]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Set recognition language based on context
    const s = stateRef.current;
    const langMap = { en: 'en-US', ml: 'ml-IN', hi: 'hi-IN', ta: 'ta-IN' };
    recognition.lang = langMap[s.language] || 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptNode = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptNode;
        } else {
          interimTranscript += transcriptNode;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      setUserTranscript(currentText);

      // Reset the silence debounce timer every time speech is detected
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      
      // If we have text, wait 1.5 seconds of silence before sending to AI
      if (currentText.trim().length > 0) {
        silenceTimerRef.current = setTimeout(() => {
          // Trigger the API call
          handleUserFinishedSpeaking(currentText);
        }, 1500);
      }
    };

    recognition.onerror = (event) => {
      console.error("Microphone error:", event.error);
    };
    
    recognition.onend = () => {
      // Auto-restart listening if connected, not speaking, not thinking
      const s = stateRef.current;
      if (
        s.callState === CALL_STATES.CONNECTED && 
        !s.isAiSpeaking && 
        !s.isAiThinking
      ) {
        try { recognition.start(); } catch (e) {}
      }
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      try { recognition.stop(); } catch(e){}
    };
  }, [language]); // Re-initialize if language changes

  // We need to manually start it when the call connects and the initial greeting finishes
  // But wait, the initial greeting calls `speakResponse`, which sets `isAiSpeaking=true`.
  // When the greeting ends, `isAiSpeaking` becomes `false`, but the `onend` of SpeechRecognition
  // doesn't fire because it was never started!
  // So we need an effect to start it when we should be listening.
  useEffect(() => {
    if (
      callState === CALL_STATES.CONNECTED && 
      !isAiSpeaking && 
      !isAiThinking &&
      recognitionRef.current
    ) {
      try { recognitionRef.current.start(); } catch (e) {}
    } else if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  }, [callState, isAiSpeaking, isAiThinking]);

  // --- 3. Process User Speech ---
  const handleUserFinishedSpeaking = async (text) => {
    const s = stateRef.current;
    if (!text.trim() || s.isAiThinking || s.isAiSpeaking) return;

    // Stop listening while AI is processing and talking
    try { recognitionRef.current?.stop(); } catch(e){}
    setIsAiThinking(true);

    try {
      const res = await api.post('/chat/message', { message: text });
      if (res.data.success) {
        speakResponse(res.data.data.message);
      }
    } catch (err) {
      speakResponse("I'm sorry, I am having trouble connecting to the network right now.");
    } finally {
      setIsAiThinking(false);
      setUserTranscript('');
    }
  };

  // --- 4. Synthesize AI Response ---
  const speakResponse = (text) => {
    if (!synthRef.current) return;
    
    setIsAiSpeaking(true);
    const cleanText = text.replace(/[*_#`]/g, '').replace(/\n/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05; // slightly faster for conversational pace
    
    // Set proper language for TTS
    const langMap = { en: 'en-US', ml: 'ml-IN', hi: 'hi-IN', ta: 'ta-IN' };
    utterance.lang = langMap[language] || 'en-US';
    
    const voices = synthRef.current.getVoices();
    // Try to find a voice that matches the language first, then fallback to female
    const langVoices = voices.filter(v => v.lang.startsWith(utterance.lang.split('-')[0]));
    const femaleVoice = langVoices.find(v => v.name.includes('Female')) || 
                        langVoices[0] ||
                        voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
    
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onend = () => {
      setIsAiSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  // --- 5. Hang Up ---
  const handleHangUp = () => {
    setCallState(CALL_STATES.ENDED);
    clearInterval(durationTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    // Close modal after brief delay
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Ensure voices are loaded
  useEffect(() => {
    if (synthRef.current && synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = () => {};
    }
  }, []);

  // --- Animations ---
  const overlayVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, y: 50, scale: 0.9 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-sm rounded-[3rem] overflow-hidden flex flex-col items-center p-8 shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(20,15,40,0.95) 0%, rgba(10,8,20,0.95) 100%)',
              border: '2px solid rgba(139,92,246,0.1)',
              boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25)',
              minHeight: '550px'
            }}
          >
            {/* Top Bar (simulated phone status) */}
            <div className="w-16 h-1.5 bg-gray-600/50 rounded-full mb-10 mt-2" />

            {/* Profile Avatar */}
            <div className="relative mb-6">
              {callState === CALL_STATES.RINGING && (
                <>
                  <span className="absolute inset-0 rounded-full border border-purple-500/50 animate-ping" style={{ animationDuration: '2s' }} />
                  <span className="absolute inset-[-15px] rounded-full border border-purple-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                </>
              )}
              {isAiSpeaking && (
                <div className="absolute inset-[-10px] rounded-full bg-blue-500/20 animate-pulse" />
              )}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 relative z-10 overflow-hidden">
                {/* Fallback avatar if no image */}
                <Phone size={48} className="text-white opacity-80" />
              </div>
            </div>

            {/* Caller Info */}
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide font-display">Aria Assistant</h2>
            
            <p className={`text-lg mb-8 font-medium ${callState === CALL_STATES.ENDED ? 'text-red-400' : 'text-gray-400'}`}>
              {callState === CALL_STATES.RINGING && 'Calling...'}
              {callState === CALL_STATES.CONNECTED && formatTime(callDuration)}
              {callState === CALL_STATES.ENDED && 'Call Ended'}
            </p>

            {/* Real-time Status / Transcript */}
            <div className="flex-1 w-full flex flex-col items-center justify-center text-center px-4">
              {callState === CALL_STATES.CONNECTED && (
                <AnimatePresence mode="wait">
                  {isAiThinking ? (
                    <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                      <Loader2 size={24} className="text-purple-400 animate-spin mb-2" />
                      <p className="text-purple-300 text-sm">Thinking...</p>
                    </motion.div>
                  ) : isAiSpeaking ? (
                    <motion.div key="speaking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                      <Volume2 size={28} className="text-blue-400 animate-pulse mb-2" />
                      <p className="text-blue-300 text-sm">Aria is speaking</p>
                    </motion.div>
                  ) : userTranscript ? (
                    <motion.div key="transcript" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                      <p className="text-white text-lg italic opacity-90">"{userTranscript}"</p>
                    </motion.div>
                  ) : (
                    <motion.div key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                      <div className="flex gap-1 mb-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <p className="text-green-400 text-sm font-medium">Listening...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Call Controls */}
            <div className="w-full mt-auto pt-8 flex justify-center gap-6">
              {/* Hang Up Button */}
              <button
                onClick={handleHangUp}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/40 transition-transform hover:scale-105 active:scale-95"
              >
                <PhoneOff size={28} className="text-white" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceCallModal;
