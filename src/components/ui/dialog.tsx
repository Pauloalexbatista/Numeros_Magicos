'use client';

import * as React from "react"

const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            {/* Content Container */}
            <div className="relative z-50 w-full max-w-lg p-4">
                {children}
            </div>
        </div>
    );
}

const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg w-full ${className || ''}`}>
            {children}
        </div>
    )
}

const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`flex flex-col space-y-1.5 p-6 text-center sm:text-left ${className || ''}`}>
            {children}
        </div>
    )
}

const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <h2 className={`text-lg font-semibold leading-none tracking-tight text-white ${className || ''}`}>
            {children}
        </h2>
    )
}

const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <p className={`text-sm text-zinc-400 ${className || ''}`}>
            {children}
        </p>
    )
}

const DialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0 ${className || ''}`}>
            {children}
        </div>
    )
}

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
}
