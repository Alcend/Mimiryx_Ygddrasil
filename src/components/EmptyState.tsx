import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions?: {
    label: string;
    onClick: () => void;
    primary?: boolean;
  }[];
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  actions = [], 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-xl border border-dashed border-border/50 bg-background/30 backdrop-blur-sm h-full min-h-[200px] ${className}`}>
      <div className="text-muted-foreground/50 mb-2">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {description}
      </p>
      
      {actions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                action.primary 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' 
                  : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary border border-border/50'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
