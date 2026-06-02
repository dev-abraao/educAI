import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from './ui';

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  closeOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  maxWidth?: keyof typeof maxWidthClasses;
  closeOnBackdrop?: boolean;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:items-center">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onMouseDown={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl outline-none sm:p-8',
          maxWidthClasses[maxWidth],
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {(title || description) && (
          <div className="mb-6 pr-10">
            {title && (
              <h2 id={titleId} className="text-2xl font-black text-white">
                {title}
              </h2>
            )}
            {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
