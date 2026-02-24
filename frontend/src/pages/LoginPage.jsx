import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    Wallet,
    CheckSquare,
    StickyNote,
    Calendar,
    Shield,
    Zap,
    ArrowLeft,
    Check,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import CoretimeLogo from '../assets/CoretimeLogo';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError(null);

        try {
            await login(credentialResponse.credential);
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Failed to sign in. Please try again.');
            setIsLoading(false);
        }
    };

    const handleError = () => {
        setError('Sign in was cancelled or failed. Please try again.');
        setIsLoading(false);
    };

    const features = [
        { icon: Wallet, title: 'Track your finances', desc: 'Income, expenses, and budgets', color: 'bg-indigo-50 text-indigo-600' },
        { icon: CheckSquare, title: 'Manage tasks & chores', desc: 'Stay organized and productive', color: 'bg-emerald-50 text-emerald-600' },
        { icon: StickyNote, title: 'Keep smart notes', desc: 'Ideas, thoughts, and reminders', color: 'bg-amber-50 text-amber-600' },
        { icon: Calendar, title: 'Sync with Google Calendar', desc: 'Bidirectional calendar integration', color: 'bg-violet-50 text-violet-600' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden">
            {/* Enhanced Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/20 to-violet-400/15 rounded-full blur-3xl animate-blob" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/15 to-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-indigo-200/10 via-violet-200/10 to-purple-200/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
            </div>

            {/* Back Button - Enhanced */}
            <div className="absolute top-6 left-6 z-20">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-semibold transition-all px-4 py-2.5 rounded-xl hover:bg-white/80 backdrop-blur-sm text-sm shadow-sm hover:shadow-md border border-slate-200/50 hover:border-indigo-200 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline">Back to Home</span>
                </Link>
            </div>

            <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
                <div className="max-w-6xl w-full grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Left - Enhanced Branding */}
                    <div className="text-center md:text-left space-y-8 animate-fade-in-up">
                        <div className="flex flex-col items-center md:items-start">
                            <div className="mb-6 p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 inline-block">
                                <CoretimeLogo size={56} className="animate-fade-in" />
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight leading-tight">
                                Welcome to{' '}
                                <span className="gradient-text">Coretime</span>
                            </h1>
                            <p className="text-slate-600 max-w-md text-base leading-relaxed">
                                Your all-in-one personal dashboard. Track finances, habits, tasks, goals, and more — beautifully organized in one place.
                            </p>
                        </div>

                        <div className="space-y-3.5">
                            {features.map(({ icon: Icon, title, desc, color }, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-4 group animate-fade-in-up bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 hover:border-indigo-200 hover:shadow-md transition-all`}
                                    style={{ animationDelay: `${200 + idx * 100}ms` }}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform shadow-sm`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm text-slate-900 block">{title}</span>
                                        <span className="text-xs text-slate-500">{desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-5 text-xs pt-4">
                            {[
                                { icon: Shield, label: 'Secure & Private', color: 'text-indigo-600 bg-indigo-50' },
                                { icon: Sparkles, label: 'Free for 2 Months', color: 'text-violet-600 bg-violet-50' },
                                { icon: Check, label: 'No Credit Card', color: 'text-emerald-600 bg-emerald-50' },
                            ].map(({ icon: Icon, label, color }) => (
                                <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${color} font-semibold`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - Enhanced Login Card */}
                    <div className="animate-fade-in-up animation-delay-400">
                        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-200/30 p-8 md:p-12 space-y-7 border border-slate-200/60 relative overflow-hidden">
                            {/* Decorative gradient */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/50 to-violet-100/30 rounded-full blur-3xl -z-10" />
                            
                            <div className="text-center space-y-3 relative">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-2 border border-indigo-100">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Start your free 2-month trial</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Sign In</h2>
                                <p className="text-slate-600 text-sm">Access your personal dashboard</p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in shadow-sm">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            {/* Loading */}
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in">
                                    <div className="relative">
                                        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                        <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-r-violet-400 rounded-full animate-spin animation-delay-200" />
                                    </div>
                                    <p className="text-slate-600 text-sm font-semibold">Signing you in...</p>
                                    <p className="text-slate-400 text-xs">Setting up your dashboard</p>
                                </div>
                            )}

                            {/* Google Login */}
                            {!isLoading && (
                                <div className="space-y-5">
                                    <div className="flex justify-center py-2">
                                        <div className="w-full">
                                            <GoogleLogin
                                                onSuccess={handleSuccess}
                                                onError={handleError}
                                                useOneTap
                                                theme="filled_blue"
                                                size="large"
                                                text="signin_with"
                                                shape="rectangular"
                                                width="100%"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-white text-slate-400 font-medium">Quick & Secure</span>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Zap className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-indigo-900 mb-1">Why sign in with Google?</p>
                                                <p className="text-xs text-indigo-700 leading-relaxed">
                                                    One-click access, automatic calendar sync, and secure authentication. We never see your password.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-100 space-y-4">
                                <p className="text-xs text-slate-500 text-center leading-relaxed">
                                    By signing in, you agree to sync your data with Google Calendar. Your information is encrypted and secure.
                                </p>
                                <div className="flex justify-center gap-4 text-xs text-slate-400 font-medium">
                                    <Link to="/terms" className="hover:text-indigo-600 transition-colors underline-offset-2 hover:underline">Terms of Service</Link>
                                    <span className="text-slate-300">•</span>
                                    <Link to="/privacy" className="hover:text-indigo-600 transition-colors underline-offset-2 hover:underline">Privacy Policy</Link>
                                </div>
                            </div>
                        </div>

                        {/* Trust indicators below card */}
                        <div className="mt-6 text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Trusted by 10,000+ users worldwide</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
