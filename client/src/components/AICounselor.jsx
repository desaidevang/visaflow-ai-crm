// components/AICounselor.jsx - Updated with API integration
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, Bot, Sparkles, User, Clock, Globe, 
  GraduationCap, Briefcase, Building, Plane, ChevronRight, Mic, 
  MicOff, Zap, Volume2, VolumeX, Copy, Check, RefreshCw, 
  ThumbsUp, Loader2, AlertCircle, WifiOff
} from 'lucide-react';
import visaApi from '../services/visaApi';

const AICounselor = () => {
  const [isOpen, setIsOpen] = useState(true);
// In AICounselor.jsx, replace the messages useState with:
const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      text: "🌟 Hey there! I'm VisaFlow Buddy, your AI visa assistant.\n\nI can help you with:\n• Visa requirements & eligibility\n• Processing times & costs\n• University recommendations\n• FREE consultation booking\n\nWhat's your name? 👋", 
      time: new Date().toLocaleTimeString(),
      suggestions: ["Student Visa", "Work Visa", "Tourist Visa", "Business Visa"]
    }
]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [userFeedback, setUserFeedback] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addSystemMessage(" Connection restored! How can I help you?");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addSystemMessage(" You're offline. Please check your internet connection.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      text: text,
      time: new Date().toLocaleTimeString()
    }]);
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        setTimeout(() => handleSendMessage(transcript), 100);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speak = (text) => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } else {
      addSystemMessage("🎤 Voice input is not supported in your browser");
    }
  };

  const handleSendMessage = async (customMessage = null) => {
    const messageToSend = (customMessage || inputMessage).trim();
    if (!messageToSend) return;
    
    // Add user message
    const userMessageObj = {
      id: Date.now(),
      type: 'user',
      text: messageToSend,
      time: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessageObj]);
    setInputMessage('');
    setIsTyping(true);
    
    // Check if online
    if (!isOnline) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          text: "🌐 I need an internet connection to help you. Please check your connection and try again.",
          time: new Date().toLocaleTimeString(),
          suggestions: ["Retry", "Student Visa", "Work Visa"]
        }]);
      }, 500);
      return;
    }
    
    try {
      // Call Gemini API
      const response = await visaApi.sendMessage(messageToSend);
      
      const botMessageObj = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.text,
        time: new Date().toLocaleTimeString(),
        suggestions: response.suggestions
      };
      
      setMessages(prev => [...prev, botMessageObj]);
      setIsTyping(false);
      
      // Speak response
      speak(response.text);
      
      // If lead was collected, show special message
      if (response.leadCollected) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 2,
            type: 'bot',
            text: " Great! Your information has been saved. Our visa expert will contact you within 24 hours with personalized guidance.",
            time: new Date().toLocaleTimeString(),
            suggestions: ["Track application", "More questions", "Exit"]
          }]);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Send message error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: "I'm having trouble connecting to the server. Please check if the backend is running and try again.\n\nMake sure:\n• Backend is running on port 5000\n• MongoDB is connected\n• Gemini API key is valid",
        time: new Date().toLocaleTimeString(),
        suggestions: ["Retry", "Check status", "Student Visa"]
      }]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (messageId, isPositive) => {
    setUserFeedback(prev => ({ ...prev, [messageId]: isPositive }));
    console.log(`Feedback for message ${messageId}: ${isPositive ? '👍' : '👎'}`);
  };

  const resetConversation = () => {
    visaApi.resetSession();
    setMessages([
      { 
        id: Date.now(), 
        type: 'bot', 
        text: " Conversation reset! Let's start fresh.\n\nWhat's your name? I'll help you with your visa journey! ", 
        time: new Date().toLocaleTimeString(),
        suggestions: ["Start over", "Student Visa", "Work Visa"]
      }
    ]);
    speak("Conversation reset. How can I help you?");
  };

  const checkServerStatus = async () => {
    setIsTyping(true);
    try {
      const response = await fetch('http://localhost:5000/');
      if (response.ok) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          text: " Server is online and ready! You can now ask me about visas, universities, and immigration.",
          time: new Date().toLocaleTimeString(),
          suggestions: ["Student Visa", "Work Visa", "Business Visa", "Tourist Visa"]
        }]);
      } else {
        throw new Error('Server not responding');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text: " Cannot connect to server. Please ensure:\n\n1. Backend is running: `npm run dev`\n2. MongoDB is connected\n3. Gemini API key is set in .env\n4. Port 5000 is not in use",
        time: new Date().toLocaleTimeString(),
        suggestions: ["Try again", "View setup guide"]
      }]);
    }
    setIsTyping(false);
  };

  const quickQuestions = [
    { icon: GraduationCap, text: "Student visa requirements", color: "from-blue-500 to-cyan-500" },
    { icon: Briefcase, text: "Work visa options", color: "from-emerald-500 to-teal-500" },
    { icon: Building, text: "Business immigration", color: "from-purple-500 to-pink-500" },
    { icon: Clock, text: "Processing times", color: "from-orange-500 to-amber-500" },
    { icon: Globe, text: "Best countries to migrate", color: "from-red-500 to-rose-500" },
    { icon: Plane, text: "Tourist visa guide", color: "from-indigo-500 to-blue-500" }
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-gradient-to-r from-red-500 to-rose-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[450px] h-[650px] animate-slide-up">
          {/* Glassmorphism Container */}
          <div className="relative h-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">VisaFlow AI Counselor</h3>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 ${isOnline ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-pulse`}></div>
                      <span>{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    <span>•</span>
                    <span>Powered by Gemini AI</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isOnline && (
                  <button
                    onClick={checkServerStatus}
                    className="text-white/80 hover:text-white transition p-1"
                    title="Check connection"
                  >
                    <WifiOff className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/80 hover:text-white transition p-1"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={resetConversation}
                  className="text-white/80 hover:text-white transition p-1"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Questions Bar */}
            <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
              <p className="text-xs text-red-600 font-medium mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Quick Questions
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(q.text)}
                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm hover:shadow-md transition-all hover:scale-105 border border-gray-100"
                  >
                    <q.icon className="w-3 h-3 text-red-500" />
                    {q.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`max-w-[85%] ${msg.type === 'user' ? 'order-1' : 'order-2'}`}>
                    {/* Message Bubble */}
                    <div
                      className={`relative p-3 rounded-2xl ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-br-sm'
                          : msg.type === 'system'
                          ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-bl-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.type === 'bot' && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                              <Bot className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                        {msg.type === 'system' && (
                          <div className="flex-shrink-0">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] opacity-70">{msg.time}</span>
                            {msg.type === 'bot' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => copyToClipboard(msg.text, msg.id)}
                                  className="opacity-50 hover:opacity-100 transition"
                                >
                                  {copiedId === msg.id ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                                <button
                                  onClick={() => speak(msg.text)}
                                  className="opacity-50 hover:opacity-100 transition"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Buttons for Bot Messages */}
                    {msg.type === 'bot' && !userFeedback[msg.id] && msg.id !== 1 && (
                      <div className="flex items-center gap-2 mt-1 ml-8">
                        <button
                          onClick={() => handleFeedback(msg.id, true)}
                          className="text-gray-400 hover:text-green-500 transition text-xs flex items-center gap-0.5"
                        >
                          <ThumbsUp className="w-3 h-3" /> Helpful
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, false)}
                          className="text-gray-400 hover:text-red-500 transition text-xs flex items-center gap-0.5"
                        >
                          <ThumbsUp className="w-3 h-3 rotate-180" /> Not helpful
                        </button>
                      </div>
                    )}

                    {/* Suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-8">
                        {msg.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-red-300 hover:text-red-500 transition shadow-sm hover:shadow"
                          >
                            {suggestion} <ChevronRight className="w-3 h-3 inline" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white/50">
              <div className="flex gap-2">
                <button
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-lg transition ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  disabled={!isOnline}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isOnline ? "Ask me about visas, universities, or immigration..." : "Reconnecting..."}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 resize-none"
                  rows="1"
                  style={{ maxHeight: '100px' }}
                  disabled={!isOnline}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || !isOnline}
                  className="bg-gradient-to-r from-red-500 to-rose-500 text-white p-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Powered by Gemini AI • Lead generation active • Free consultation
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-bounce {
          animation: bounce 0.8s infinite;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default AICounselor;