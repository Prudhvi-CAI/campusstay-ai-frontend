import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Send,
  User as UserIcon,
  Bot,
  RotateCcw,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage, PropertySummary, College } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { CollegeSearchCombobox } from '../components/CollegeSearchCombobox';
import { useAuth } from '../context/AuthContext';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string | undefined>();
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | undefined>(
    user?.student_profile?.college_id
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialQuery = searchParams.get('q');
  const urlCollegeId = searchParams.get('college_id') ? Number(searchParams.get('college_id')) : undefined;

  useEffect(() => {
    api.colleges.list().then(setColleges).catch(console.error);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial welcome message or query trigger
  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery, urlCollegeId || selectedCollegeId);
    } else {
      setMessages([
        {
          sender: 'assistant',
          content:
            "Hi there! 👋 I'm **CampusStay AI**, your student housing assistant. " +
            "Tell me about your college, budget, preferred room sharing, or lifestyle needs (e.g. *'I need a 2-sharing PG near SRM AP under ₹8,000 with food'*). " +
            "I'll search our live database and find your best verified options!",
          follow_up_suggestions: [
            "2-sharing PG near SRM AP under ₹8,000",
            "Single room with AC near GITAM Vizag",
            "Quiet study hostel near KL University",
            "Girls PG with food and WiFi near VIT-AP",
          ],
        },
      ]);
    }
  }, []);

  const handleSendMessage = async (textToSend: string, collegeIdOverride?: number) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const resp = await api.chat.send({
        message: textToSend,
        session_uuid: sessionUuid,
        college_id: collegeIdOverride || selectedCollegeId,
      });

      setSessionUuid(resp.session_uuid);

      const botMsg: ChatMessage = {
        sender: 'assistant',
        content: resp.message,
        properties: resp.properties,
        follow_up_suggestions: resp.follow_up_suggestions,
        is_smart_empty_state: resp.is_smart_empty_state,
        sources: resp.sources,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content:
            "I'm sorry, I encountered a temporary connection issue. You can still browse all active listings directly on the Explore page.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleResetChat = () => {
    setSessionUuid(undefined);
    setMessages([
      {
        sender: 'assistant',
        content:
          "Chat reset! What student accommodation can I help you find next?",
        follow_up_suggestions: [
          "Rooms under ₹6,000",
          "Single room near my campus",
          "2-sharing with food & WiFi",
        ],
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Header bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>CampusStay AI Chatbot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h2>
            <p className="text-[11px] text-slate-400">Live verified database grounding • Zero hallucinations</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48 sm:w-56">
            <CollegeSearchCombobox
              colleges={colleges}
              selectedCollegeId={selectedCollegeId}
              onSelect={setSelectedCollegeId}
              placeholder="Search campus..."
              allOptionLabel="Campus: Any"
              buttonClassName="py-1.5 px-3"
            />
          </div>

          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            title="Reset conversation"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.map((msg, idx) => {
          const isWarning =
            msg.sender === 'assistant' &&
            (msg.content.includes('Off-Topic Query Warning') ||
              msg.content.includes('⚠️') ||
              msg.content.toLowerCase().includes('off-topic'));

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isWarning
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? (
                  <UserIcon size={16} />
                ) : isWarning ? (
                  <AlertTriangle size={16} />
                ) : (
                  <Bot size={16} />
                )}
              </div>

              {/* Message Bubble Container */}
              <div
                className={`space-y-3 max-w-[88%] sm:max-w-[80%] ${
                  msg.sender === 'user' ? 'items-end text-right' : 'items-start text-left'
                }`}
              >
                {isWarning ? (
                  /* ChatGPT-style Warning Callout Box */
                  <div className="p-4 sm:p-5 rounded-2xl text-sm leading-relaxed bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-500/40 dark:border-amber-500/50 text-amber-950 dark:text-amber-200 shadow-md shadow-amber-500/5 rounded-tl-none space-y-3">
                    <div className="flex items-center gap-2.5 font-bold text-amber-800 dark:text-amber-300 pb-2 border-b border-amber-500/20 text-sm sm:text-base">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <AlertTriangle size={17} />
                      </div>
                      <span>Off-Topic Domain Restriction Warning</span>
                    </div>
                    <div className="whitespace-pre-wrap font-medium">
                      {msg.content.replace(/^⚠️\s*\*\*Off-Topic Query Warning\*\*\s*/i, '')}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/10'
                        : 'bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                )}

              {/* Embedded Property Cards in Chat */}
              {msg.properties && msg.properties.length > 0 && (
                <div className="pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {msg.properties.map((prop) => (
                      <PropertyCard key={prop.id} property={prop} />
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Suggestion Chips */}
              {msg.follow_up_suggestions && msg.follow_up_suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.follow_up_suggestions.map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-xs text-slate-400 ml-2 font-medium">Checking live bed inventory & ranking matches...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="shrink-0">
        <form
          onSubmit={handleFormSubmit}
          className="relative p-2 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type what you need (e.g., 'Compare top 2', 'Single room under ₹6,500', 'Which is closest?')..."
            className="flex-1 px-3 py-2 bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition disabled:opacity-40 shadow-md shadow-indigo-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
