import { MessageSquarePlus } from 'lucide-react';

const QUESTIONS = [
  "Which tasks are overdue?",
  "Which projects are currently at risk?",
  "What is blocking ProjectPulse?",
  "Show me the workload for my team.",
  "Which high-priority tasks are approaching their deadlines?"
];

interface StarterQuestionsProps {
  onSelect: (question: string) => void;
}

export const StarterQuestions = ({ onSelect }: StarterQuestionsProps) => {
  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-text-muted mb-3 flex items-center justify-center gap-1.5">
        <MessageSquarePlus size={13} />
        Suggested Prompts
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="text-left px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-border rounded-md text-xs text-text-primary transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

