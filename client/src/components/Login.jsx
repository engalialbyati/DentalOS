import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from './ui';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Unable to sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-stretch bg-slate-100">
            {/* Brand panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 to-brand-500 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10" />
                <div className="absolute bottom-10 -left-10 w-56 h-56 rounded-full bg-white/10" />
                <div className="relative flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur">
                        <Activity size={24} />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight">
                        Dent<span className="opacity-80">OS</span>
                    </span>
                </div>
                <div className="relative">
                    <h1 className="text-4xl font-extrabold leading-tight">
                        Modern dental<br />clinic management.
                    </h1>
                    <p className="mt-4 text-brand-50/90 max-w-md">
                        Patients, treatments, scheduling, inventory and billing — all in one secure, fast workspace.
                    </p>
                </div>
                <p className="relative text-brand-50/70 text-sm">© {new Date().getFullYear()} DentOS. All rights reserved.</p>
            </div>

            {/* Form panel */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                            <Activity size={22} />
                        </div>
                        <span className="text-2xl font-extrabold text-slate-800">DentOS</span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
                    <p className="text-slate-500 text-sm mt-1 mb-8">Sign in to your clinic dashboard.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    className="pl-10"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    type={showPw ? 'text' : 'password'}
                                    className="pl-10 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <Button type="submit" size="lg" className="w-full" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
