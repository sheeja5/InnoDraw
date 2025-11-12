import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, Model } from '../types';
import { createChat } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaContext: string;
  modelContext: Model | null;
}

const suggestedPrompts = [
    "What real-world parts would I need?",
    "Can you suggest a simpler design?",
    "How could I improve this project?",
    "Explain the most difficult part."
];

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, ideaContext, modelContext }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modelContext) {
      const componentDetails = modelContext.components
        .filter(c => c.type === 'image')
        .map(c => `"${c.label}" (${c.description})`)
        .join(', ');

      const contextForAI = `The user's project idea is: "${ideaContext}". The generated model has these components: ${componentDetails}. You are now an expert project mentor. Your goal is to help the user turn this conceptual model into a real, innovative project. Start the conversation by greeting the user, showing you understand their project, and then ask how you can help them get started.`;
      
      const initialGreeting = `I've analyzed your model for the "${ideaContext}". It looks like a great starting point! I'm here to help you turn this idea into a real project. What's on your mind? You can ask about real-world parts, alternative designs, or the first steps to building it.`;

      const newChat = createChat([
        { role: 'user', parts: [{ text: contextForAI }] },
        { role: 'model', parts: [{ text: initialGreeting }] }
      ]);
      
      setChat(newChat);
      setMessages([{ role: 'model', text: initialGreeting }]);
      setShowSuggestions(true);
    }
  }, [isOpen, ideaContext, modelContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (prompt?: string) => {
    const textToSend = prompt || input;
    if (!textToSend.trim() || !chat) return;
    
    setShowSuggestions(false);
    const userMessage: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessageStream({ message: textToSend });
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '...' }]);

      for await (const chunk of response) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = modelResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up">
        <header className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-teal-500" />
            <h2 className="text-lg font-bold">AI Project Mentor</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <CloseIcon className="w-6 h-6 text-slate-500" />
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {showSuggestions && messages.length === 1 && (
             <div className="flex justify-start">
                <div className="max-w-md p-3 rounded-xl bg-slate-100 text-slate-800 animate-fade-in-up">
                    <p className="text-sm font-semibold mb-2">Here are some ideas to get you started:</p>
                    <div className="grid grid-cols-2 gap-2">
                        {suggestedPrompts.map(prompt => (
                            <button key={prompt} onClick={() => handleSend(prompt)} className="text-left text-sm p-2 bg-white rounded-lg hover:bg-teal-50 transition-colors shadow-sm">
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
             </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
               <div className="max-w-md p-3 rounded-xl bg-slate-100 text-slate-800">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></div>
                </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t border-slate-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Ask your project mentor..."
              className="flex-grow p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-shadow duration-200"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-teal-500 text-white font-semibold py-3 px-5 rounded-lg hover:bg-teal-600 disabled:bg-slate-400"
            >
              Send
            </button>
          </div>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatModal;