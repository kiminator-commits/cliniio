import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onOpenChange(false);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
      />
      <div className="relative z-50">{children}</div>
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-background rounded-lg shadow-lg p-6 w-full max-w-md mx-auto ${className}`}
    >
      {children}
    </div>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
    >
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className = '',
}) => {
  return (
    <h2
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    >
      {children}
    </h2>
  );
};

const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className = '',
}) => {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
  );
};

const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
    >
      {children}
    </div>
  );
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
