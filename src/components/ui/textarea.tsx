
import * as React from 'react'

import { cn } from '../../lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoExpand?: boolean;
  minHeight?: number | string;
  maxHeight?: number | string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoExpand = false, minHeight, maxHeight, value, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => textareaRef.current!);

    React.useEffect(() => {
      if (autoExpand && textareaRef.current) {
        if (minHeight) {
          textareaRef.current.style.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
          if (textareaRef.current.scrollHeight > (typeof minHeight === 'number' ? minHeight : parseInt(minHeight))) {
            textareaRef.current.style.height = `${minHeight}px`;
          }
        }
        const newHeight = textareaRef.current.scrollHeight;
        if (maxHeight) {
          textareaRef.current.style.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
          if (newHeight > (typeof maxHeight === 'number' ? maxHeight : parseInt(maxHeight))) {
            textareaRef.current.style.overflowY = 'auto';
          } else {
            textareaRef.current.style.overflowY = 'hidden';
          }
        } else {
          textareaRef.current.style.overflowY = 'hidden';
        }
        textareaRef.current.style.height = `${newHeight}px`;
      }
    }, [autoExpand, minHeight, maxHeight, value]);

    return (
        <textarea
          className={cn(
            'flex w-full rounded-base border-2 text-text font-base selection:bg-main selection:text-mtext border-border bg-bw px-3 py-2 text-sm ring-offset-white placeholder:text-text placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-hidden',
            className
          )}
          ref={textareaRef}
          style={{ height: minHeight }}
          {...props}
        />
    );
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
