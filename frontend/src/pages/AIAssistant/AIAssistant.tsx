import { useState, useRef, useEffect } from 'react';
import { Sparkles, Trash2, Filter } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types/ai';
import { getMockResponse } from '../../data/aiMockResponses';
import { ChatMessage } from '../../components/ai/ChatMessage';
import { ChatInput } from '../../components/ai/ChatInput';
import { StarterQuestions } from '../../components/ai/StarterQuestions';
import { initialProjects } from '../../data/projectsData';

export const AIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectContext, setProjectContext] = useState<string>('ALL');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessageType = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const responseMsg = await getMockResponse(content);
      setMessages(prev => [...prev, responseMsg]);
    } catch (error) {
      const errorMsg: ChatMessageType = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: "Unable to connect to the AI Assistant service. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] max-w-4xl mx-auto pb-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
            AI Assistant
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Query project context, task bottlenecks, and workflow risk analysis.
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-text-muted font-medium">
            <Filter size={13} />
            Context:
          </div>
          <select
            value={projectContext}
            onChange={e => setProjectContext(e.target.value)}
            className="py-1.5 pl-2.5 pr-7 border border-border rounded-md bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Projects</option>
            {initialProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1 text-xs font-medium"
              aria-label="Clear Conversation"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Conversation Workspace */}
      <div className="flex-1 bg-surface border border-border rounded-lg flex flex-col overflow-hidden mb-3 relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-3">
                <Sparkles size={20} className="text-primary" />
              </div>
              <h2 className="text-base font-semibold text-text-primary mb-1">ProjectPulse Assistant</h2>
              <p className="text-xs text-text-muted mb-6">
                Ask questions to query risk intelligence, status trends, and dependency chains.
              </p>
              <StarterQuestions onSelect={handleSendMessage} />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-text-muted py-2">
                  <Sparkles size={14} className="text-primary animate-spin" />
                  <span>Analyzing workspace data...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0">
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        <p className="text-[11px] text-text-muted text-center mt-2">
          AI Assistant is operating in <span className="font-mono text-text-secondary">Mock Demo Mode</span>.
        </p>
      </div>
    </div>
  );
};

