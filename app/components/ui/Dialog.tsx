// components/ui/Dialog.tsx

'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import Image from 'next/image';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={`fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-bg-main dark:bg-dark-bg-main p-7 rounded-2xl shadow-heavy ${className}`}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute top-3 right-3 p-2 rounded-full transition-colors hover:bg-bg-light dark:hover:bg-dark-bg-light">
        <Image src="/icons/close.svg" alt="Close" width={20} height={20} />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`text-center ${className}`} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={`text-2xl font-semibold text-text-dark dark:text-dark-text-dark ${className}`}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
