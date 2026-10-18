import React from 'react';
import { cn } from '../../lib/cn';

// ---------------- Button ----------------
const buttonVariants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm',
    outline: 'border border-brand-500 text-brand-600 hover:bg-brand-50',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
    const sizes = {
        sm: 'px-3 py-1.5 text-sm rounded-lg',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-5 py-2.5 text-base rounded-xl',
        icon: 'p-2 rounded-lg',
    };
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-400/40',
                buttonVariants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

// ---------------- Card ----------------
export function Card({ className, children, ...props }) {
    return (
        <div className={cn('card p-5', className)} {...props}>
            {children}
        </div>
    );
}

// ---------------- PageHeader ----------------
export function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}

// ---------------- Form fields ----------------
export function Label({ children, required }) {
    return (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {children}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/30 transition',
                className
            )}
            {...props}
        />
    );
}

export function Textarea({ className, ...props }) {
    return (
        <textarea
            className={cn(
                'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/30 transition',
                className
            )}
            {...props}
        />
    );
}

export function Select({ className, children, ...props }) {
    return (
        <select
            className={cn(
                'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/30 transition',
                className
            )}
            {...props}
        >
            {children}
        </select>
    );
}

export function Field({ label, required, error, children }) {
    return (
        <div>
            {label && <Label required={required}>{label}</Label>}
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// ---------------- Badge ----------------
const badgeColors = {
    gray: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    brand: 'bg-brand-100 text-brand-700',
};

export function Badge({ color = 'gray', className, children }) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
                badgeColors[color],
                className
            )}
        >
            {children}
        </span>
    );
}

// ---------------- Spinner / Loading ----------------
export function Spinner({ className }) {
    return (
        <div className={cn('flex items-center justify-center p-8', className)}>
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
    );
}

// ---------------- EmptyState ----------------
export function EmptyState({ icon: Icon, title, message, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12 px-4">
            {Icon && (
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                    <Icon size={26} />
                </div>
            )}
            <p className="text-slate-700 font-semibold">{title}</p>
            {message && <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

// ---------------- StatCard ----------------
export function StatCard({ icon: Icon, label, value, color = 'brand', trend }) {
    const colorMap = {
        brand: 'bg-brand-50 text-brand-600',
        green: 'bg-emerald-50 text-emerald-600',
        red: 'bg-red-50 text-red-600',
        amber: 'bg-amber-50 text-amber-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <Card className="flex items-center gap-4">
            {Icon && (
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', colorMap[color])}>
                    <Icon size={22} />
                </div>
            )}
            <div className="min-w-0">
                <p className="text-sm text-slate-500 truncate">{label}</p>
                <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
                {trend && <p className="text-xs text-slate-400 mt-0.5">{trend}</p>}
            </div>
        </Card>
    );
}

// ---------------- Modal ----------------
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null;
    const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className={cn('relative bg-white rounded-2xl shadow-xl w-full max-h-[90vh] flex flex-col', sizes[size])}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
