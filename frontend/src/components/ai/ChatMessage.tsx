import { Sparkles, User, AlertCircle, FileText } from 'lucide-react';
import type { ChatMessage as ChatMessageType, EvidenceItem } from '../../types/ai';

export const SupportingEvidence = ({ evidence }: { evidence: EvidenceItem[] }) => {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-neutral-50 border border-border rounded-md">
      <div className="flex items-center gap-1.5 mb-2">
        <FileText size={13} className="text-text-muted" />
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Supporting Evidence</span>
      </div>
      <div className="space-y-1.5">
        {evidence.map(item => (
          <div key={item.id} className="text-xs bg-surface p-2 rounded border border-border">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-mono font-semibold text-primary bg-neutral-100 px-1 py-0.2 rounded uppercase">
                {item.type}
              </span>
              <span className="font-medium text-text-primary">{item.title}</span>
            </div>
            {item.snippet && (
              <p className="text-[11px] text-text-muted leading-relaxed italic border-l border-border pl-2 mt-1">
                "{item.snippet}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChatMessage = ({ message }: { message: ChatMessageType }) => {
  const isUser = message.role === 'user';
  
  if (isUser) {
    return (
      <div className="flex flex-col items-end mb-4">
        <div className="flex items-center gap-1.5 mb-1 text-xs text-text-muted">
          <span>You</span>
          <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center">
            <User size={11} className="text-text-secondary" />
          </div>
        </div>
        <div className="max-w-[85%] bg-primary text-white px-3.5 py-2.5 rounded-lg text-xs leading-relaxed font-normal">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start mb-4">
      <div className="flex items-center gap-1.5 mb-1 text-xs font-medium text-text-primary">
        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${message.isError ? 'bg-rose-100' : 'bg-neutral-100 border border-neutral-200'}`}>
          {message.isError ? <AlertCircle size={12} className="text-rose-600" /> : <Sparkles size={12} className="text-primary" />}
        </div>
        <span>ProjectPulse Assistant</span>
      </div>
      
      <div className="w-full max-w-[90%] md:max-w-[85%]">
        <div className={`px-4 py-3 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${
          message.isError 
            ? 'bg-rose-50 text-rose-900 border border-rose-200' 
            : 'bg-surface border border-border text-text-primary'
        }`}>
          {message.content}
          
          {message.evidence && message.evidence.length > 0 && (
            <SupportingEvidence evidence={message.evidence} />
          )}
        </div>
      </div>
    </div>
  );
};

