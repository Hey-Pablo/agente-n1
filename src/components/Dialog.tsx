/**
 * Dialog Component
 *
 * Componente de diálogo modal reutilizável
 */

import * as React from 'react';
import {
  Dialog as DialogPrimitive,
  DialogOverlay,
  DialogPortal,
  DialogContent as DialogContentPrimitive,
  DialogTrigger as DialogTriggerPrimitive
} from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

const Dialog = DialogPrimitive;
export { Dialog, DialogOverlay, DialogPortal };

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogContentPrimitive> {
  className?: string;
  children: React.ReactNode;
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContentPrimitive>,
  DialogContentProps
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
    <DialogContentPrimitive
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg sm:border sm:shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </DialogContentPrimitive>
  </DialogPortal>
));

export const DialogHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="flex flex-col space-y-1.5 px-6 py-4" {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="text-lg font-semibold leading-none tracking-tight" {...props}>
    {children}
  </h2>
);

export const DialogDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="text-sm text-muted-foreground" {...props}>
    {children}
  </p>
);

export const DialogFooter = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="flex justify-between gap-2 p-6" {...props}>
    {children}
  </div>
);

export const DialogTrigger = DialogTriggerPrimitive;